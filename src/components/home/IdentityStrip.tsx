import { Link } from 'react-router-dom'
import type { ChartSummary } from '@/utils/astro'
import { GRAHAS, rashiGlyph } from '@/utils/astro'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'

export interface IdentityStripProps {
  summary: ChartSummary
  /** The nakshatra Chandra occupies — the third value a chart is known by. */
  nakshatra?: string
  className?: string
}

/**
 * The three values that identify a chart, in one line under the greeting.
 *
 * Lagna, Chandra and the nakshatra it sits in: what an astrologer asks for
 * before anything else. Putting them at the top of Home is the smallest
 * possible version of "the cosmos, made personal" — the screen knows whose
 * sky it is opening.
 */
export function IdentityStrip({ summary, nakshatra, className }: IdentityStripProps) {
  const items = [
    { key: 'Lagna', glyph: rashiGlyph(summary.ascendant.rashi), value: summary.ascendant.rashi },
    { key: 'Chandra', glyph: GRAHAS.Mo.glyph, value: summary.moon.rashi },
    ...(nakshatra ? [{ key: 'Nakshatra', glyph: null, value: nakshatra }] : []),
  ]

  return (
    <Link
      to={paths.chart}
      className={cn(
        'inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-4 gap-y-2 rounded-control',
        'border border-border bg-surface px-3.5 py-2',
        'transition-colors duration-150 ease-out-soft hover:border-gold-border hover:bg-gold-soft',
        className,
      )}
    >
      {items.map((item) => (
        <span key={item.key} className="inline-flex min-w-0 items-baseline gap-1.5">
          <span className="font-mono text-label uppercase text-muted">{item.key}</span>
          {item.glyph && (
            <span aria-hidden className="text-sm text-gold">
              {item.glyph}
            </span>
          )}
          <span className="truncate text-sub font-medium text-ink">{item.value}</span>
        </span>
      ))}
      <span className="sr-only">Open my chart</span>
    </Link>
  )
}
