import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { ConstellationPattern } from './ConstellationPattern'
import { OrbitalLines } from './OrbitalLines'
import { StarField } from './StarField'
import { ZodiacRing } from './ZodiacRing'

export type CelestialMotif = 'stars' | 'orbits' | 'constellation' | 'zodiac'

export interface CelestialBackgroundProps {
  /** Which atmospheric layers to draw. Two is usually the limit. */
  motifs?: CelestialMotif[]
  /** Deeper for full-screen moments, softer for panels inside a light page. */
  tone?: 'midnight' | 'indigo' | 'royal'
  /** Stable star layout — pass something identifying, like a route name. */
  seed?: string
  children?: ReactNode
  className?: string
  /** Applied to the content wrapper, not the celestial layers. */
  contentClassName?: string
}

const TONES = {
  midnight: 'bg-midnight',
  indigo: 'bg-indigo-deep',
  royal: 'bg-indigo-royal',
} as const

/**
 * A dark celestial surface: the night-sky end of the palette used for whole
 * sections rather than accents.
 *
 * Every layer is drawn at 5–15% so it reads as depth rather than decoration —
 * the content on top stays the subject. Layers are `aria-hidden` and inert;
 * `prefers-reduced-motion` stops the drift in base.css.
 */
export function CelestialBackground({
  motifs = ['stars'],
  tone = 'midnight',
  seed = 'cyklos',
  children,
  className,
  contentClassName,
}: CelestialBackgroundProps) {
  const has = (m: CelestialMotif) => motifs.includes(m)

  return (
    <div className={cn('relative isolate overflow-hidden', TONES[tone], className)}>
      {/* A single soft lift from the upper left, so the field is not flat. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(120% 90% at 18% 0%, var(--color-indigo-royal) 0%, transparent 62%)',
        }}
      />

      {has('stars') && <StarField seed={seed} className="opacity-55" />}

      {has('orbits') && (
        <OrbitalLines
          className="text-gold-soft-line opacity-[0.13] motion-safe:animate-zodiac-turn-slow"
          cx={78}
          cy={22}
          spread={58}
        />
      )}

      {has('constellation') && (
        <ConstellationPattern animate className="text-on-celestial opacity-[0.14]" />
      )}

      {has('zodiac') && (
        // Anchored off the bottom-right corner so only an arc of the ring is
        // ever on screen — a horizon rather than a logo floating in the panel.
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[38%] -bottom-[26%] aspect-square w-[110%] opacity-[0.13]"
        >
          <ZodiacRing tone="dark" spin ticks />
        </div>
      )}

      {children !== undefined && <div className={cn('relative', contentClassName)}>{children}</div>}
    </div>
  )
}
