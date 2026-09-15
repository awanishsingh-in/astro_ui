import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import type { GrahaCode } from '@/types/astrology'
import { cn } from '@/utils/cn'

export interface NakshatraBadgeProps {
  name: string
  /** 1–4. The quarter of the nakshatra the graha stands in. */
  pada?: number
  /** The nakshatra's lord — what opens the Vimshottari cycle. */
  lord?: GrahaCode
  tone?: 'light' | 'dark'
  size?: 'sm' | 'md'
  className?: string
}

/**
 * A nakshatra, named with its pada and its lord.
 *
 * The lord matters more than it looks: it is the graha whose mahadasha the
 * chart opens on, so showing it here is what connects "born in Magha" to
 * "your dasha starts with Ketu" without a paragraph of explanation.
 */
export function NakshatraBadge({
  name,
  pada,
  lord,
  tone = 'light',
  size = 'md',
  className,
}: NakshatraBadgeProps) {
  const dark = tone === 'dark'

  return (
    <span
      className={cn(
        'inline-flex min-w-0 items-center gap-2 rounded-control border px-2.5 py-1.5',
        dark ? 'border-celestial-line bg-indigo-royal/40' : 'border-border bg-surface-sunken',
        className,
      )}
    >
      {/* Four quarter marks — the pada, drawn rather than spelled out. */}
      {pada !== undefined && (
        <span aria-hidden className="flex shrink-0 items-center gap-0.5">
          {[1, 2, 3, 4].map((quarter) => (
            <span
              key={quarter}
              className={cn(
                'block h-2.5 w-0.5 rounded-full',
                quarter === pada
                  ? dark
                    ? 'bg-gold-soft-line'
                    : 'bg-gold'
                  : dark
                    ? 'bg-celestial-line'
                    : 'bg-border-strong',
              )}
            />
          ))}
        </span>
      )}

      <span className="min-w-0">
        <span
          className={cn(
            'block truncate font-medium',
            size === 'sm' ? 'text-xs' : 'text-sub',
            dark ? 'text-on-celestial' : 'text-ink',
          )}
        >
          {name}
        </span>
        {lord && (
          <span
            className={cn(
              'mt-0.5 flex items-center gap-1 font-mono text-label uppercase',
              dark ? 'text-on-celestial-faint' : 'text-muted',
            )}
          >
            lord
            <PlanetGlyph code={lord} size="sm" tone={tone} />
          </span>
        )}
      </span>

      <span className="sr-only">
        Nakshatra {name}
        {pada !== undefined ? `, pada ${pada}` : ''}
      </span>
    </span>
  )
}
