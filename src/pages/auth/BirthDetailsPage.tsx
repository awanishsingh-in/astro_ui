import { Lock } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { useToast } from '@/components/feedback/toast-context'
import { Field } from '@/components/forms/Field'
import { Input } from '@/components/forms/Input'
import { PlaceField } from '@/components/forms/PlaceField'
import { useAuth } from '@/auth/auth-context'
import { AuthLayout } from '@/layouts/AuthLayout'
import { paths } from '@/routes/paths'
import { toAppError } from '@/services/client'
import {
  GENDER_LABEL,
  type BirthDetails,
  type BirthPlace,
  type Gender,
} from '@/types/user'
import { cn } from '@/utils/cn'
import { formatCoordinates } from '@/utils/format'
import { PANEL_BODY, SIGNUP_PANEL_TITLE, SIGNUP_STEPS } from './flow'

interface Errors {
  fullName?: string
  date?: string
  time?: string
  place?: string
  gender?: string
}

const GENDER_OPTIONS: Gender[] = ['male', 'female', 'undisclosed']

/** A4 / C4 — birth details form. No live chart preview. */
export default function BirthDetailsPage() {
  const { completeSignup } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [fullName, setFullName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
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
    <AuthLayout
      steps={SIGNUP_STEPS}
      currentStep={2}
      panelTitle={SIGNUP_PANEL_TITLE}
      panelBody={<p>{PANEL_BODY}</p>}
      backTo={paths.verify}
      wide
      fitViewport
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto flex w-full max-w-xl flex-col gap-4 lg:gap-3.5"
      >
        <header className="space-y-1">
          <h1 className="text-title font-semibold text-ink text-balance">
            Your birth details
          </h1>
          <p className="text-sm text-muted text-pretty">
            Entered once, editable later from your account.
          </p>
        </header>

        <div className="flex flex-col gap-3.5">
          <Field label="Full name" error={errors.fullName}>
            <Input
              autoComplete="name"
              autoFocus
              placeholder="As written on your birth record"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value)
                clearError('fullName')
              }}
            />
          </Field>

          <Field label="Gender" error={errors.gender}>
            <div
              className="grid gap-2 sm:grid-cols-3"
              role="radiogroup"
              aria-label="Gender"
            >
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
                      'rounded-control border px-3 py-2.5 text-left text-sm transition-colors',
                      active
                        ? 'border-gold bg-gold-soft/50 text-ink'
                        : 'border-border-strong bg-surface text-purple hover:border-navy hover:bg-navy-soft',
                    )}
                  >
                    {GENDER_LABEL[option]}
                  </button>
                )
              })}
            </div>
          </Field>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Date of birth" error={errors.date}>
              <Input
                type="date"
                mono
                max={new Date().toISOString().slice(0, 10)}
                value={date}
                onChange={(event) => {
                  setDate(event.target.value)
                  clearError('date')
                }}
              />
            </Field>

            <Field
              label="Time of birth"
              error={errors.time}
              help={
                timeUnknown
                  ? 'Noon is used instead. You can add an exact time later.'
                  : undefined
              }
            >
              <div className="space-y-2">
                <Input
                  type="time"
                  mono
                  value={time}
                  disabled={timeUnknown}
                  onChange={(event) => {
                    setTime(event.target.value)
                    clearError('time')
                  }}
                />
                <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-purple">
                  <input
                    type="checkbox"
                    checked={timeUnknown}
                    onChange={(event) => {
                      setTimeUnknown(event.target.checked)
                      clearError('time')
                    }}
                    className="size-4 accent-[var(--color-navy)]"
                  />
                  I don’t know my time
                </label>
              </div>
            </Field>
          </div>

          <Field
            label="Birth place"
            error={errors.place}
            help={
              place
                ? `${formatCoordinates(place.latitude, place.longitude)} · geocoded from ${place.label}`
                : 'Start typing a town — pick the nearest listed one.'
            }
          >
            <PlaceField
              value={place}
              onChange={(next) => {
                setPlace(next)
                if (next) clearError('place')
              }}
              invalid={Boolean(errors.place)}
            />
          </Field>
        </div>

        <div className="space-y-2.5 pt-1">
          <Button type="submit" fullWidth loading={isSubmitting}>
            {isSubmitting ? 'Calculating' : 'Calculate my chart'}
          </Button>
          <p className="flex items-center justify-center gap-2 text-xs text-muted">
            <Lock aria-hidden className="size-3.5" />
            Used only to calculate your chart
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}
