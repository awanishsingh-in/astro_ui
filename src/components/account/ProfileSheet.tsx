import { useEffect, useState } from 'react'
import { Button } from '@/components/common/Button'
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
  const [note, setNote] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
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
    setNote(editing?.note ?? '')
    setGender(normalizeGender(editing?.birthDetails.gender) ?? '')
    setDate(editing?.birthDetails.date ?? '')
    setTime(editing?.birthDetails.time ?? '')
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
      note: note.trim() || undefined,
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

      <Field label="Note" help="Optional — “Mother”, “Colleague”.">
        <Input
          autoComplete="off"
          placeholder="How you know them"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </Field>

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
    return (
      <section
        aria-label={title}
        className="animate-rise space-y-5 rounded-panel border border-border bg-surface p-5 shadow-card sm:p-6"
      >
        <header className="space-y-1 border-b border-border pb-4">
          <h2 className="text-heading font-semibold text-ink">{title}</h2>
          <p className="text-sm text-muted text-pretty">{description}</p>
        </header>
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
