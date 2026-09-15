import type { RashiName } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { RASHIS } from '@/utils/astro'

export interface ZodiacSymbolsProps {
  /** Mark one sign — the lagna, usually. */
  activeRashi?: RashiName
  tone?: 'light' | 'dark'
  /** Scrolls rather than wraps. The mobile default under a chart. */
  scrollable?: boolean
  className?: string
}

/**
 * The twelve signs as a line rather than a ring.
 *
 * Where `ZodiacRing` is geometry, this is a legend: it fits under a chart or
 * along a header, and marking the lagna in it says "your chart starts here"
 * without spending the vertical space a second wheel would cost.
 */
export function ZodiacSymbols({
  activeRashi,
  tone = 'light',
  scrollable = false,
  className,
}: ZodiacSymbolsProps) {
  const dark = tone === 'dark'

  return (
    <ul
      className={cn(
        'flex min-w-0 items-center justify-between gap-1',
        scrollable && 'no-scrollbar overflow-x-auto',
        className,
      )}
    >
      {RASHIS.map((rashi) => {
        const active = rashi.name === activeRashi
        return (
          <li key={rashi.name} className="shrink-0">
            <span
              aria-hidden
              className={cn(
                'block text-center text-sm transition-opacity duration-200',
                active
                  ? dark
                    ? 'text-gold-soft-line opacity-100'
                    : 'text-gold opacity-100'
                  : dark
                    ? 'text-on-celestial-muted opacity-45'
                    : 'text-muted opacity-50',
              )}
            >
              {rashi.glyph}
            </span>
            {/* The active sign is the only one that needs naming. */}
            {active && (
              <span
                className={cn(
                  'mt-0.5 block text-center font-mono text-[9px] uppercase',
                  dark ? 'text-gold-soft-line' : 'text-gold-deep',
                )}
              >
                {rashi.name}
              </span>
            )}
            <span className="sr-only">
              {rashi.name}
              {active ? ' — your lagna' : ''}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
