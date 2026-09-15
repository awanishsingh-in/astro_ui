import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { useToast } from '@/components/feedback/toast-context'
import type { CalculationBasis as Basis } from '@/types/astrology'
import type { BirthDetails } from '@/types/user'
import { cn } from '@/utils/cn'
import { copyText } from '@/utils/clipboard'
import { formatDateLong, formatTime12 } from '@/utils/format'

export interface CalculationBasisProps {
  basis: Basis
  birthDetails: BirthDetails
  className?: string
}

/** Grouped so the plain facts come first and the machinery after. */
const GROUPS: { title: string; note: string; rows: (keyof Basis)[] }[] = [
  {
    title: 'What was used',
    note: 'The frame every position is measured in.',
    rows: ['ephemeris', 'zodiac', 'ayanamsa', 'houseSystem', 'nodes'],
  },
  {
    title: 'Time and place',
    note: 'Where the sky was, and exactly when.',
    rows: ['timeZone', 'lmtCorrection', 'coordinates'],
  },
  {
    title: 'The working',
    note: 'For anyone who wants to check it against their own software.',
    rows: ['julianDay', 'siderealTime', 'dashaSystem', 'rounding'],
  },
]

const LABELS: Record<keyof Basis, string> = {
  ephemeris: 'Ephemeris',
  zodiac: 'Zodiac',
  ayanamsa: 'Ayanamsa',
  houseSystem: 'House system',
  nodes: 'Nodes',
  timeZone: 'Time zone',
  lmtCorrection: 'LMT correction',
  coordinates: 'Coordinates',
  julianDay: 'Julian day (UT)',
  siderealTime: 'Sidereal time at birth',
  dashaSystem: 'Dasha system',
  rounding: 'Rounding',
}

/**
 * Everything the app used to place the grahas.
 *
 * Transparent without being intimidating: the birth details lead, the three
 * groups are ordered from plain to technical, and each group says in one line
 * why it is there. Nothing here is estimated — where a value cannot be
 * established, the panel says so rather than assuming one.
 */
export function CalculationBasis({ basis, birthDetails, className }: CalculationBasisProps) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    const text = [
      `${birthDetails.fullName}`,
      `${formatDateLong(birthDetails.date)} · ${birthDetails.timeUnknown ? 'time unknown' : formatTime12(birthDetails.time)} · ${birthDetails.place.label}`,
      '',
      ...GROUPS.flatMap((group) => [
        group.title,
        ...group.rows.map((row) => `  ${LABELS[row]}: ${basis[row]}`),
        '',
      ]),
    ].join('\n')

    if (await copyText(text)) {
      setCopied(true)
      toast.success('Calculation basis copied')
      window.setTimeout(() => setCopied(false), 2000)
      return
    }
    // Blocked even by the fallback — say so instead of failing silently.
    toast.error('Could not copy', { description: 'Your browser blocked clipboard access.' })
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <p className="text-sm text-muted text-pretty">
          Everything the app used to place your grahas. Nothing here is estimated — if a value
          cannot be established, it says so instead of assuming one.
        </p>
      </div>

      {/* Birth details lead: they are the only input the user gave. */}
      <div className="rounded-card border border-gold-border bg-gold-soft p-4">
        <p className="font-mono text-label uppercase text-gold-deep">Calculated from</p>
        <p className="mt-2 text-sub font-medium text-ink">{birthDetails.fullName}</p>
        <p className="mt-1 font-mono text-data text-purple">
          {formatDateLong(birthDetails.date)}
          {' · '}
          {birthDetails.timeUnknown ? 'time unknown' : formatTime12(birthDetails.time)}
          {' · '}
          {birthDetails.place.label}
        </p>
        {birthDetails.timeUnknown && (
          <p className="mt-2 text-sm text-caution text-pretty">
            Without a birth time the lagna and the bhava cusps are the least certain values here.
            Adding an exact time from your account recalculates the chart.
          </p>
        )}
      </div>

      {GROUPS.map((group) => (
        <section key={group.title} className="space-y-3">
          <div>
            <h3 className="text-heading font-semibold text-ink">{group.title}</h3>
            <p className="mt-0.5 text-sm text-muted">{group.note}</p>
          </div>

          <dl className="overflow-hidden rounded-card border border-border">
            {group.rows.map((row, index) => (
              <div
                key={row}
                className={cn(
                  'flex flex-col gap-1 bg-surface p-4 sm:flex-row sm:items-baseline sm:gap-6',
                  index > 0 && 'border-t border-border',
                )}
              >
                <dt className="shrink-0 font-mono text-label uppercase text-muted sm:w-48">
                  {LABELS[row]}
                </dt>
                <dd className="min-w-0 flex-1 text-sm text-ink text-pretty sm:text-right">
                  {basis[row]}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <Button
          variant="secondary"
          size="sm"
          onClick={copy}
          iconLeft={copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        >
          {copied ? 'Copied' : 'Copy as text'}
        </Button>
        <p className="text-xs text-muted">Recalculated whenever birth details change.</p>
      </div>
    </div>
  )
}
