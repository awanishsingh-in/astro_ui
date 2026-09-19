import { Users, X } from 'lucide-react'
import { Button } from '@/components/common/Button'
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
 * One person's birth details - manual entry by default; saved profiles open on a separate page.
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

  return (
    <section
      aria-label={label}
      className={cn('space-y-5 rounded-panel border border-border bg-surface p-5', className)}
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-mono text-label uppercase text-gold-deep">{label}</h2>
        {hasSavedProfiles && onUseSavedProfile && (
          <div className="flex flex-wrap items-center gap-2">
            {person.profileId ? (
              <button
                type="button"
                onClick={clearSaved}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1',
                  'font-mono text-label uppercase text-muted transition-colors',
                  'hover:border-border-strong hover:bg-navy-soft hover:text-ink',
                )}
              >
                <X className="size-3" aria-hidden />
                Clear saved
              </button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onUseSavedProfile}
                iconLeft={<Users className="size-3.5" />}
                className="rounded-full"
              >
                Use saved profile
              </Button>
            )}
          </div>
        )}
      </header>

      {person.profileId && (
        <p className="inline-flex items-center gap-1.5 font-mono text-label uppercase text-muted">
          <Users aria-hidden className="size-3.5" />
          Filled from saved profile
        </p>
      )}

      <Field label="Name" error={errors.name}>
        <Input
          autoComplete="off"
          placeholder="As written on the birth record"
          value={person.name}
          onChange={(event) => set({ name: event.target.value, profileId: undefined })}
        />
      </Field>

      <Field label="Gender" error={errors.gender}>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Gender">
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
                  'relative flex items-center justify-center gap-2 rounded-control border px-2 py-2.5 sm:px-3',
                  'text-sm font-medium transition-colors duration-150',
                  active
                    ? 'border-copper/55 bg-copper/12 text-ink'
                    : 'border-border bg-surface text-purple hover:border-border-strong hover:bg-navy-soft/70',
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Date of birth" error={errors.date}>
          <Input
            type="date"
            mono
            max={new Date().toISOString().slice(0, 10)}
            value={person.date}
            onChange={(event) => set({ date: event.target.value, profileId: undefined })}
          />
        </Field>

        <Field label="Time of birth" error={errors.time}>
          <Input
            type="time"
            mono
            value={person.time}
            onChange={(event) => set({ time: event.target.value, profileId: undefined })}
          />
        </Field>
      </div>

      <Field label="Birth place" error={errors.place}>
        <PlaceField
          value={person.place}
          onChange={(place) => set({ place, profileId: undefined })}
          invalid={Boolean(errors.place)}
        />
      </Field>
    </section>
  )
}
