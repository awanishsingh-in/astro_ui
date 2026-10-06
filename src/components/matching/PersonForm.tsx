import { Check, ChevronRight, MapPin, Users, X } from 'lucide-react'
import { Field } from '@/components/forms/Field'
import { Input } from '@/components/forms/Input'
import { PlaceField } from '@/components/forms/PlaceField'
import type { BirthDetails, BirthPlace, Gender } from '@/types/user'
import { GENDER_LABEL, GENDER_OPTIONS } from '@/types/user'
import { cn } from '@/utils/cn'

export interface PersonDraft {
  name: string
  gender: Gender | ''
  date: string
  time: string
  place: BirthPlace | null
  /** Set when filled from a saved profile. */
  profileId?: string
}

export interface PersonErrors {
  name?: string
  gender?: string
  date?: string
  time?: string
  place?: string
}

export const emptyPerson: PersonDraft = {
  name: '',
  gender: '',
  date: '',
  time: '',
  place: null,
}

export function validatePerson(person: PersonDraft): PersonErrors {
  const errors: PersonErrors = {}
  if (person.name.trim().length < 2) errors.name = 'Enter a name.'
  if (!person.gender) errors.gender = 'Choose male, female, or other.'
  if (!person.date) errors.date = 'Enter a date of birth.'
  else if (new Date(person.date) > new Date()) errors.date = 'That date is in the future.'
  if (!person.time) errors.time = 'Enter a time of birth.'
  if (!person.place) errors.place = 'Pick the nearest listed town.'
  return errors
}

export function toBirthDetails(person: PersonDraft): BirthDetails {
  return {
    fullName: person.name.trim(),
    date: person.date,
    time: person.time,
    place: person.place as BirthPlace,
    gender: person.gender || undefined,
  }
}

export interface PersonFormProps {
  label: string
  person: PersonDraft
  errors: PersonErrors
  onChange: (next: PersonDraft) => void
  /** Opens the saved-profile picker page for this person. */
  onUseSavedProfile?: () => void
  /** Whether any saved profiles exist (hides the button when none). */
  hasSavedProfiles?: boolean
  className?: string
}

const GENDER_CHOICES = GENDER_OPTIONS.map((id) => ({
  id,
  label: GENDER_LABEL[id],
}))

/**
 * One person's birth details — Matching card.
 * When a saved profile is selected, birth fields stay hidden so the page fits one screen.
 */
export function PersonForm({
  label,
  person,
  errors,
  onChange,
  onUseSavedProfile,
  hasSavedProfiles = false,
  className,
}: PersonFormProps) {
  const set = (patch: Partial<PersonDraft>) => onChange({ ...person, ...patch })

  const clearSaved = () => {
    onChange({ ...emptyPerson })
  }

  const ready = Boolean(
    person.name.trim() && person.gender && person.date && person.time && person.place,
  )
  const fromSaved = Boolean(person.profileId)

  return (
    <section
      aria-label={label}
      className={cn(
        'relative flex h-full min-h-0 flex-col overflow-hidden rounded-[1.25rem] border border-border/80 bg-surface p-3.5 shadow-card sm:p-4',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-copper/15 blur-2xl"
      />

      <header className="relative mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-copper">
          {label}
        </h2>
        {ready && (
          <span className="inline-flex items-center gap-1 rounded-full border border-copper/40 bg-copper/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-copper">
            <Check className="size-3" aria-hidden />
            Ready
          </span>
        )}
      </header>

      {hasSavedProfiles && onUseSavedProfile && !fromSaved && (
        <button
          type="button"
          onClick={onUseSavedProfile}
          className={cn(
            'relative mb-2.5 flex w-full items-center gap-2.5 rounded-xl border border-copper/55 bg-copper/5 px-3 py-2 text-left',
            'transition hover:bg-copper/10',
          )}
        >
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-copper/35 bg-surface-sunken text-copper">
            <Users className="size-3.5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-ink">Use a saved kundli</span>
            <span className="block text-[11px] text-muted">Fill this side in one tap</span>
          </span>
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-copper text-[var(--btn-primary-fg)]">
            <ChevronRight className="size-3.5" aria-hidden />
          </span>
        </button>
      )}

      {fromSaved && (
        <div className="relative mb-2.5 space-y-2">
          <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-surface-sunken/60 px-3 py-2.5">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-copper/35 bg-copper/10 text-copper">
              <Users className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{person.name}</p>
              <p className="mt-0.5 text-[11px] text-muted">
                {person.profileId === 'self'
                  ? 'Your account · change anytime'
                  : 'Filled from a saved kundli'}
              </p>
            </div>
            <button
              type="button"
              onClick={clearSaved}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-navy-soft hover:text-ink"
              aria-label="Clear saved"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {onUseSavedProfile && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onUseSavedProfile}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border border-copper/50',
                  'bg-copper/10 px-3 py-1.5 text-xs font-semibold text-copper',
                  'transition hover:border-copper hover:bg-copper/20',
                )}
              >
                Change person
                <ChevronRight className="size-3.5" aria-hidden />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col gap-2.5">
        {(hasSavedProfiles || fromSaved) && (
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
              {fromSaved ? 'birth details' : 'or enter birth details'}
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
        )}

        <Field label="What's their name?" error={errors.name}>
          <Input
            tone="celestial"
            inputSize="sm"
            autoComplete="off"
            placeholder="As written on the birth record"
            value={person.name}
            onChange={(event) => set({ name: event.target.value, profileId: undefined })}
          />
        </Field>

        <Field label="Gender" error={errors.gender}>
          <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Gender">
            {GENDER_CHOICES.map((option) => {
              const active = person.gender === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => set({ gender: option.id, profileId: undefined })}
                  className={cn(
                    'relative flex items-center justify-center rounded-control border px-2 py-1.5',
                    'text-xs font-medium transition-colors duration-150 sm:text-sm',
                    active
                      ? 'border-copper bg-copper text-[var(--btn-primary-fg)]'
                      : 'border-border bg-surface-sunken text-muted hover:border-border-strong hover:text-ink',
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </Field>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <Field label="Date of birth" error={errors.date}>
            <Input
              tone="celestial"
              inputSize="sm"
              type="date"
              mono
              max={new Date().toISOString().slice(0, 10)}
              value={person.date}
              onChange={(event) => set({ date: event.target.value, profileId: undefined })}
            />
          </Field>

          <Field label="Time of birth" error={errors.time}>
            <Input
              tone="celestial"
              inputSize="sm"
              type="time"
              mono
              value={person.time}
              onChange={(event) => set({ time: event.target.value, profileId: undefined })}
            />
          </Field>
        </div>

        <Field label="Where were they born?" error={errors.place}>
          <PlaceField
            value={person.place}
            onChange={(place) => set({ place, profileId: undefined })}
            invalid={Boolean(errors.place)}
          />
        </Field>

        {!person.place && (
          <p className="flex items-start gap-1.5 text-[11px] text-muted">
            <MapPin className="mt-0.5 size-3 shrink-0 text-copper" aria-hidden />
            Pick the nearest listed town so the chart uses the right sky.
          </p>
        )}
      </div>
    </section>
  )
}
