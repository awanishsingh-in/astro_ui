import { useEffect, useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Field } from '@/components/forms/Field'
import { Input } from '@/components/forms/Input'
import { useToast } from '@/components/feedback/toast-context'
import { Modal } from '@/components/modals/Modal'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import {
  downloadPanchangPdf,
  type PanchangDownloadRange,
} from '@/utils/panchang-download'
import { cn } from '@/utils/cn'
import { formatDateShort } from '@/utils/format'

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

type RangeChoice = PanchangDownloadRange

function rangeOptions(dateIso: string): {
  id: RangeChoice
  label: string
  sub: string
}[] {
  const d = new Date(`${dateIso}T12:00:00`)
  const day = d.getDate()
  const month = MONTHS_SHORT[d.getMonth()] ?? 'Sep'
  const year = d.getFullYear()
  const weekStart = new Date(d)
  weekStart.setDate(day - ((d.getDay() + 6) % 7))
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  return [
    {
      id: 'day',
      label: 'This day',
      sub: formatDateShort(dateIso),
    },
    {
      id: 'week',
      label: 'This week',
      sub: `${weekStart.getDate()}–${weekEnd.getDate()} ${month}`,
    },
    {
      id: 'month',
      label: 'This month',
      sub: `${MONTHS_SHORT[d.getMonth()]} ${year}`,
    },
    {
      id: 'year',
      label: 'Full year',
      sub: String(year),
    },
    {
      id: 'custom',
      label: 'Custom date',
      sub: 'Pick from → to',
    },
  ]
}

export function PanchangDownloadPicker({
  isOpen,
  onClose,
  dateIso,
  locationLabel,
}: {
  isOpen: boolean
  onClose: () => void
  dateIso: string
  locationLabel: string
}) {
  const toast = useToast()
  const isDesktop = useIsDesktop()
  const options = useMemo(() => rangeOptions(dateIso), [dateIso])
  const [range, setRange] = useState<RangeChoice>('day')
  const [customFrom, setCustomFrom] = useState(dateIso)
  const [customTo, setCustomTo] = useState(dateIso)

  useEffect(() => {
    if (!isOpen) return
    setRange('day')
    setCustomFrom(dateIso)
    setCustomTo(dateIso)
  }, [isOpen, dateIso])

  const customInvalid =
    range === 'custom' && (!customFrom || !customTo || customTo < customFrom)

  function handleDownload() {
    if (customInvalid) {
      toast.info('Check the dates', {
        description: 'End date must be on or after the start date.',
      })
      return
    }

    const startIso = range === 'custom' ? customFrom : dateIso
    const endIso = range === 'custom' ? customTo : undefined
    downloadPanchangPdf({
      place: locationLabel,
      dateIso: startIso,
      range,
      endDateIso: endIso,
    })
    toast.success('Panchang downloaded', {
      description: 'Saved to your device and Download history.',
    })
    onClose()
  }

  const actionLabel =
    range === 'custom'
      ? customFrom === customTo
        ? 'Download custom day PDF'
        : 'Download custom range PDF'
      : `Download ${options.find((o) => o.id === range)?.label.toLowerCase()} PDF`

  const body = (
    <div className="space-y-5">
      <p className="text-sm text-muted text-pretty">
        Choose a date range for {formatDateShort(dateIso)}, or pick custom dates. The file is added
        to your account download history.
      </p>

      <div className="space-y-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Range
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {options.map((opt) => {
            const active = range === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRange(opt.id)}
                className={cn(
                  'rounded-xl border px-3.5 py-3.5 text-left transition',
                  opt.id === 'custom' && 'col-span-2 sm:col-span-2',
                  active
                    ? 'border-copper bg-copper/15 text-ink'
                    : 'border-border/80 bg-surface-sunken/40 text-muted hover:border-copper/40 hover:text-ink',
                )}
              >
                <p className="text-sm font-semibold leading-snug">{opt.label}</p>
                <p className="mt-1 text-xs leading-relaxed opacity-80">{opt.sub}</p>
              </button>
            )
          })}
        </div>
      </div>

      {range === 'custom' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="From">
            <Input
              type="date"
              value={customFrom}
              onChange={(e) => {
                const next = e.target.value
                setCustomFrom(next)
                if (customTo < next) setCustomTo(next)
              }}
              inputSize="md"
              mono
            />
          </Field>
          <Field label="To">
            <Input
              type="date"
              value={customTo}
              min={customFrom}
              onChange={(e) => setCustomTo(e.target.value)}
              inputSize="md"
              mono
            />
          </Field>
        </div>
      )}

      <Button
        variant="primary"
        size="md"
        className="w-full rounded-full"
        iconLeft={<Download className="size-4" />}
        onClick={handleDownload}
        disabled={customInvalid}
      >
        {actionLabel}
      </Button>
    </div>
  )

  if (isDesktop) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Download panchang"
        description="Pick the range you want to take with you."
        size="md"
      >
        {body}
      </Modal>
    )
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Download panchang"
      description="Pick the range you want to take with you."
    >
      {body}
    </BottomSheet>
  )
}
