import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface AstroChipProps {
  /** The reading's name — LAGNA, CHANDRA, NAKSHATRA, AYANAMSA. */
  label: string
  /** A glyph before the value. Pass a PlanetGlyph or a rashi character. */
  glyph?: ReactNode
  value: ReactNode
  tone?: 'light' | 'dark'
  /** Marks the one value a screen is currently about. */
  active?: boolean
  className?: string
}

/**
 * One instrument reading: a tracked mono label, then the value.
 *
 * The single-token form of `AstroMetadata` — used where readings appear one at
 * a time rather than as a row, such as on a card or beside a heading. Keeping
 * both on the same label/value shape is what makes the strips across the app
 * read as one system.
 */
export function AstroChip({
  label,
  glyph,
  value,
  tone = 'light',
  active = false,
  className,
}: AstroChipProps) {
  const dark = tone === 'dark'

  return (
    <span
      className={cn(
        'inline-flex min-w-0 items-baseline gap-1.5 rounded-xs border px-2 py-1',
        dark
          ? active
            ? 'border-gold-soft-line/50 bg-gold-soft-line/10'
            : 'border-celestial-line bg-indigo-royal/40'
          : active
            ? 'border-gold-border bg-gold-soft'
            : 'border-border bg-surface-sunken',
        className,
      )}
    >
      <span
        className={cn(
          'shrink-0 font-mono text-label uppercase',
          dark ? 'text-on-celestial-faint' : 'text-muted',
        )}
      >
        {label}
      </span>
      {glyph && (
        <span
          aria-hidden
          className={cn('shrink-0 text-sm', dark ? 'text-gold-soft-line' : 'text-gold')}
        >
          {glyph}
        </span>
      )}
      <span
        className={cn(
          'min-w-0 truncate text-sub font-medium',
          dark ? 'text-on-celestial' : 'text-ink',
        )}
      >
        {value}
      </span>
    </span>
  )
}
