import { useEffect, useState } from 'react'
import { Button } from '@/components/common/Button'
import { Field } from '@/components/forms/Field'
import { Input } from '@/components/forms/Input'
import { PlaceField } from '@/components/forms/PlaceField'
import { Select } from '@/components/forms/Select'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import { RELATION_LABEL, type ChartProfile, type ProfileRelation } from '@/data/profiles'
import type { NewProfile } from '@/profiles/profiles-context'
import type { BirthPlace } from '@/types/user'
import { cn } from '@/utils/cn'

export interface ProfileSheetProps {
  isOpen: boolean
  onClose: () => void
  /** Omitted when adding. */
  editing?: ChartProfile
  onSave: (profile: NewProfile) => void
  onDelete?: (id: string) => void
}

interface Errors {
  name?: string
  date?: string
  time?: string
  place?: string
}

/** Only the relations a saved chart can have. `self` is the account itself. */
const RELATIONS: ProfileRelation[] = ['family', 'friend', 'other']

/**
 * Adding or editing a saved chart.
 *
 * The same four birth fields as the account's own, plus who the person is —
 * which is what makes a list of charts navigable rather than a list of names.
 */
export function ProfileSheet({ isOpen, onClose, editing, onSave, onDelete }: ProfileSheetProps) {
  const [name, setName] = useState('')
  const [relation, setRelation] = useState<ProfileRelation>('family')
  const [note, setNote] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [timeUnknown, setTimeUnknown] = useState(false)
  const [place, setPlace] = useState<BirthPlace | null>(null)
  const [errors, setErrors] = useState<Errors>({})

  // Load the profile being edited, or reset to blank for a new one.
  useEffect(() => {
    if (!isOpen) return
    setName(editing?.name ?? '')
    setRelation(editing?.relation === 'self' ? 'family' : (editing?.relation ?? 'family'))
    setNote(editing?.note ?? '')
    setDate(editing?.birthDetails.date ?? '')
    setTime(editing?.birthDetails.time ?? '')
    setTimeUnknown(Boolean(editing?.birthDetails.timeUnknown))
    setPlace(editing?.birthDetails.place ?? null)
    setErrors({})
  }, [isOpen, editing])

  const clear = (field: keyof Errors) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))

  const submit = () => {
    const found: Errors = {}
    if (name.trim().length < 2) found.name = 'Enter a name.'
    if (!date) found.date = 'Enter a date of birth.'
    else if (new Date(date) > new Date()) found.date = 'That date is in the future.'
    if (!timeUnknown && !time) found.time = 'Enter a time, or say it is unknown.'
    if (!place) found.place = 'Pick the nearest listed town.'

    setErrors(found)
    if (Object.keys(found).length > 0) return

    onSave({
      name: name.trim(),
      relation,
      note: note.trim() || undefined,
      birthDetails: {
        fullName: name.trim(),
        date,
        time: timeUnknown ? '12:00' : time,
        timeUnknown,
        place: place as BirthPlace,
      },
    })
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? `Edit ${editing.name}` : 'Add a chart'}
      description={
        editing
          ? 'Changing these recalculates this chart. Readings drawn from it stay.'
          : 'Family, a friend, a relative — anyone whose chart you want to read.'
      }
      footer={
        <div className={cn('flex gap-3', editing && onDelete ? 'flex-col sm:flex-row-reverse' : '')}>
          <Button fullWidth onClick={submit}>
            {editing ? 'Save changes' : 'Add chart'}
          </Button>
          {editing && onDelete && (
            <Button variant="danger" fullWidth onClick={() => onDelete(editing.id)}>
              Remove this chart
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-5">
        <Field label="Name" error={errors.name}>
          <Input
            autoComplete="off"
            placeholder="As written on their birth record"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              clear('name')
            }}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Relationship">
            <Select
              options={RELATIONS.map((value) => ({ value, label: RELATION_LABEL[value] }))}
              value={relation}
              onChange={(event) => setRelation(event.target.value as ProfileRelation)}
            />
          </Field>

          <Field label="Note" help="Optional — “Mother”, “Colleague”.">
            <Input
              autoComplete="off"
              placeholder="How you know them"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Date of birth" error={errors.date}>
            <Input
              type="date"
              mono
              max={new Date().toISOString().slice(0, 10)}
              value={date}
              onChange={(event) => {
                setDate(event.target.value)
                clear('date')
              }}
            />
          </Field>

          <Field label="Time of birth" error={errors.time}>
            <div className="space-y-2.5">
              <Input
                type="time"
                mono
                value={time}
                disabled={timeUnknown}
                onChange={(event) => {
                  setTime(event.target.value)
                  clear('time')
                }}
              />
              <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-purple">
                <input
                  type="checkbox"
                  checked={timeUnknown}
                  onChange={(event) => {
                    setTimeUnknown(event.target.checked)
                    clear('time')
                  }}
                  className="size-4 accent-[var(--color-navy)]"
                />
                Time unknown
              </label>
            </div>
          </Field>
        </div>

        <Field
          label="Birth place"
          error={errors.place}
          help="Start typing a town — pick the nearest listed one."
        >
          <PlaceField
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
