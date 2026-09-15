import { useId } from 'react'
import type { Drishti, GrahaCode } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { GRAHAS } from '@/utils/astro'

export interface PlanetaryRelationshipProps {
  drishti: Drishti[]
  /** When set, only this graha's sightlines are drawn. */
  activeGraha?: GrahaCode | null
  onSelect?: (graha: GrahaCode) => void
  tone?: 'light' | 'dark'
  className?: string
}

/**
 * Drishti as a diagram: the twelve bhavas on a ring, each graha at the bhava
 * it occupies, and a chord to every bhava it looks at.
 *
 * With nothing selected the whole web is drawn faintly — the shape of how
 * contested a chart is. Selecting a graha leaves only its own sightlines, so
 * the claim "Shani looks at your seventh" becomes a line you can follow
 * instead of a number in a table.
 *
 * The sightlines bow toward the centre rather than crossing it straight. Nine
 * grahas aspecting three bhavas each is twenty-seven chords through one point;
 * curved, each one keeps its own path and stays followable.
 */
export function PlanetaryRelationship({
  drishti,
  activeGraha,
  onSelect,
  tone = 'light',
  className,
}: PlanetaryRelationshipProps) {
  const titleId = useId()
  const dark = tone === 'dark'

  const C = {
    rim: dark ? 'var(--color-chart-line-dark)' : 'var(--color-border-strong)',
    field: dark ? 'var(--color-indigo-deep)' : 'var(--color-surface)',
    muted: dark ? 'var(--color-on-celestial-muted)' : 'var(--color-muted)',
    ink: dark ? 'var(--color-on-celestial)' : 'var(--color-ink)',
    accent: dark ? 'var(--color-gold-soft-line)' : 'var(--color-gold)',
    benefic: dark ? 'var(--color-benefic-dark)' : 'var(--color-benefic)',
    malefic: dark ? 'var(--color-malefic-dark)' : 'var(--color-malefic)',
    node: dark ? 'var(--color-node-dark)' : 'var(--color-node)',
  }

  const mid = (bhava: number) => 180 - (bhava - 1) * 30 - 15
  const point = (deg: number, r: number) => {
    const rad = (deg * Math.PI) / 180
    return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) }
  }

  const natureColour = (code: GrahaCode) =>
    GRAHAS[code].nature === 'benefic'
      ? C.benefic
      : GRAHAS[code].nature === 'node'
        ? C.node
        : C.malefic

  // Several grahas can share a bhava, so each one is offset along the arc.
  const byBhava = new Map<number, GrahaCode[]>()
  for (const row of drishti) {
    byBhava.set(row.sitsIn, [...(byBhava.get(row.sitsIn) ?? []), row.graha])
  }
  const seatOf = (code: GrahaCode, bhava: number) => {
    const shared = byBhava.get(bhava) ?? []
    const i = shared.indexOf(code)
    const offset = (i - (shared.length - 1) / 2) * 7
    return point(mid(bhava) + offset, 36)
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('h-auto w-full select-none', className)}
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>
        {activeGraha
          ? `${GRAHAS[activeGraha].english} and the bhavas it aspects.`
          : 'Every graha and the bhavas it aspects.'}
      </title>

      <circle cx="50" cy="50" r="44" fill={C.field} stroke={C.rim} strokeWidth="0.5" />

      {/* The twelve bhava marks. */}
      {Array.from({ length: 12 }, (_, i) => {
        const bhava = i + 1
        const p = point(mid(bhava), 44)
        return (
          <text
            key={bhava}
            x={p.x}
            y={p.y + 1.1}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="3.2"
            fill={C.muted}
          >
            {bhava}
          </text>
        )
      })}

      {/* Sightlines. */}
      {drishti.map((row) => {
        const dimmed = Boolean(activeGraha) && activeGraha !== row.graha
        const from = seatOf(row.graha, row.sitsIn)
        return (
          <g
            key={`line-${row.graha}`}
            opacity={dimmed ? 0.07 : activeGraha ? 0.95 : 0.22}
            style={{ transition: 'opacity 250ms var(--ease-out-soft)' }}
          >
            {row.aspects.map((target) => {
              const to = point(mid(target), 36)
              /*
                The control point sits between the two ends and pulled in
                toward the centre, so every chord bows the same way and no two
                sightlines lie on top of each other.
              */
              const cx = 50 + (from.x + to.x - 100) * 0.18
              const cy = 50 + (from.y + to.y - 100) * 0.18
              return (
                <path
                  key={`${row.graha}-${target}`}
                  d={`M${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`}
                  fill="none"
                  stroke={natureColour(row.graha)}
                  strokeWidth={activeGraha === row.graha ? 0.5 : 0.3}
                  strokeDasharray="1.6 1.2"
                  strokeLinecap="round"
                />
              )
            })}
          </g>
        )
      })}

      {/* The grahas themselves, sitting on the ring. */}
      {drishti.map((row) => {
        const p = seatOf(row.graha, row.sitsIn)
        const selected = activeGraha === row.graha
        return (
          <g
            key={`seat-${row.graha}`}
            onClick={onSelect ? () => onSelect(row.graha) : undefined}
            className={cn(onSelect && 'cursor-pointer')}
            role={onSelect ? 'button' : undefined}
            aria-label={
              onSelect ? `${GRAHAS[row.graha].english} in bhava ${row.sitsIn}` : undefined
            }
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={selected ? 4 : 3.2}
              fill={C.field}
              stroke={selected ? C.accent : C.rim}
              strokeWidth={selected ? 0.6 : 0.35}
              style={{ transition: 'r 200ms var(--ease-out-soft)' }}
            />
            <text
              x={p.x}
              y={p.y + 1.4}
              textAnchor="middle"
              fontSize="3.8"
              fill={natureColour(row.graha)}
              className="pointer-events-none"
            >
              {GRAHAS[row.graha].glyph}
            </text>
          </g>
        )
      })}

      <text
        x="50"
        y="51.5"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="3.2"
        letterSpacing="0.4"
        fill={activeGraha ? C.ink : C.muted}
      >
        {activeGraha ? GRAHAS[activeGraha].name.toUpperCase() : 'ALL DRISHTI'}
      </text>
    </svg>
  )
}
