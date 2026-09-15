import { useEffect, useId, useState } from 'react'
import type { Chart, GrahaCode } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { formatDegree, GRAHAS, rashiGlyph, RETROGRADE_MARK } from '@/utils'

export type ChartWheelTone = 'light' | 'dark'

export interface ChartWheelProps {
  chart: Chart
  /** Highlighted bhava — the wedge fills gold. */
  activeBhava?: number
  onBhavaClick?: (bhava: number) => void
  /** Highlighted graha — its glyph lifts and rings. */
  activeGraha?: GrahaCode | null
  onGrahaClick?: (graha: GrahaCode) => void
  /** Centre line — defaults to the lagna degree. */
  centerLabel?: string
  centerSubLabel?: string
  /**
   * Changing this re-plays the settling animation. Pass the varga code so the
   * wheel turns when the divisional chart is switched.
   */
  animationKey?: string
  /** Draw the aspect lines for the active graha across the wheel. */
  aspectsFrom?: number[]
  interactive?: boolean
  /** Which surface the wheel sits on. Dark is the celestial panel. */
  tone?: ChartWheelTone
  /** Outer band of rashi glyphs, turned to this chart's lagna. */
  zodiac?: boolean
  /** Degree ticks around the rim — five degrees each, ten marked longer. */
  ticks?: boolean
  className?: string
}

/**
 * The wheel: twelve clean spokes, houses 1–12 in the outer ring, the grahas
 * placed in their bhava. No stray chords, no decoration — the geometry is the
 * whole graphic.
 *
 * With `zodiac` the ring is wrapped in a band of rashi glyphs turned to the
 * chart's own lagna, and `ticks` adds the degree scale. Both are real
 * astronomy rather than ornament: the band says which sign each house falls
 * in, which is exactly what a printed chart shows.
 *
 * Drawn in a 0–100 viewBox and scaled by its container, so it stays legible
 * from a 320px phone to a full desktop panel.
 */
