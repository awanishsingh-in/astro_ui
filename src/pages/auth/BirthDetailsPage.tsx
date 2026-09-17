import { Lock, MoonStar, Sparkles, Sun } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { AstroDivider } from '@/components/celestial/AstroDivider'
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
        className="mx-auto flex w-full max-w-xl flex-col gap-5 lg:gap-4"
      >
        <header className="animate-rise space-y-3">
          <p className="inline-flex items-center gap-1.5 font-mono text-label uppercase text-gold">
            <Sparkles aria-hidden className="size-3.5" />
            Chart foundation
          </p>
          <div className="space-y-1.5">
            <h1 className="font-serif text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] text-ink text-balance lg:text-[2rem]">
              Your birth details
            </h1>
            <p className="text-sm text-muted text-pretty">
              Entered once, editable later from your account.
            </p>
          </div>
          <AstroDivider />
        </header>

        <div className="relative overflow-visible rounded-panel border border-border bg-surface p-4 shadow-raised sm:p-5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-panel"
          >
            <div className="absolute -right-16 -top-20 size-48 rounded-full bg-pale-copper/50 blur-3xl" />
            <div className="absolute -bottom-24 -left-10 size-40 rounded-full bg-copper/10 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-4">
            <Field appearance="plain" label="Full name" error={errors.fullName}>
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

            <Field appearance="plain" label="Gender" error={errors.gender}>
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
                        'rounded-card border px-3 py-3 text-center text-sm font-medium transition-all duration-200 ease-out-soft',
                        'active:scale-[0.98]',
                        active
                          ? 'border-copper bg-pale-copper text-copper-shadow shadow-[0_0_0_1px_rgba(220,132,79,0.2)]'
                          : 'border-border bg-canvas text-purple hover:border-copper/40 hover:bg-pale-copper/40 hover:text-ink',
                      )}
                    >
                      {GENDER_LABEL[option]}
                    </button>
                  )
                })}
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field appearance="plain" label="Date of birth" error={errors.date}>
                <Input
                  type="date"
                  mono
                  icon={<Sun strokeWidth={1.75} />}
                  max={new Date().toISOString().slice(0, 10)}
                  value={date}
                  onChange={(event) => {
                    setDate(event.target.value)
                    clearError('date')
                  }}
                />
              </Field>

              <Field
                appearance="plain"
                label="Time of birth"
                error={errors.time}
                help={
                  timeUnknown
                    ? 'Noon is used instead. You can add an exact time later.'
                    : undefined
                }
              >
                <div className="space-y-2.5">
                  <Input
                    type="time"
                    mono
                    icon={<MoonStar strokeWidth={1.75} />}
                    value={time}
                    disabled={timeUnknown}
                    onChange={(event) => {
                      setTime(event.target.value)
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
                        timeUnknown
                          ? 'border-copper bg-copper text-midnight'
                          : 'border-border-strong',
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
            </div>

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
                value={place}
                onChange={(next) => {
                  setPlace(next)
                  if (next) clearError('place')
                }}
                invalid={Boolean(errors.place)}
              />
            </Field>
          </div>
        </div>

        <div className="space-y-2.5 pt-0.5">
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
