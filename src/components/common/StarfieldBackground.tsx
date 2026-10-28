import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/utils/cn'

export interface StarfieldBackgroundProps {
  /** Total stars across all parallax layers. */
  count?: number
  seed?: string
  /** Occasional shooting star (hero). */
  shootingStars?: boolean
  className?: string
}

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

type Star = {
  id: string
  x: number
  y: number
  r: number
  o: number
  twinkle: boolean
  delay: number
  layer: 0 | 1 | 2
}

/**
 * Lightweight animated starfield — 2–3 parallax layers, twinkle, optional meteors.
 * Pauses when the tab is hidden; respects prefers-reduced-motion.
 */
export function StarfieldBackground({
  count = 72,
  seed = 'cosmos-ai',
  shootingStars = false,
  className,
}: StarfieldBackgroundProps) {
  const [visible, setVisible] = useState(true)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const stars = useMemo(() => {
    const rand = seeded(seed)
    return Array.from({ length: count }, (_, i): Star => ({
      id: `${seed}-${i}`,
      x: rand() * 100,
      y: rand() * 100,
      r: 0.8 + rand() * 1.6,
      o: 0.14 + rand() * 0.4,
      twinkle: rand() < 0.4,
      delay: rand() * 6,
      layer: (i % 3) as 0 | 1 | 2,
    }))
  }, [count, seed])

  const layers: Array<0 | 1 | 2> = [0, 1, 2]
  const paused = !visible || reduceMotion

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      data-paused={paused || undefined}
    >
      {layers.map((layer) => (
        <div
          key={layer}
          className={cn(
            'absolute inset-0',
            !paused && layer === 1 && 'motion-safe:animate-[nebula-drift_60s_ease-in-out_infinite]',
            !paused && layer === 2 && 'motion-safe:animate-[nebula-drift_90s_ease-in-out_infinite_reverse]',
          )}
          style={{ opacity: layer === 0 ? 1 : layer === 1 ? 0.85 : 0.7 }}
        >
          {stars
            .filter((s) => s.layer === layer)
            .map((star) => (
              <span
                key={star.id}
                className={cn(
                  'absolute rounded-full bg-text-primary',
                  !paused && star.twinkle && 'animate-twinkle',
                )}
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.r}px`,
                  height: `${star.r}px`,
                  opacity: star.twinkle && !paused ? undefined : star.o,
                  animationDelay: star.twinkle ? `${star.delay}s` : undefined,
                  animationPlayState: paused ? 'paused' : 'running',
                }}
              />
            ))}
        </div>
      ))}

      {shootingStars && !paused && (
        <>
          <span
            className="absolute top-[12%] right-[18%] h-px w-16 origin-right bg-gradient-to-l from-text-primary/80 to-transparent animate-meteor"
            style={{ animationDelay: '1.2s' }}
          />
          <span
            className="absolute top-[28%] right-[40%] h-px w-12 origin-right bg-gradient-to-l from-blue-light/70 to-transparent animate-meteor"
            style={{ animationDelay: '4.6s' }}
          />
        </>
      )}
    </div>
  )
}
