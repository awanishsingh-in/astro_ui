import { useEffect, useState } from 'react'
import { Button } from '@/components/common/Button'
import { BirthTimeCompact } from '@/components/forms/BirthWheels'
import { Field } from '@/components/forms/Field'
import { Input } from '@/components/forms/Input'
import { PlaceField } from '@/components/forms/PlaceField'
import { Select } from '@/components/forms/Select'
import { Modal } from '@/components/modals/Modal'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import { RELATION_LABEL, type ChartProfile, type ProfileRelation } from '@/data/profiles'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import type { NewProfile } from '@/profiles/profiles-context'
import { GENDER_LABEL, GENDER_OPTIONS, normalizeGender, type BirthPlace, type Gender } from '@/types/user'
import { cn } from '@/utils/cn'

export interface ProfileSheetProps {
  isOpen: boolean
  onClose: () => void
  /** Omitted when adding. */
  editing?: ChartProfile
  /** Pre-select folder when adding (from the Family / Friend / … picker). */
  defaultRelation?: Exclude<ProfileRelation, 'self'>
  onSave: (profile: NewProfile) => void | Promise<void>
  onDelete?: (id: string) => void
  /** Disables submit while the parent is persisting. */
  isSaving?: boolean
  /**
   * `overlay` — modal / sheet (Family, edit).
   * `inline` — form on the Profile page (Friend / Relative / Other).
   */
  presentation?: 'overlay' | 'inline'
}

interface Errors {
  name?: string
  gender?: string
  date?: string
  time?: string
  place?: string
}

/** Only the relations a saved chart can have. `self` is the account itself. */
const RELATIONS: ProfileRelation[] = ['family', 'friend', 'relative', 'other']

/**
 * Adding or editing a saved chart.
 *
 * Same birth fields as the account holder's form, plus relationship — so each
 * chart stays navigable in a list of names.
 */
export function ProfileSheet({
  isOpen,
  onClose,
  editing,
  defaultRelation = 'family',
  onSave,
  onDelete,
  isSaving = false,
  presentation = 'overlay',
}: ProfileSheetProps) {
  const desktop = useIsDesktop()
  const [name, setName] = useState('')
  const [relation, setRelation] = useState<ProfileRelation>(defaultRelation)
  const [gender, setGender] = useState<Gender | ''>('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('12:00')
  const [timeUnknown, setTimeUnknown] = useState(false)
  const [place, setPlace] = useState<BirthPlace | null>(null)
  const [errors, setErrors] = useState<Errors>({})

  useEffect(() => {
    if (!isOpen) return
    setName(editing?.name ?? '')
    setRelation(
      editing?.relation === 'self'
        ? 'family'
        : (editing?.relation ?? defaultRelation),
    )
    setGender(normalizeGender(editing?.birthDetails.gender) ?? '')
    setDate(editing?.birthDetails.date ?? '')
    setTime(editing?.birthDetails.time || '12:00')
    setTimeUnknown(Boolean(editing?.birthDetails.timeUnknown))
    setPlace(editing?.birthDetails.place ?? null)
    setErrors({})
  }, [isOpen, editing, defaultRelation])

  const clear = (field: keyof Errors) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))

  const submit = async () => {
    if (isSaving) return

    const found: Errors = {}
    if (name.trim().length < 2) found.name = 'Enter a name.'
    if (!gender) found.gender = 'Choose a gender.'
    if (!date) found.date = 'Enter a date of birth.'
    else if (new Date(date) > new Date()) found.date = 'That date is in the future.'
    if (!timeUnknown && !time) found.time = 'Enter a time, or say it is unknown.'
    if (!place) found.place = 'Pick the nearest listed town.'

    setErrors(found)
    if (Object.keys(found).length > 0) return

    await onSave({
      name: name.trim(),
      relation,
      // Keep an existing note on edit; new profiles no longer collect one.
      note: editing?.note,
      birthDetails: {
        fullName: name.trim(),
        date,
        time: timeUnknown ? '12:00' : time,
        timeUnknown,
        place: place as BirthPlace,
        gender: gender as Gender,
      },
    })
  }

  const title = editing ? `Edit ${editing.name}` : 'Add profile'
  const description = editing
    ? 'Changing these recalculates this chart. Readings drawn from it stay.'
    : 'Family, a friend, a relative — anyone whose chart you want to read.'

  const fields = (
    <div className="space-y-4">
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Relationship">
          <Select
            options={RELATIONS.map((value) => ({ value, label: RELATION_LABEL[value] }))}
            value={relation}
            onChange={(event) => setRelation(event.target.value as ProfileRelation)}
          />
        </Field>

        <Field label="Gender" error={errors.gender}>
          <Select
            options={[
              { value: '', label: 'Select' },
              ...GENDER_OPTIONS.map((value) => ({ value, label: GENDER_LABEL[value] })),
            ]}
            value={gender}
            onChange={(event) => {
              setGender(event.target.value as Gender | '')
              clear('gender')
            }}
          />
        </Field>
      </div>

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

      <Field
        appearance="plain"
        label="Time of birth"
        error={errors.time}
        labelHidden
        help={
          timeUnknown
            ? 'Noon is used instead. You can add an exact time later.'
            : undefined
        }
      >
        <div className="space-y-2">
          <BirthTimeCompact
            value={time}
            disabled={timeUnknown}
            onChange={(next) => {
              setTime(next)
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
              'inline-flex w-fit items-center gap-2 rounded-lg border px-2.5 py-1 text-xs transition-colors',
              timeUnknown
                ? 'border-copper/40 bg-copper/15 text-silver-300'
                : 'border-border text-muted hover:border-border-strong hover:text-ink',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'flex size-3.5 items-center justify-center rounded-xs border',
                timeUnknown ? 'border-copper bg-copper text-white' : 'border-border',
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
            Time unknown
          </button>
        </div>
      </Field>

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
  )

  const actions = (
    <div className={cn('flex gap-3', editing && onDelete ? 'flex-col sm:flex-row-reverse' : 'sm:justify-end')}>
      {presentation === 'inline' && (
        <Button variant="ghost" fullWidth={!desktop} disabled={isSaving} onClick={onClose}>
          Cancel
        </Button>
      )}
      <Button fullWidth={!desktop || Boolean(editing && onDelete)} loading={isSaving} onClick={submit}>
        {editing ? 'Save changes' : 'Add profile'}
      </Button>
      {editing && onDelete && (
        <Button variant="danger" fullWidth disabled={isSaving} onClick={() => onDelete(editing.id)}>
          Remove this profile
        </Button>
      )}
    </div>
  )

  if (presentation === 'inline') {
    if (!isOpen) return null
    // Page header already titles the add flow — keep the card as fields + actions only.
    return (
      <section
        aria-label={title}
        className="animate-rise space-y-5 rounded-panel border border-border bg-surface p-5 shadow-card sm:p-6"
      >
        {fields}
        <div className="border-t border-border pt-4">{actions}</div>
      </section>
    )
  }

  const Overlay = desktop ? Modal : BottomSheet

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={desktop ? 'md' : undefined}
      footer={actions}
    >
      {fields}
    </Overlay>
  )
}
