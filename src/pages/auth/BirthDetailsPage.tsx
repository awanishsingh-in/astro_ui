import { Lock } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { useToast } from '@/components/feedback/toast-context'
import { BirthDateWheel, BirthTimeWheel } from '@/components/forms/BirthWheels'
import { Field } from '@/components/forms/Field'
import { Input } from '@/components/forms/Input'
import { PlaceField } from '@/components/forms/PlaceField'
import { useAuth } from '@/auth/auth-context'
import { AuthLayout } from '@/layouts/AuthLayout'
import { paths } from '@/routes/paths'
import { toAppError } from '@/services/client'
import {
  GENDER_LABEL,
  GENDER_OPTIONS,
  type BirthDetails,
  type BirthPlace,
  type Gender,
} from '@/types/user'
import { cn } from '@/utils/cn'
import { formatCoordinates } from '@/utils/format'

const ADVENTURE_BTN =
  'rounded-2xl border-0 bg-gradient-to-r from-[#7c4dff] to-[#3a7bd5] text-white shadow-[0_12px_32px_-12px_rgba(124,77,255,0.75)] hover:from-[#8b5cff] hover:to-[#4a8be5] active:from-[#6b3de8] active:to-[#2f6bc0] focus-visible:outline-[#c4a0ff]'

const FIELD_ADV = '[&_label]:text-white/70 [&_p]:text-white/40'

interface Errors {
  fullName?: string
  date?: string
  time?: string
  place?: string
  gender?: string
}

function defaultBirthDate() {
  const y = new Date().getFullYear() - 25
  return `${y}-01-01`
}

/** Birth details — same stacked form, login purple/cyan colors. */
export default function BirthDetailsPage() {
  const { completeSignup } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [fullName, setFullName] = useState('')
  const [date, setDate] = useState(defaultBirthDate)
  const [time, setTime] = useState('12:00')
  const [timeUnknown, setTimeUnknown] = useState(false)
  const [place, setPlace] = useState<BirthPlace | null>(null)
  const [gender, setGender] = useState<Gender | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clearError = (field: keyof Errors) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))

  const validate = (): Errors => {
    const next: Errors = {}
    if (fullName.trim().length < 2) next.fullName = 'Enter the name on your birth record.'
    if (!date) next.date = 'Enter your date of birth.'
    else if (new Date(date) > new Date()) next.date = 'That date is in the future.'
    if (!timeUnknown && !time) next.time = 'Enter your time of birth, or say you don’t know it.'
    if (!place) next.place = 'Start typing a town and pick the nearest listed one.'
    if (!gender) next.gender = 'Choose one option.'
    return next
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const details: BirthDetails = {
      fullName: fullName.trim(),
      date,
      // Noon is the convention when the time is unknown: it minimises how far
      // the lagna can be wrong in either direction.
      time: timeUnknown ? '12:00' : time,
      timeUnknown,
      place: place as BirthPlace,
      gender: gender as Gender,
    }

    setIsSubmitting(true)
    try {
      await completeSignup(details)
      navigate(paths.calculating, { replace: true })
    } catch (caught) {
      const appError = toAppError(caught)
      toast.error('Could not calculate your chart', { description: appError.message })
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout variant="stacked" tone="adventure" wide fitViewport>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto flex w-full max-w-2xl flex-col gap-4"
      >
        <header className="space-y-1">
          <h1 className="text-2xl font-bold uppercase tracking-tight text-white sm:text-[1.75rem]">
            Fill your birth details
          </h1>
          <p className="text-sm text-white/50">Entered once, editable later from your account.</p>
        </header>

        <div className="relative rounded-2xl border border-white/10 bg-[#0e0820]/80 p-3.5 sm:p-4">
          <div className="relative flex flex-col gap-3">
            <Field
              appearance="plain"
              label="Full name"
              error={errors.fullName}
              className={FIELD_ADV}
            >
              <Input
                autoComplete="name"
                autoFocus
                tone="adventure"
                inputSize="md"
                placeholder="As written on your birth record"
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value)
                  clearError('fullName')
                }}
              />
            </Field>

            <Field appearance="plain" label="Gender" error={errors.gender} className={FIELD_ADV}>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Gender">
                {GENDER_OPTIONS.map((option) => {
                  const active = gender === option
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        setGender(option)
                        clearError('gender')
                      }}
                      className={cn(
                        'rounded-xl border px-2 py-2 text-center text-sm font-medium transition-colors',
                        active
                          ? 'border-[#c4a0ff]/50 bg-[#7c4dff]/25 text-white'
                          : 'border-white/10 bg-[#0b071c] text-white/55 hover:border-white/20 hover:text-white',
                      )}
                    >
                      {GENDER_LABEL[option]}
                    </button>
                  )
                })}
              </div>
            </Field>

            <div className="grid gap-2.5 sm:grid-cols-[1.15fr_1fr]">
              <Field
                appearance="plain"
                label="Date of birth"
                error={errors.date}
                labelHidden
                className={FIELD_ADV}
              >
                <BirthDateWheel
                  value={date}
                  onChange={(next) => {
                    setDate(next)
                    clearError('date')
                  }}
                />
              </Field>

              <Field
                appearance="plain"
                label="Time of birth"
                error={errors.time}
                labelHidden
                className={FIELD_ADV}
                help={
                  timeUnknown
                    ? 'Noon is used instead. You can add an exact time later.'
                    : undefined
                }
              >
                <div className="space-y-2">
                  <BirthTimeWheel
                    value={time}
                    disabled={timeUnknown}
                    onChange={(next) => {
                      setTime(next)
                      clearError('time')
                    }}
                  />
                  <button
                    type="button"
                    aria-pressed={timeUnknown}
                    onClick={() => {
                      setTimeUnknown((prev) => !prev)
                      clearError('time')
                    }}
                    className={cn(
                      'inline-flex w-fit items-center gap-2 rounded-lg border px-2.5 py-1 text-xs transition-colors',
                      timeUnknown
                        ? 'border-[#c4a0ff]/40 bg-[#7c4dff]/20 text-[#c4a0ff]'
                        : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'flex size-3.5 items-center justify-center rounded-xs border',
                        timeUnknown
                          ? 'border-[#c4a0ff] bg-[#7c4dff] text-white'
                          : 'border-white/25',
                      )}
                    >
                      {timeUnknown && (
                        <svg viewBox="0 0 12 12" className="size-2" fill="none">
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
            </div>

            <Field
              appearance="plain"
              label="Birth place"
              error={errors.place}
              className={FIELD_ADV}
              help={
                place
                  ? `${formatCoordinates(place.latitude, place.longitude)} · geocoded from ${place.label}`
                  : 'Start typing a town — pick the nearest listed one.'
              }
            >
              <PlaceField
                value={place}
                tone="adventure"
                onChange={(next) => {
                  setPlace(next)
                  if (next) clearError('place')
                }}
                invalid={Boolean(errors.place)}
              />
            </Field>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            type="submit"
            variant="ghost"
            fullWidth
            size="lg"
            loading={isSubmitting}
            className={ADVENTURE_BTN}
          >
            {isSubmitting ? 'Calculating' : 'Calculate my chart'}
          </Button>
          <p className="flex items-center justify-center gap-2 text-xs text-white/35">
            <Lock aria-hidden className="size-3.5" />
            Used only to calculate your chart
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}