export function ChartWheel({
  chart,
  activeBhava,
  onBhavaClick,
  activeGraha,
  onGrahaClick,
  centerLabel,
  centerSubLabel,
  animationKey,
  aspectsFrom,
  interactive = false,
  tone = 'light',
  zodiac = false,
  ticks = false,
  className,
}: ChartWheelProps) {
  const titleId = useId()
  const center = centerLabel ?? formatDegree(chart.lagna.degree, chart.lagna.minute)
  const sub = centerSubLabel ?? `LAGNA ${chart.lagna.rashi.toUpperCase()}`
  const dark = tone === 'dark'

  /*
    The zodiac band needs room outside the house ring, so the whole figure
    steps in when it is shown. One table rather than magic numbers scattered
    through the drawing code.
  */
  const R = zodiac
    ? { zodiacOut: 49, zodiacIn: 42, ringOut: 42, ringIn: 32, label: 37, graha: 25, aspect: 20 }
    : { zodiacOut: 49, zodiacIn: 49, ringOut: 49, ringIn: 38, label: 43.5, graha: 30, aspect: 24 }

  const C = {
    /*
      On the dark wheel gold is reserved for the rim and the zodiac band; the
      spokes and the inner ring are drawn in the celestial line colour. Gold on
      every stroke would make the whole figure gold, which is exactly what the
      palette says it must never be.
    */
    rim: dark ? 'var(--color-chart-rim-dark)' : 'var(--color-chart-rim)',
    structure: dark ? 'var(--color-chart-line-dark)' : 'var(--color-chart-rim)',
    field: dark ? 'transparent' : 'var(--color-surface)',
    line: dark ? 'var(--color-chart-line-dark)' : 'var(--color-chart-line)',
    highlight: dark ? 'var(--color-chart-highlight-dark)' : 'var(--color-chart-highlight)',
    ink: dark ? 'var(--color-on-celestial)' : 'var(--color-ink)',
    muted: dark ? 'var(--color-on-celestial-muted)' : 'var(--color-muted)',
    accent: dark ? 'var(--color-gold-soft-line)' : 'var(--color-gold)',
    accentText: dark ? 'var(--color-gold-soft-line)' : 'var(--color-gold-deep)',
    benefic: dark ? 'var(--color-benefic-dark)' : 'var(--color-benefic)',
    malefic: dark ? 'var(--color-malefic-dark)' : 'var(--color-malefic)',
    node: dark ? 'var(--color-node-dark)' : 'var(--color-node)',
    retrograde: dark ? 'var(--color-retrograde-dark)' : 'var(--color-retrograde)',
  }

  /*
    A short settle whenever the chart changes: the wheel arrives turned a few
    degrees and eases to rest. Driven by state rather than a CSS keyframe so it
    replays on every varga switch, and it is a transform only — the geometry
    itself never moves.
  */
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    setSettled(false)
    const raf = requestAnimationFrame(() => setSettled(true))
    return () => cancelAnimationFrame(raf)
  }, [animationKey])

  /**
   * Bhava 1 starts at the left (9 o'clock) and the houses run counter-clockwise
   * from there — 4 at the bottom, 7 at the right, 10 at the top. SVG's y axis
   * points down, so counter-clockwise on screen means a *decreasing* angle.
   */
  const bhavaStart = (bhava: number) => 180 - (bhava - 1) * 30
  const bhavaMid = (bhava: number) => bhavaStart(bhava) - 15

  const point = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180
    return { x: 50 + radius * Math.cos(rad), y: 50 + radius * Math.sin(rad) }
  }

  const grahasByBhava = new Map<number, GrahaCode[]>()
  for (const g of chart.grahas) {
    const list = grahasByBhava.get(g.bhava) ?? []
    list.push(g.graha)
    grahasByBhava.set(g.bhava, list)
  }
  const retrograde = new Set(
    chart.grahas.filter((g) => g.motion === 'retrograde').map((g) => g.graha),
  )
  const rashiOf = new Map(chart.bhavas.map((b) => [b.bhava as number, b.rashi]))

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('h-auto w-full select-none', className)}
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>
        {chart.varga} chart. Lagna {chart.lagna.rashi} at {center}. Twelve bhavas with their grahas.
      </title>

      <g
        style={{
          transformOrigin: '50px 50px',
          transform: settled ? 'rotate(0deg) scale(1)' : 'rotate(-6deg) scale(0.97)',
          opacity: settled ? 1 : 0.4,
          transition: 'transform 620ms var(--ease-out-soft), opacity 420ms var(--ease-out-soft)',
        }}
      >
        {/* Rings */}
        <circle cx="50" cy="50" r={R.zodiacOut} fill={C.field} stroke={C.rim} strokeWidth="0.7" />
        {zodiac && (
          <circle
            cx="50"
            cy="50"
            r={R.zodiacIn}
            fill={C.field}
            stroke={C.rim}
            strokeWidth="0.45"
            opacity="0.55"
          />
        )}
        <circle
          cx="50"
          cy="50"
          r={R.ringIn}
          fill={C.field}
          stroke={C.structure}
          strokeWidth="0.7"
        />

        {/* Degree ticks, five apart, every tenth drawn longer. */}
        {ticks &&
          Array.from({ length: 72 }, (_, i) => {
            const angle = i * 5
            const long = angle % 10 === 0
            const a = point(angle, R.zodiacOut)
            const b = point(angle, R.zodiacOut - (long ? 2 : 1.1))
            return (
              <line
                key={angle}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={C.rim}
                strokeWidth="0.22"
                opacity={long ? 0.55 : 0.3}
              />
            )
          })}

        {/* The rashi each bhava falls in, in the outer band. */}
        {zodiac &&
          Array.from({ length: 12 }, (_, i) => {
            const bhava = i + 1
            const rashi = rashiOf.get(bhava)
            if (!rashi) return null
            const g = point(bhavaMid(bhava), (R.zodiacIn + R.zodiacOut) / 2)
            return (
              <text
                key={bhava}
                x={g.x}
                y={g.y + 1.4}
                textAnchor="middle"
                fontSize="4"
                fill={C.accent}
                opacity={bhava === activeBhava ? 1 : 0.72}
                className="pointer-events-none"
              >
                {rashiGlyph(rashi)}
              </text>
            )
          })}

        {/* Highlighted bhava wedge */}
        {activeBhava !== undefined && (
          <path
            d={wedgePath(activeBhava)}
            fill={C.highlight}
            stroke={C.accent}
            strokeWidth="0.6"
            style={{ transition: 'all 300ms var(--ease-out-soft)' }}
          />
        )}

        {/*
          The orbital track the grahas sit on. One hairline at very low
          opacity — enough to make the placements read as positions on a path
          rather than glyphs floating in a disc.
        */}
        <circle
          cx="50"
          cy="50"
          r={R.graha}
          fill="none"
          stroke={C.line}
          strokeWidth="0.25"
          opacity={dark ? 0.5 : 0.12}
        />

        {/* Twelve spokes across the outer ring */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = 180 - i * 30
          const inner = point(angle, R.ringIn)
          const outer = point(angle, R.zodiacOut)
          return (
            <line
              key={i}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={C.structure}
              strokeWidth="0.5"
            />
          )
        })}

        {/*
          Aspect lines from the selected graha to the bhavas it looks at.
          First entry is where the graha sits; the rest are its targets.
        */}
        {aspectsFrom && aspectsFrom.length > 1 && (
          <AspectLines
            source={aspectsFrom[0]}
            targets={aspectsFrom.slice(1)}
            point={point}
            bhavaMid={bhavaMid}
            radius={R.aspect}
            stroke={C.accent}
          />
        )}

        {/* House numbers in the ring, and the grahas inside it */}
        {Array.from({ length: 12 }, (_, i) => {
          const bhava = i + 1
          const angle = bhavaMid(bhava)
          const label = point(angle, R.label)
          const occupants = grahasByBhava.get(bhava) ?? []
          const isActive = bhava === activeBhava

          return (
            <g key={bhava}>
              {(onBhavaClick || interactive) && (
                <path
                  d={wedgePath(bhava)}
                  fill="transparent"
                  className={cn(
                    onBhavaClick && 'cursor-pointer',
                    onBhavaClick && !dark && 'hover:fill-[var(--color-chart-field)]',
                    onBhavaClick && dark && 'hover:fill-[var(--color-indigo-royal)]',
                  )}
                  onClick={onBhavaClick ? () => onBhavaClick(bhava) : undefined}
                  role={onBhavaClick ? 'button' : undefined}
                  aria-label={onBhavaClick ? `Bhava ${bhava}` : undefined}
                />
              )}
              <text
                x={label.x}
                y={label.y + 1.3}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="3.6"
                fill={isActive ? C.accentText : C.muted}
                fontWeight={isActive ? 600 : 400}
                className="pointer-events-none"
              >
                {bhava}
              </text>

              {occupants.map((code, index) => {
                // Up to three per ring, then step inward — glyphs never collide
                // even when four grahas share one bhava.
                const row = Math.floor(index / 3)
                const column = index % 3
                const inRow = Math.min(3, occupants.length - row * 3)
                const spread = (column - (inRow - 1) / 2) * 9
                const g = point(angle + spread, R.graha - row * 7.5)
                const meta = GRAHAS[code]
                const selected = activeGraha === code

                return (
                  <g
                    key={code}
                    onClick={onGrahaClick ? () => onGrahaClick(code) : undefined}
                    className={cn(onGrahaClick && 'cursor-pointer')}
                    role={onGrahaClick ? 'button' : undefined}
                    aria-label={onGrahaClick ? meta.english : undefined}
                  >
                    {selected && (
                      <circle
                        cx={g.x}
                        cy={g.y}
                        r="4"
                        fill={dark ? 'var(--color-indigo-royal)' : 'var(--color-gold-soft)'}
                        stroke={C.accent}
                        strokeWidth="0.6"
                      />
                    )}
                    <text
                      x={g.x}
                      y={g.y + 1.8}
                      textAnchor="middle"
                      fontSize={selected ? 5.6 : 5}
                      fontWeight={selected ? 600 : 400}
                      fill={
                        meta.nature === 'benefic'
                          ? C.benefic
                          : meta.nature === 'node'
                            ? C.node
                            : C.malefic
                      }
                      style={{ transition: 'font-size 200ms var(--ease-out-soft)' }}
                    >
                      {meta.glyph}
                    </text>
                    {retrograde.has(code) && (
                      <text
                        x={g.x + 3.2}
                        y={g.y - 1.4}
                        textAnchor="middle"
                        fontSize="2.6"
                        fill={C.retrograde}
                      >
                        {RETROGRADE_MARK}
                      </text>
                    )}
                  </g>
                )
              })}
            </g>
          )
        })}

        {/* Centre: the lagna, in mono */}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="4.6"
          fill={C.ink}
        >
          {center}
        </text>
        <text
          x="50"
          y="56"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="3.2"
          letterSpacing="0.4"
          fill={C.muted}
        >
          {sub}
        </text>
      </g>
    </svg>
  )

  /** The 30° wedge for one bhava, between the inner and outer ring. */
  function wedgePath(bhava: number): string {
    const start = bhavaStart(bhava)
    const end = start - 30
    const a = point(start, R.ringIn)
    const b = point(end, R.ringIn)
    const c = point(end, R.ringOut)
    const d = point(start, R.ringOut)
    return `M${a.x} ${a.y} A${R.ringIn} ${R.ringIn} 0 0 0 ${b.x} ${b.y} L${c.x} ${c.y} A${R.ringOut} ${R.ringOut} 0 0 1 ${d.x} ${d.y} Z`
  }
}

/** Chords from the aspecting bhava to each bhava it looks at. */
function AspectLines({
  source,
  targets,
  point,
  bhavaMid,
  radius,
  stroke,
}: {
  source: number
  targets: number[]
  point: (angle: number, radius: number) => { x: number; y: number }
  bhavaMid: (bhava: number) => number
  radius: number
  stroke: string
}) {
  const from = point(bhavaMid(source), radius)
  return (
    <g>
      {targets.map((target) => {
        const to = point(bhavaMid(target), radius)
        return (
          <line
            key={target}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={stroke}
            strokeWidth="0.4"
            strokeDasharray="1.6 1.2"
            opacity="0.85"
          />
        )
      })}
    </g>
  )
}
