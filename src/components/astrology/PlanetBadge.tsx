import type { GrahaCode } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { GRAHAS } from '@/utils/astro'

export interface PlanetBadgeProps {
  code: GrahaCode
  /** Secondary line under the name — a rashi, a degree, a dasha window. */
  detail?: string
  /** Marks the graha a reading or a dasha period is actually about. */
  active?: boolean
  size?: 'sm' | 'md' | 'lg'
  tone?: 'light' | 'dark'
  className?: string
}

const SIZES = {
  sm: { box: 'size-7 text-sm', name: 'text-xs' },
  md: { box: 'size-9 text-base', name: 'text-sm' },
  lg: { box: 'size-12 text-xl', name: 'text-base' },
} as const

/**
 * A graha as a ringed glyph with its name — the planetary counterpart of
 * ZodiacBadge, for wherever a single graha is the subject: a dasha header, a
 * reading's citation, an orbit legend.
 */
export function PlanetBadge({
  code,
  detail,
  active = false,
  size = 'md',
  tone = 'light',
  className,
}: PlanetBadgeProps) {
  const meta = GRAHAS[code]
  const s = SIZES[size]
  const dark = tone === 'dark'

  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2.5', className)}>
      <span
        aria-hidden
        className={cn(
          'inline-grid shrink-0 place-items-center rounded-full border',
          s.box,
          dark
            ? active
              ? 'border-gold-soft-line bg-gold-soft-line/15 text-gold-soft-line'
              : 'border-celestial-line bg-indigo-royal/50 text-on-celestial-muted'
            : active
              ? 'border-gold bg-gold-soft text-gold-deep'
              : 'border-border bg-surface-sunken text-purple',
        )}
      >
        {meta.glyph}
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            'block truncate font-medium',
            s.name,
            dark ? 'text-on-celestial' : 'text-ink',
          )}
        >
          {meta.name}
        </span>
        {detail && (
          <span
            className={cn(
              'block truncate font-mono text-label uppercase',
              dark ? 'text-on-celestial-faint' : 'text-muted',
            )}
          >
            {detail}
          </span>
        )}
      </span>
      <span className="sr-only">{meta.english}</span>
    </span>
  )
}
