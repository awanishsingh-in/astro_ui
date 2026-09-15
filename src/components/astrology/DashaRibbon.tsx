import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import type { DashaPeriod } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { GRAHAS } from '@/utils/astro'
import { formatPeriod } from '@/utils/format'

export interface DashaRibbonProps {
  periods: DashaPeriod[]
  /** Jump to a mahadasha in the list below. */
  onSelect?: (period: DashaPeriod) => void
  className?: string
}

/**
 * The whole 120-year Vimshottari cycle as one horizontal band.
 *
 * Each mahadasha takes the share of the width its real length deserves, so a
 * life is legible in a single glance: Shani's nineteen years against Surya's
 * six. The running period is the only one in gold.
 *
 * Drawn on the celestial surface because this is time as the sky keeps it, not
 * a project plan — the list underneath is where the dates are read.
 */
export function DashaRibbon({ periods, onSelect, className }: DashaRibbonProps) {
  const span = (period: DashaPeriod) => Date.parse(period.end) - Date.parse(period.start)
  const total = periods.reduce((sum, p) => sum + span(p), 0) || 1

  return (
    <div className={cn('min-w-0', className)}>
      <ol className="flex h-16 min-w-0 gap-px overflow-hidden rounded-card border border-celestial-line">
        {periods.map((period) => {
          const share = (span(period) / total) * 100
          const Tag = onSelect ? 'button' : 'div'

          return (
            <li
              key={`${period.name}-${period.start}`}
              className="min-w-0"
              style={{ width: `${share}%` }}
            >
              <Tag
                type={onSelect ? 'button' : undefined}
                onClick={onSelect ? () => onSelect(period) : undefined}
                title={`${period.name} · ${formatPeriod(period.start, period.end)}`}
                className={cn(
                  'flex size-full min-w-0 flex-col items-center justify-center gap-1 px-0.5',
                  'transition-colors duration-150 ease-out-soft',
                  period.current ? 'bg-gold-soft-line/20' : 'bg-indigo-deep hover:bg-indigo-royal',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'text-sm leading-none',
                    period.current ? 'text-gold-soft-line' : 'text-on-celestial-muted',
                  )}
                >
                  {GRAHAS[period.graha].glyph}
                </span>
                {/*
                  Only the wider segments can carry a label; the narrow ones
                  keep their glyph and are named in the list below rather than
                  being crushed into two clipped letters.
                */}
                {share > 7 && (
                  <span
                    className={cn(
                      'block max-w-full truncate font-mono text-[9px] uppercase',
                      period.current ? 'text-gold-soft-line' : 'text-on-celestial-faint',
                    )}
                  >
                    {period.name}
                  </span>
                )}
                <span className="sr-only">
                  {period.name}, {formatPeriod(period.start, period.end)}
                  {period.current ? ', running now' : ''}
                </span>
              </Tag>
            </li>
          )
        })}
      </ol>

      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-label uppercase text-on-celestial-faint">
        <span>120-year cycle</span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1.5 text-on-celestial-muted">
          <span aria-hidden className="size-2 rounded-full bg-gold-soft-line" />
          Running now
        </span>
      </p>
    </div>
  )
}

/** The running path, named — the one line every answer is dated against. */
export function DashaNow({
  path,
  graha,
  closes,
  className,
}: {
  path: string
  graha: DashaPeriod['graha']
  closes: string
  className?: string
}) {
  return (
    <div className={cn('flex min-w-0 items-start gap-3', className)}>
      <PlanetGlyph code={graha} size="lg" tone="dark" className="shrink-0" />
      <div className="min-w-0">
        <p className="font-mono text-label uppercase text-gold-soft-line">Running today</p>
        <p className="mt-1 font-mono text-data-lg text-on-celestial">{path}</p>
        <p className="mt-1 text-sm text-on-celestial-muted text-pretty">{closes}</p>
      </div>
    </div>
  )
}
