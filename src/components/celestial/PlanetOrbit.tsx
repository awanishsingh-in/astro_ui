import { cn } from '@/utils/cn'
import type { GrahaCode } from '@/types/astrology'
import { GRAHAS } from '@/utils/astro'

export interface PlanetOrbitProps {
  /** Which grahas ride the tracks, innermost first. */
  grahas?: GrahaCode[]
  /** Which one to mark in gold — the graha a screen is currently about. */
  activeGraha?: GrahaCode
  tone?: 'light' | 'dark'
  /** Orbits revolve. Suppressed under prefers-reduced-motion. */
  animate?: boolean
  className?: string
}

/**
 * A small orrery: grahas on concentric tracks, each revolving at its own rate.
 *
 * The ordering and relative speeds follow the classical arrangement — Chandra
 * closest and quickest, Shani outermost and slowest — so the motion means
 * something rather than just spinning. Used on the calculating screen and as
 * the figure inside ZodiacOrbit.
 */
export function PlanetOrbit({
  grahas = ['Mo', 'Me', 'Ve', 'Su', 'Ma', 'Ju', 'Sa'],
  activeGraha,
  tone = 'dark',
  animate = true,
  className,
}: PlanetOrbitProps) {
  const dark = tone === 'dark'
  const line = dark ? 'var(--color-celestial-line)' : 'var(--color-border-strong)'
  const body = dark ? 'var(--color-on-celestial-muted)' : 'var(--color-purple)'
  const mark = dark ? 'var(--color-gold-soft-line)' : 'var(--color-gold)'

  const count = grahas.length
  const innermost = 12
  const step = (46 - innermost) / Math.max(count - 1, 1)

  return (
    <svg aria-hidden viewBox="0 0 100 100" className={cn('size-full', className)}>
      <circle cx="50" cy="50" r="4" fill={mark} opacity={dark ? 0.28 : 0.18} />

      {grahas.map((code, i) => {
        const r = innermost + step * i
        // Outer tracks take longer, the way real periods lengthen with distance.
        const period = 36 + i * 22
        const active = activeGraha === code
        const start = (i * 137.5) % 360

        return (
          <g
            key={code}
            style={{
              transformOrigin: '50% 50%',
              animation: animate ? `orbit ${period}s linear infinite` : undefined,
              animationDelay: `-${(period * start) / 360}s`,
            }}
            className={animate ? 'motion-reduce:[animation:none]' : undefined}
          >
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={active ? mark : line}
              strokeWidth="0.25"
              opacity={active ? 0.55 : 0.32}
            />
            <g transform={`translate(${50 + r} 50)`}>
              <circle
                r={active ? 2.6 : 1.9}
                fill={active ? mark : body}
                opacity={active ? 0.9 : 0.6}
              />
              {/*
                Counter-rotated at the same rate, so the graha travels its
                track without tumbling end over end.
              */}
              <g
                className="motion-reduce:[animation:none]"
                style={{
                  // fill-box, so it turns about its own centre rather than the
                  // centre of the whole figure.
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  animation: animate ? `orbit ${period}s linear infinite reverse` : undefined,
                  animationDelay: `-${(period * start) / 360}s`,
                }}
              >
                <text
                  x="0"
                  y="0.2"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="2.6"
                  fill={dark ? 'var(--color-midnight)' : 'var(--color-surface)'}
                  opacity="0.9"
                >
                  {GRAHAS[code].glyph}
                </text>
              </g>
            </g>
          </g>
        )
      })}
    </svg>
  )
}
