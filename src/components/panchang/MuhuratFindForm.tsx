import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/forms/Input'
import { MUHURAT_DOWNLOAD_OPTIONS } from '@/data/muhurat-plans'
import type { MuhuratPurposeId } from '@/data/panchang-mock'
import type { MuhuratPurposeSelection } from '@/components/panchang/MuhuratPurposeDetailModal'
import { cn } from '@/utils/cn'

const CUSTOM_VALUE = '__custom__'

const selectClass = cn(
  'h-control-sm w-full appearance-none rounded-card border border-border bg-surface-sunken px-3',
  'text-sm text-ink outline-none transition',
  'focus-visible:border-copper focus-visible:shadow-focus',
)

/**
 * Compact find form — purpose, location, date — then Submit opens details.
 */
export function MuhuratFindForm({
  defaultDateIso,
  defaultLocation,
  onSubmit,
}: {
  defaultDateIso: string
  defaultLocation: string
  onSubmit: (selection: MuhuratPurposeSelection, dateIso: string, location: string) => void
}) {
  const [purposeValue, setPurposeValue] = useState(MUHURAT_DOWNLOAD_OPTIONS[0]?.id ?? CUSTOM_VALUE)
  const [customLabel, setCustomLabel] = useState('')
  const [location, setLocation] = useState(defaultLocation)
  const [dateIso, setDateIso] = useState(defaultDateIso)

  const isCustom = purposeValue === CUSTOM_VALUE
  const preset = MUHURAT_DOWNLOAD_OPTIONS.find((o) => o.id === purposeValue)
  const purposeLabel = isCustom ? customLabel.trim() : (preset?.label ?? '')
  const canSubmit = Boolean(purposeLabel && location.trim() && dateIso)

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit(
      {
        id: (isCustom ? 'other' : purposeValue) as MuhuratPurposeId,
        label: purposeLabel,
        group: isCustom ? 'Custom' : preset?.group,
      },
      dateIso,
      location.trim(),
    )
  }

  return (
    <form
      className="mt-3 space-y-3 px-0.5"
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <p className="px-0.5 text-xs text-muted text-pretty">
        Choose occasion, place and date — then submit to see muhurat details.
      </p>

      <label className="block space-y-1.5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          1 · Occasion
        </span>
        <select
          value={purposeValue}
          onChange={(e) => setPurposeValue(e.target.value)}
          className={selectClass}
          aria-label="Muhurat occasion"
        >
          {MUHURAT_DOWNLOAD_OPTIONS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
          <option value={CUSTOM_VALUE}>Other — type your own</option>
        </select>
      </label>

      {isCustom && (
        <Input
          value={customLabel}
          onChange={(e) => setCustomLabel(e.target.value)}
          placeholder="Your own requirement…"
          inputSize="sm"
          tone="sunken"
          aria-label="Custom occasion"
        />
      )}

      <label className="block space-y-1.5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          2 · Location
        </span>
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City"
          inputSize="sm"
          tone="sunken"
          aria-label="Location"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          3 · Date
        </span>
        <Input
          type="date"
          value={dateIso}
          onChange={(e) => setDateIso(e.target.value)}
          inputSize="sm"
          tone="sunken"
          aria-label="Date"
        />
      </label>

      <Button
        type="submit"
        variant="primary"
        size="md"
        fullWidth
        className="rounded-full"
        disabled={!canSubmit}
      >
        Submit
      </Button>
    </form>
  )
}
