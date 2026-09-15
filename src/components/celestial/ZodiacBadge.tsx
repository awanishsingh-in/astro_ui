import type { RashiName } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { RASHIS } from '@/utils/astro'

export interface ZodiacBadgeProps {
  rashi: RashiName
  /** Also print the English name — for places the Sanskrit alone is opaque. */
  withEnglish?: boolean
  size?: 'sm' | 'md' | 'lg'
  tone?: 'light' | 'dark'
  className?: string
}

const SIZES = {
  sm: { box: 'size-7 text-sm', label: 'text-xs' },
  md: { box: 'size-9 text-base', label: 'text-sm' },
  lg: { box: 'size-12 text-xl', label: 'text-base' },
} as const

/**
 * A rashi as a gold-ringed glyph with its name — the identity marker for a
 * sign wherever one is named: lagna, moon sign, a horoscope header.
 */
export function ZodiacBadge({
  rashi,
  withEnglish = false,
  size = 'md',
  tone = 'light',
  className,
}: ZodiacBadgeProps) {
  const meta = RASHIS.find((r) => r.name === rashi)
  const s = SIZES[size]

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden
        className={cn(
          'inline-grid shrink-0 place-items-center rounded-full border',
          s.box,
          tone === 'dark'
            ? 'border-gold-soft-line/45 bg-indigo-royal/60 text-gold-soft-line'
            : 'border-gold-border bg-gold-soft text-gold-deep',
        )}
      >
        {meta?.glyph}
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            'block truncate font-medium',
            s.label,
            tone === 'dark' ? 'text-on-celestial' : 'text-ink',
          )}
        >
          {rashi}
        </span>
        {withEnglish && (
          <span
            className={cn(
              'block truncate text-xs',
              tone === 'dark' ? 'text-on-celestial-muted' : 'text-muted',
            )}
          >
            {meta?.english}
          </span>
        )}
      </span>
    </span>
  )
}
