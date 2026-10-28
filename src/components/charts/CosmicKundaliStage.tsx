import { useMemo, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import './CosmicKundaliStage.css'

export type CosmicAwakeningMode = 'cinematic' | 'soft' | 'idle'

export interface CosmicKundaliStageProps {
  children: ReactNode
  /** Stable seed so the sky never reshuffles on rerender. */
  seed?: string
  /**
   * `cinematic` — full Cosmic Kundali Awakening (~3s), once.
   * `soft` — short crossfade for D1/D2 switches.
   * `idle` — ambient living kundali only.
   */
  mode?: CosmicAwakeningMode
  /** Brief frame illumination when switching divisionals. */
  framePulse?: boolean
  className?: string
  contentClassName?: string
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

/**
 * Cinematic celestial stage behind the North Indian kundli.
 * Particles and orbit are decorative only — never alter chart data.
 */
export function CosmicKundaliStage({
  children,
  seed = 'cyklos-kundali',
  mode = 'idle',
  framePulse = false,
  className,
  contentClassName,
}: CosmicKundaliStageProps) {
  const layers = useMemo(() => {
    const rand = seeded(seed)
    const stars = Array.from({ length: 56 }, (_, i) => {
      const depth = rand()
      return {
        id: i,
        x: rand() * 100,
        y: rand() * 100,
        r: depth > 0.72 ? 1.6 + rand() * 1.1 : 0.8 + rand() * 1,
        o: 0.12 + rand() * (depth > 0.7 ? 0.4 : 0.28),
        twinkle: rand() < 0.32,
        delay: rand() * 8,
        near: depth > 0.78,
      }
    })
    const motes = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 10 + rand() * 80,
      y: 20 + rand() * 60,
      delay: rand() * 14,
      duration: 14 + rand() * 10,
    }))
    const links: { x1: number; y1: number; x2: number; y2: number }[] = []
    for (let i = 0; i < 5; i += 1) {
      const a = stars[Math.floor(rand() * stars.length)]!
      const b = stars[Math.floor(rand() * stars.length)]!
      if (a.id === b.id) continue
      const dx = a.x - b.x
      const dy = a.y - b.y
      if (dx * dx + dy * dy > 380) continue
      links.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })
    }
    return { stars, motes, links }
  }, [seed])

  return (
    <div
      className={cn(
        'cosmic-kundali-stage rounded-[1.75rem] border border-[rgba(184,50,122,0.35)]',
        'shadow-[0_0_56px_-20px_rgba(184,50,122,0.55)]',
        mode === 'cinematic' && 'cosmic-kundali-stage--awaken',
        framePulse && 'cosmic-kundali-stage--frame-pulse',
        className,
      )}
    >
      <div className="cosmic-kundali-stage__void" aria-hidden />
      <div className="cosmic-kundali-stage__nebula" aria-hidden />
      <div className="cosmic-kundali-stage__dust" aria-hidden />
      <div className="cosmic-kundali-stage__core-glow" aria-hidden />

      <div className="cosmic-kundali-stage__stars" aria-hidden>
        {layers.stars.map((star) => (
          <span
            key={star.id}
            className={cn(
              'cosmic-kundali-stage__star',
              star.near && 'cosmic-kundali-stage__star--near',
              star.twinkle && 'cosmic-kundali-stage__star--twinkle',
            )}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.r}px`,
              height: `${star.r}px`,
              opacity: star.twinkle ? undefined : star.o,
              animationDelay: star.twinkle ? `${star.delay}s` : undefined,
            }}
          />
        ))}
        {layers.motes.map((mote) => (
          <span
            key={`mote-${mote.id}`}
            className="cosmic-kundali-stage__mote"
            style={{
              left: `${mote.x}%`,
              top: `${mote.y}%`,
              animationDelay: `${mote.delay}s`,
              animationDuration: `${mote.duration}s`,
            }}
          />
        ))}
      </div>

      <svg
        aria-hidden
        className="cosmic-kundali-stage__constellation"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {layers.links.map((link, i) => (
          <line
            key={i}
            x1={link.x1}
            y1={link.y1}
            x2={link.x2}
            y2={link.y2}
            stroke=""
            strokeWidth="0.15"
          />
        ))}
      </svg>

      <div className="cosmic-kundali-stage__orbit" aria-hidden>
        <div className="cosmic-kundali-stage__orbit-spin">
          <ZodiacOrbitDecor />
        </div>
      </div>

      <div className="cosmic-kundali-stage__wave" aria-hidden />
      <div className="cosmic-kundali-stage__frame-flash" aria-hidden />

      <div className={cn('cosmic-kundali-stage__content', contentClassName)}>
        <div
          className={cn(
            'cosmic-kundali-stage__chart-slot',
            mode === 'soft' && 'cosmic-kundali-stage__chart-slot--soft',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

/** Decorative zodiac-inspired ring — not the chart, never drives house numbers. */
function ZodiacOrbitDecor() {
  const markers = Array.from({ length: 12 }, (_, i) => (i * 360) / 12)
  return (
    <svg viewBox="0 0 100 100" className="size-full">
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke=""
        strokeWidth="0.35"
      />
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke=""
        strokeWidth="0.28"
        strokeDasharray="1.2 2.4"
      />
      {markers.map((deg) => {
        const rad = ((deg - 90) * Math.PI) / 180
        const x1 = 50 + 44.2 * Math.cos(rad)
        const y1 = 50 + 44.2 * Math.sin(rad)
        const x2 = 50 + 46.8 * Math.cos(rad)
        const y2 = 50 + 46.8 * Math.sin(rad)
        const px = 50 + 42 * Math.cos(rad)
        const py = 50 + 42 * Math.sin(rad)
        return (
          <g key={deg}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke=""
              strokeWidth="0.35"
            />
            <circle cx={px} cy={py} r="0.55" fill="" />
          </g>
        )
      })}
      {/* Slow orbiting highlight */}
      <circle r="0.9" fill="">
        <animateMotion dur="48s" repeatCount="indefinite" path="M50 4 A46 46 0 1 1 49.9 4" />
      </circle>
    </svg>
  )
}
