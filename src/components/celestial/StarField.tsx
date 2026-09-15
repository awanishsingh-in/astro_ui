import { useMemo } from 'react'
import { cn } from '@/utils/cn'

export interface StarFieldProps {
  /** How many points. Kept low — this is atmosphere, not a galaxy. */
  count?: number
  /** Stable layout for a given string, so a field never reshuffles on render. */
  seed?: string
  className?: string
}

/** Deterministic PRNG, so the same seed always yields the same sky. */
function seeded(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * A scatter of faint points for celestial surfaces.
 *
 * Deliberately restrained: small radii, low opacity, a slow twinkle on a
 * third of them. It should read as depth behind the content, never as a
 * decorative space scene — if you notice it, it is too strong.
 */
export function StarField({ count = 48, seed = 'cyklos', className }: StarFieldProps) {
  const stars = useMemo(() => {
    const rand = seeded(seed)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      // Pixel radius. Anything above two reads as a dot, not a star.
      r: 1 + rand() * 1.2,
      o: 0.16 + rand() * 0.34,
      // Only some twinkle, and each on its own offset, so there is no pulse.
      twinkle: rand() < 0.35,
      delay: rand() * 6,
    }))
  }, [count, seed])

  return (
    <div
      aria-hidden
      className={cn('star-field pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {/*
        Positioned in percentages but sized in pixels: an SVG stretched to a
        wide viewport turns every star into an ellipse, and a sky of ovals
        reads as a texture rather than as stars.
      */}
      {stars.map((star) => (
        <span
          key={star.id}
          className={cn(
            'star-dot absolute rounded-full bg-on-celestial',
            star.twinkle && 'animate-twinkle',
          )}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.r}px`,
            height: `${star.r}px`,
            // A twinkling star takes its opacity from the keyframes, which
            // beat an inline value anyway.
            opacity: star.twinkle ? undefined : star.o,
            animationDelay: star.twinkle ? `${star.delay}s` : undefined,
          }}
        />
      ))}
    </div>
  )
}
