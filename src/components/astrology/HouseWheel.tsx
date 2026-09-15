import { useId } from 'react'
import type { BhavaPlacement, GrahaCode } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { BHAVA_SIGNIFIES, GRAHAS, rashiGlyph } from '@/utils/astro'

export interface HouseWheelProps {
  bhavas: BhavaPlacement[]
  /** Occupants per bhava, drawn as glyphs inside each segment. */
  occupants?: Record<number, GrahaCode[]>
  activeBhava?: number
  onSelect?: (bhava: number) => void
  tone?: 'light' | 'dark'
  className?: string
}

/**
 * The twelve bhavas as a ring of segments — house number, the rashi on its
 * cusp, and what the house is read for.
 *
 * The table below it carries the lords and the degrees; this is the shape of
 * the chart, which is how a bhava is actually located when you are looking for
 * one. Bhava 1 sits at nine o'clock and the ring runs anticlockwise, matching
 * the wheel exactly.
 */
export function HouseWheel({
  bhavas,
  occupants = {},
  activeBhava,
  onSelect,
  tone = 'light',
  className,
}: HouseWheelProps) {
  const titleId = useId()
  const dark = tone === 'dark'

  const C = {
    rim: dark ? 'var(--color-gold-soft-line)' : 'var(--color-chart-rim)',
    line: dark ? 'var(--color-chart-line-dark)' : 'var(--color-border-strong)',
    field: dark ? 'var(--color-indigo-deep)' : 'var(--color-surface)',
    active: dark ? 'var(--color-indigo-royal)' : 'var(--color-chart-highlight)',
    ink: dark ? 'var(--color-on-celestial)' : 'var(--color-ink)',
    muted: dark ? 'var(--color-on-celestial-muted)' : 'var(--color-muted)',
    accent: dark ? 'var(--color-gold-soft-line)' : 'var(--color-gold-deep)',
  }

  const start = (bhava: number) => 180 - (bhava - 1) * 30
  const mid = (bhava: number) => start(bhava) - 15
  const point = (deg: number, r: number) => {
    const rad = (deg * Math.PI) / 180
    return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) }
  }

  const segment = (bhava: number, rIn: number, rOut: number) => {
    const a = point(start(bhava), rIn)
    const b = point(start(bhava) - 30, rIn)
    const c = point(start(bhava) - 30, rOut)
    const d = point(start(bhava), rOut)
    return `M${a.x} ${a.y} A${rIn} ${rIn} 0 0 0 ${b.x} ${b.y} L${c.x} ${c.y} A${rOut} ${rOut} 0 0 1 ${d.x} ${d.y} Z`
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('h-auto w-full select-none', className)}
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>The twelve bhavas and the rashi on each cusp.</title>

      <circle cx="50" cy="50" r="49" fill={C.field} stroke={C.rim} strokeWidth="0.6" />
      <circle cx="50" cy="50" r="24" fill={C.field} stroke={C.line} strokeWidth="0.4" />

      {bhavas.map((row) => {
        const active = row.bhava === activeBhava
        const label = point(mid(row.bhava), 43)
        const sign = point(mid(row.bhava), 35)
        const inside = occupants[row.bhava] ?? []

        return (
          <g
            key={row.bhava}
            onClick={onSelect ? () => onSelect(row.bhava) : undefined}
            className={cn(onSelect && 'cursor-pointer')}
            role={onSelect ? 'button' : undefined}
            aria-label={onSelect ? `Bhava ${row.bhava}, ${row.rashi}` : undefined}
          >
            <path
              d={segment(row.bhava, 24, 49)}
              fill={active ? C.active : 'transparent'}
              stroke={C.line}
              strokeWidth="0.35"
              style={{ transition: 'fill 250ms var(--ease-out-soft)' }}
            />
            <text
              x={label.x}
              y={label.y + 1.2}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="3.4"
              fontWeight={active ? 600 : 400}
              fill={active ? C.accent : C.muted}
              className="pointer-events-none"
            >
              {row.bhava}
            </text>
            <text
              x={sign.x}
              y={sign.y + 1.4}
              textAnchor="middle"
              fontSize="4"
              fill={active ? C.accent : C.rim}
              opacity={active ? 1 : 0.75}
              className="pointer-events-none"
            >
              {rashiGlyph(row.rashi)}
            </text>

            {/* Whoever is standing in the house, spread along its arc. */}
            {inside.slice(0, 4).map((code, i) => {
              const spread = (i - (Math.min(inside.length, 4) - 1) / 2) * 8
              const g = point(mid(row.bhava) + spread, 28.5)
              return (
                <text
                  key={code}
                  x={g.x}
                  y={g.y + 1.2}
                  textAnchor="middle"
                  fontSize="3.4"
                  fill={C.ink}
                  opacity="0.85"
                  className="pointer-events-none"
                >
                  {GRAHAS[code].glyph}
                </text>
              )
            })}
          </g>
        )
      })}

      {/* The centre names whichever house is selected, rather than sitting empty. */}
      {activeBhava !== undefined ? (
        <>
          <text
            x="50"
            y="48"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="4.4"
            fill={C.ink}
          >
            BH {activeBhava}
          </text>
          <text x="50" y="54" textAnchor="middle" fontSize="3.2" fill={C.muted}>
            {BHAVA_SIGNIFIES[activeBhava as keyof typeof BHAVA_SIGNIFIES]}
          </text>
        </>
      ) : (
        <text
          x="50"
          y="51.5"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="3.2"
          letterSpacing="0.4"
          fill={C.muted}
        >
          TAP A BHAVA
        </text>
      )}
    </svg>
  )
}
