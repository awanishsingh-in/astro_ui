import { cn } from '@/utils/cn'
import { RASHIS } from '@/utils/astro'

export interface ZodiacRingProps {
  /** Which surface it sits on — decides line and glyph colour. */
  tone?: 'light' | 'dark'
  /** Highlight one rashi, 1-based from Mesha. */
  activeRashi?: number
  /** Slow rotation. Suppressed under prefers-reduced-motion. */
  spin?: boolean
  /** Draw the 30 one-degree ticks inside each sign. */
  ticks?: boolean
  /** Faster drift for hero moments — still slow, just more readable. */
  pace?: 'calm' | 'hero'
  className?: string
}

const R_OUTER = 48
const R_INNER = 39

/*
  The ring drifts, but the glyphs must not turn with it — a zodiac whose signs
  are upside down reads as a broken graphic, not as motion. Each glyph counters
  the ring's rotation exactly, so it travels with its segment and stays upright.
*/
const TURN = 'orbit 240s linear infinite'
const COUNTER_TURN = 'orbit 240s linear infinite reverse'
const TURN_LANDING = 'orbit 120s linear infinite'
const COUNTER_TURN_LANDING = 'orbit 120s linear infinite reverse'

/**
 * The twelve rashis as a ring of thirty-degree segments, Mesha at the top
 * running clockwise the way a zodiac wheel is printed.
 *
 * Used as the outer frame of a chart and, at low opacity, as the geometry
 * behind celestial surfaces. It is real astronomy, not ornament: the divisions
 * are exactly 30°, and the ticks are degrees.
 */
export function ZodiacRing({
  tone = 'light',
  activeRashi,
  spin = false,
  ticks = false,
  pace = 'calm',
  className,
}: ZodiacRingProps) {
  const line = tone === 'dark' ? 'var(--color-gold-soft-line)' : 'var(--color-chart-rim)'
  const glyph = tone === 'dark' ? 'var(--color-gold-soft-line)' : 'var(--color-gold)'
  const turn = pace === 'hero' ? TURN_LANDING : TURN
  const counter = pace === 'hero' ? COUNTER_TURN_LANDING : COUNTER_TURN

  const point = (deg: number, r: number) => {
    const rad = ((deg - 90) * Math.PI) / 180
    return [50 + r * Math.cos(rad), 50 + r * Math.sin(rad)] as const
  }

  return (
    <svg aria-hidden viewBox="0 0 100 100" className={cn('size-full', className)}>
      <g
        className="motion-reduce:[animation:none]"
        style={{
          transformOrigin: '50px 50px',
          animation: spin ? turn : undefined,
        }}
      >
        <circle
          cx="50"
          cy="50"
          r={R_OUTER}
          fill="none"
          stroke={line}
          strokeWidth="0.4"
          opacity="0.8"
        />
        <circle
          cx="50"
          cy="50"
          r={R_INNER}
          fill="none"
          stroke={line}
          strokeWidth="0.3"
          opacity="0.5"
        />

        {RASHIS.map((rashi, i) => {
          const start = i * 30
          const mid = start + 15
          const [x1, y1] = point(start, R_INNER)
          const [x2, y2] = point(start, R_OUTER)
          const [gx, gy] = point(mid, (R_INNER + R_OUTER) / 2)
          const active = activeRashi === i + 1

          return (
            <g key={rashi.name}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={line} strokeWidth="0.3" opacity="0.6" />
              {active && (
                <path
                  d={(() => {
                    const [ax, ay] = point(start, R_INNER)
                    const [bx, by] = point(start + 30, R_INNER)
                    const [cx, cy] = point(start + 30, R_OUTER)
                    const [dx, dy] = point(start, R_OUTER)
                    return `M${ax} ${ay} A${R_INNER} ${R_INNER} 0 0 1 ${bx} ${by} L${cx} ${cy} A${R_OUTER} ${R_OUTER} 0 0 0 ${dx} ${dy} Z`
                  })()}
                  fill={glyph}
                  opacity="0.16"
                  className="motion-safe:animate-pulse-soft"
                />
              )}
              <g
                className="motion-reduce:[animation:none]"
                style={{
                  transformBox: 'view-box',
                  transformOrigin: `${gx}px ${gy}px`,
                  animation: spin ? counter : undefined,
                }}
              >
                <text
                  x={gx}
                  y={gy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="4.6"
                  fill={glyph}
                  opacity={active ? 1 : 0.72}
                >
                  {rashi.glyph}
                </text>
              </g>
            </g>
          )
        })}

        {ticks &&
          Array.from({ length: 72 }, (_, i) => {
            // Every 5°, with a longer mark at each 10°.
            const deg = i * 5
            const long = deg % 10 === 0
            const [x1, y1] = point(deg, R_INNER)
            const [x2, y2] = point(deg, R_INNER - (long ? 2.2 : 1.2))
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={line}
                strokeWidth="0.22"
                opacity={long ? 0.5 : 0.28}
              />
            )
          })}
      </g>
    </svg>
  )
}
