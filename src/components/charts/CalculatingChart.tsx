import { useId } from 'react'
import { cn } from '@/utils/cn'
import { GRAHAS, RASHIS } from '@/utils/astro'
import type { GrahaCode } from '@/types/astrology'

export interface CalculatingChartProps {
  /** 0–4. Each stage reveals one more layer of the wheel. */
  stage: number
  /** Which surface it is drawn on. Dark is the full-screen celestial version. */
  tone?: 'light' | 'dark'
  className?: string
}

/**
 * The chart assembling itself, stage by stage — not a spinner.
 *
 * Every element's visibility is derived from `stage`, so the animation is
 * CSS *transitions* rather than keyframe choreography: it cannot desynchronise
 * from the labels, it lands on a complete wheel, and under
 * `prefers-reduced-motion` the transitions collapse to nothing and the final
 * chart simply appears.
 *
 *   0  a point of light          "Reading your birth details"
 *   1  the rings draw            "Placing the planets"
 *   2  twelve houses divide      "Calculating your houses"
 *   3  the zodiac band arrives   "Mapping your nakshatra"
 *   4  the grahas settle in      "Preparing your chart"
 */
export function CalculatingChart({ stage, tone = 'light', className }: CalculatingChartProps) {
  const titleId = useId()
  const dark = tone === 'dark'
  const C = {
    rim: dark ? 'var(--color-gold-soft-line)' : 'var(--color-chart-rim)',
    muted: dark ? 'var(--color-on-celestial-muted)' : 'var(--color-muted)',
    benefic: dark ? 'var(--color-benefic-dark)' : 'var(--color-benefic)',
    malefic: dark ? 'var(--color-malefic-dark)' : 'var(--color-malefic)',
    node: dark ? 'var(--color-node-dark)' : 'var(--color-node)',
    core: dark ? 'var(--color-gold-soft-line)' : 'var(--color-gold)',
  }

  const point = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180
    return { x: 50 + radius * Math.cos(rad), y: 50 + radius * Math.sin(rad) }
  }

  // Bhava 1 at the left, running anticlockwise — the same construction the
  // real ChartWheel uses, so this reads as the chart and not as a loader.
  const houseMid = (bhava: number) => 180 - (bhava - 1) * 30 - 15

  /*
    Three bands: the zodiac outside, the houses inside it, the grahas within
    those. The same construction as the finished wheel, so what draws itself
    here is recognisably the chart that arrives on the next screen.
  */
  const R = { zodiacOut: 49, zodiacIn: 42, ringIn: 31, label: 36.5, graha: 23 }
  const OUTER = 2 * Math.PI * R.zodiacOut
  const INNER = 2 * Math.PI * R.ringIn

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('h-auto w-full select-none', className)}
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>Your birth chart being calculated.</title>

      {/* Rings — drawn by unwinding their dash offset. */}
      <circle
        cx="50"
        cy="50"
        r={R.zodiacOut}
        fill="none"
        stroke={C.rim}
        strokeWidth="0.6"
        strokeDasharray={OUTER}
        strokeDashoffset={stage >= 1 ? 0 : OUTER}
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 900ms var(--ease-out-soft)' }}
      />
      <circle
        cx="50"
        cy="50"
        r={R.ringIn}
        fill="none"
        stroke={C.rim}
        strokeWidth="0.6"
        strokeDasharray={INNER}
        strokeDashoffset={stage >= 1 ? 0 : INNER}
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 900ms var(--ease-out-soft) 120ms' }}
      />

      {/* Stage 3 — the zodiac band, the frame the nakshatra is measured in. */}
      <circle
        cx="50"
        cy="50"
        r={R.zodiacIn}
        fill="none"
        stroke={C.rim}
        strokeWidth="0.35"
        opacity={stage >= 3 ? 0.55 : 0}
        style={{ transition: 'opacity 600ms var(--ease-out-soft)' }}
      />
      <g>
        {RASHIS.map((rashi, i) => {
          const p = point(houseMid(i + 1), (R.zodiacIn + R.zodiacOut) / 2)
          return (
            <text
              key={rashi.name}
              x={p.x}
              y={p.y + 1.4}
              textAnchor="middle"
              fontSize="3.8"
              fill={C.rim}
              opacity={stage >= 3 ? 0.85 : 0}
              style={{ transition: `opacity 420ms var(--ease-out-soft) ${i * 55}ms` }}
            >
              {rashi.glyph}
            </text>
          )
        })}
      </g>

      {/* Twelve house divisions, each fading in a beat after the last. */}
      <g>
        {Array.from({ length: 12 }, (_, i) => {
          const angle = 180 - i * 30
          const a = point(angle, R.ringIn)
          const b = point(angle, R.zodiacOut)
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={C.rim}
              strokeWidth="0.45"
              opacity={stage >= 2 ? 1 : 0}
              style={{ transition: `opacity 420ms var(--ease-out-soft) ${i * 45}ms` }}
            />
          )
        })}
      </g>

      {/* House numbers. */}
      <g fontFamily="var(--font-mono)" fontSize="3.2" fill={C.muted}>
        {Array.from({ length: 12 }, (_, i) => {
          const p = point(houseMid(i + 1), R.label)
          return (
            <text
              key={i}
              x={p.x}
              y={p.y + 1.1}
              textAnchor="middle"
              opacity={stage >= 2 ? 1 : 0}
              style={{ transition: `opacity 420ms var(--ease-out-soft) ${180 + i * 45}ms` }}
            >
              {i + 1}
            </text>
          )
        })}
      </g>

      {/* The grahas drifting outward into their houses. */}
      <g>
        {PLACEMENTS.map(({ graha, bhava }, i) => {
          const p = point(houseMid(bhava), R.graha)
          const meta = GRAHAS[graha]
          return (
            <text
              key={graha}
              x={p.x}
              y={p.y + 1.7}
              textAnchor="middle"
              fontSize="4.6"
              fill={
                meta.nature === 'benefic' ? C.benefic : meta.nature === 'node' ? C.node : C.malefic
              }
              opacity={stage >= 4 ? 1 : 0}
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'center',
                transform: stage >= 4 ? 'scale(1)' : 'scale(0.4)',
                transition: `opacity 480ms var(--ease-out-soft) ${i * 70}ms, transform 480ms var(--ease-out-soft) ${i * 70}ms`,
              }}
            >
              {meta.glyph}
            </text>
          )
        })}
      </g>

      {/* The centre point — the first thing to appear, and it keeps breathing. */}
      <circle
        cx="50"
        cy="50"
        r={stage >= 1 ? 1.6 : 2.6}
        fill={C.core}
        style={{ transition: 'r 700ms var(--ease-out-soft)' }}
      >
        <animate attributeName="opacity" values="0.45;1;0.45" dur="2.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

/**
 * Where the grahas land. Not a real calculation — the actual chart arrives on
 * the next screen — but a plausible spread so the wheel fills evenly.
 */
const PLACEMENTS: { graha: GrahaCode; bhava: number }[] = [
  { graha: 'Su', bhava: 12 },
  { graha: 'Mo', bhava: 2 },
  { graha: 'Ma', bhava: 11 },
  { graha: 'Me', bhava: 1 },
  { graha: 'Ve', bhava: 4 },
  { graha: 'Ju', bhava: 6 },
  { graha: 'Sa', bhava: 9 },
  { graha: 'Ke', bhava: 7 },
]
