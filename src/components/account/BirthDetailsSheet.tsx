import { Lock, MoonStar, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/common/Button'
import { Field } from '@/components/forms/Field'
import { Input } from '@/components/forms/Input'
import { PlaceField } from '@/components/forms/PlaceField'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import type { BirthDetails, BirthPlace } from '@/types/user'
import { cn } from '@/utils/cn'
import { formatCoordinates } from '@/utils/format'

export interface BirthDetailsSheetProps {
  isOpen: boolean
  onClose: () => void
  details: BirthDetails
  onSave: (details: BirthDetails) => Promise<void>
  isSaving: boolean
}

interface Errors {
  fullName?: string
  date?: string
  time?: string
  place?: string
}

/**
 * Editing the four things a chart is calculated from.
 *
 * A sheet rather than a page, because this is a short edit the user should be
 * able to abandon — and because the reference is explicit that on a phone a
 * sheet beats an extra screen. It centres itself on desktop.
 */
export function BirthDetailsSheet({
  isOpen,
  onClose,
  details,
  onSave,
  isSaving,
}: BirthDetailsSheetProps) {
  const [fullName, setFullName] = useState(details.fullName)
  const [date, setDate] = useState(details.date)
  const [time, setTime] = useState(details.time)
  const [timeUnknown, setTimeUnknown] = useState(Boolean(details.timeUnknown))
  const [place, setPlace] = useState<BirthPlace | null>(details.place)
  const [errors, setErrors] = useState<Errors>({})

  // Reopening after a cancel should show what is saved, not the abandoned edit.
  useEffect(() => {
    if (!isOpen) return
    setFullName(details.fullName)
    setDate(details.date)
    setTime(details.time)
    setTimeUnknown(Boolean(details.timeUnknown))
    setPlace(details.place)
    setErrors({})
  }, [isOpen, details])

  const clear = (field: keyof Errors) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))

  const submit = async () => {
    const found: Errors = {}
    if (fullName.trim().length < 2) found.fullName = 'Enter the name on your birth record.'
    if (!date) found.date = 'Enter your date of birth.'
    else if (new Date(date) > new Date()) found.date = 'That date is in the future.'
    if (!timeUnknown && !time) found.time = 'Enter a time, or say you don’t know it.'
    if (!place) found.place = 'Pick the nearest listed town.'

    setErrors(found)
    if (Object.keys(found).length > 0) return

    await onSave({
      fullName: fullName.trim(),
      date,
      time: timeUnknown ? '12:00' : time,
      timeUnknown,
      place: place as BirthPlace,
    })
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Edit birth details"
      description="Changing these recalculates your chart. Past questions and answers stay."
      footer={
        <div className="space-y-3">
          <Button fullWidth onClick={() => void submit()} loading={isSaving}>
            {isSaving ? 'Recalculating your chart' : 'Save and recalculate'}
          </Button>
          <p className="flex items-center justify-center gap-2 text-xs text-muted">
            <Lock aria-hidden className="size-3.5" />
            Used only to calculate your chart
          </p>
        </div>
      }
    >
      <div className="space-y-4">
        <Field appearance="plain" label="Full name" error={errors.fullName}>
          <Input
            tone="celestial"
            autoComplete="name"
            value={fullName}
            onChange={(event) => {
              setFullName(event.target.value)
              clear('fullName')
            }}
          />
        </Field>

        <Field appearance="plain" label="Date of birth" error={errors.date} help="Day, month, year">
          <Input
            tone="celestial"
            type="date"
            mono
            icon={<Sun strokeWidth={1.75} />}
            max={new Date().toISOString().slice(0, 10)}
            value={date}
            onChange={(event) => {
              setDate(event.target.value)
              clear('date')
            }}
          />
        </Field>

        <Field
          appearance="plain"
          label="Time of birth"
          error={errors.time}
          help={
            timeUnknown
              ? 'Noon is used instead. The lagna and the bhava cusps are the least certain values.'
              : 'As written on your birth record'
          }
        >
          <div className="space-y-2.5">
            <Input
              tone="celestial"
              type="time"
              mono
              icon={<MoonStar strokeWidth={1.75} />}
              value={time}
              disabled={timeUnknown}
              onChange={(event) => {
                setTime(event.target.value)
                clear('time')
              }}
            />
            <button
              type="button"
              aria-pressed={timeUnknown}
              onClick={() => {
                setTimeUnknown((prev) => !prev)
                clear('time')
              }}
              className={cn(
                'inline-flex w-fit items-center gap-2 rounded-control border px-3 py-1.5 text-sm transition-colors duration-150 ease-out-soft',
                timeUnknown
                  ? 'border-copper/50 bg-pale-copper text-copper-shadow'
                  : 'border-border bg-transparent text-muted hover:border-border-strong hover:text-ink',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'flex size-4 items-center justify-center rounded-xs border',
                  timeUnknown ? 'border-copper bg-copper text-midnight' : 'border-border-strong',
                )}
              >
                {timeUnknown && (
                  <svg viewBox="0 0 12 12" className="size-2.5" fill="none">
                    <path
                      d="M2.5 6.2 4.8 8.5 9.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              I don’t know my time
            </button>
          </div>
        </Field>

        <Field
          appearance="plain"
          label="Birth place"
          error={errors.place}
          help={
            place
              ? `${formatCoordinates(place.latitude, place.longitude)} · geocoded from ${place.label}`
              : 'Start typing a town — pick the nearest listed one.'
          }
        >
          <PlaceField
            tone="celestial"
            value={place}
            onChange={(next) => {
              setPlace(next)
              if (next) clear('place')
            }}
            invalid={Boolean(errors.place)}
          />
        </Field>
      </div>
    </BottomSheet>
  )
}
