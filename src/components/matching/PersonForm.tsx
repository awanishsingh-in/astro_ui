import { Users } from 'lucide-react'
import { useId } from 'react'
import { Field } from '@/components/forms/Field'
import { Input } from '@/components/forms/Input'
import { PlaceField } from '@/components/forms/PlaceField'
import { Select } from '@/components/forms/Select'
import type { ChartProfile } from '@/data/profiles'
import type { BirthDetails, BirthPlace } from '@/types/user'
import { cn } from '@/utils/cn'

export interface PersonDraft {
  name: string
  date: string
  time: string
  place: BirthPlace | null
  /** Set when filled from a saved profile. */
  profileId?: string
}

export interface PersonErrors {
  name?: string
  date?: string
  time?: string
  place?: string
}

export const emptyPerson: PersonDraft = { name: '', date: '', time: '', place: null }

export function validatePerson(person: PersonDraft): PersonErrors {
  const errors: PersonErrors = {}
  if (person.name.trim().length < 2) errors.name = 'Enter a name.'
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
  }
}

export interface PersonFormProps {
  label: string
  person: PersonDraft
  errors: PersonErrors
  onChange: (next: PersonDraft) => void
  /** Saved charts that can fill the form in one step. */
  profiles: ChartProfile[]
  className?: string
}

/**
 * One person's birth details.
 *
 * Saved charts fill it in one step, because matching almost always involves at
 * least one chart the user already has — retyping it would be busywork.
 */
export function PersonForm({
  label,
  person,
  errors,
  onChange,
  profiles,
  className,
}: PersonFormProps) {
  const selectId = useId()
  const set = (patch: Partial<PersonDraft>) => onChange({ ...person, ...patch })

  const fillFrom = (id: string) => {
    const profile = profiles.find((p) => p.id === id)
    if (!profile) {
      onChange({ ...emptyPerson })
      return
    }
    onChange({
      name: profile.name,
      date: profile.birthDetails.date,
      time: profile.birthDetails.timeUnknown ? '12:00' : profile.birthDetails.time,
      place: profile.birthDetails.place,
      profileId: profile.id,
    })
  }

  return (
    <section
      aria-label={label}
      className={cn('space-y-5 rounded-panel border border-border bg-surface p-5', className)}
    >
      <header className="flex items-center justify-between gap-3">
        <h2 className="font-mono text-label uppercase text-gold-deep">{label}</h2>
        {person.profileId && (
          <span className="inline-flex items-center gap-1.5 font-mono text-label uppercase text-muted">
            <Users aria-hidden className="size-3.5" />
            From saved
          </span>
        )}
      </header>

      {profiles.length > 0 && (
        <div>
          <label htmlFor={selectId} className="mb-2 block font-mono text-label uppercase text-muted">
            Use a saved chart
          </label>
          <Select
            id={selectId}
            inputSize="md"
            value={person.profileId ?? ''}
            onChange={(event) => fillFrom(event.target.value)}
            options={[
              { value: '', label: 'Enter details manually' },
              ...profiles.map((p) => ({ value: p.id, label: `${p.name}${p.note ? ` · ${p.note}` : ''}` })),
            ]}
          />
        </div>
      )}

      <Field label="Name" error={errors.name}>
        <Input
          autoComplete="off"
          placeholder="As written on the birth record"
          value={person.name}
          onChange={(event) => set({ name: event.target.value, profileId: undefined })}
        />
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
