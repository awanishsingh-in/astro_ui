import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import type { DashaPeriod } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { GRAHAS } from '@/utils/astro'

export interface DashaTrackProps {
  periods: DashaPeriod[]
  /** Opens a mahadasha in the list below. */
  onSelect?: (period: DashaPeriod) => void
  openName?: string | null
  className?: string
}

const year = (iso: string) => new Date(iso).getFullYear()

/**
 * Vimshottari as a timeline you can read across rather than a table you read
 * down.
 *
 * Every row shares one axis — the whole 120-year cycle — so each period's bar
 * starts where that period actually starts. Shani's nineteen years are visibly
 * nineteen years, and the running one is the only thing in gold. The glyph is
 * the anchor, because the mahadasha *is* its graha.
 */
export function DashaTrack({ periods, onSelect, openName, className }: DashaTrackProps) {
  if (periods.length === 0) return null

  const from = Date.parse(periods[0].start)
  const to = Date.parse(periods[periods.length - 1].end)
  const total = to - from || 1

  const left = (period: DashaPeriod) => ((Date.parse(period.start) - from) / total) * 100
  const width = (period: DashaPeriod) =>
    ((Date.parse(period.end) - Date.parse(period.start)) / total) * 100

  return (
    <div className={cn('min-w-0', className)}>
      {/*
        The axis is wider than a phone, so the whole timeline scrolls as one
        block — scaling it to fit would make the short periods unreadable.
      */}
      <div className="no-scrollbar rail-bleed overflow-x-auto">
        <ol className="min-w-[520px] space-y-1">
          {periods.map((period) => {
            const open = openName === period.name
            const Tag = onSelect ? 'button' : 'div'

            return (
              <li key={`${period.name}-${period.start}`}>
                <Tag
                  type={onSelect ? 'button' : undefined}
                  onClick={onSelect ? () => onSelect(period) : undefined}
                  aria-expanded={onSelect ? open : undefined}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-control px-2 py-1.5 text-left',
                    'transition-colors duration-150 ease-out-soft',
                    open ? 'bg-navy-soft' : 'hover:bg-navy-soft',
                  )}
                >
                  {/* Anchor: the graha the period belongs to. */}
                  <span
                    aria-hidden
                    className={cn(
                      'inline-grid size-8 shrink-0 place-items-center rounded-full border text-base',
                      period.current
                        ? 'border-gold bg-gold-soft'
                        : 'border-border bg-surface group-hover:border-border-strong',
                    )}
                  >
                    <PlanetGlyph code={period.graha} />
                  </span>

                  <span
                    className={cn(
                      'w-20 shrink-0 truncate text-sub',
                      period.current ? 'font-semibold text-ink' : 'text-purple',
                    )}
                  >
                    {period.name}
                  </span>

                  {/* The bar, placed on the shared axis rather than sized alone. */}
                  <span className="relative h-6 min-w-0 flex-1">
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border"
                    />
                    <span
                      aria-hidden
                      className={cn(
                        'absolute top-1/2 flex h-1.5 -translate-y-1/2 items-center rounded-full',
                        period.current ? 'bg-gold' : 'bg-border-strong',
                      )}
                      style={{
                        left: `${left(period)}%`,
                        width: `${Math.max(width(period), 1.5)}%`,
                      }}
                    />
                  </span>

                  <span
                    className={cn(
                      'w-24 shrink-0 text-right font-mono text-label uppercase',
                      period.current ? 'text-gold-deep' : 'text-muted',
                    )}
                  >
                    {year(period.start)} — {year(period.end)}
                  </span>

                  <span className="sr-only">
                    {GRAHAS[period.graha].english} mahadasha, {year(period.start)} to{' '}
                    {year(period.end)}
                    {period.current ? ', running now' : ''}
                  </span>
                </Tag>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
