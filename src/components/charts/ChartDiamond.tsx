import { useId } from 'react'
import type { Chart, GrahaCode } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { GRAHAS, RETROGRADE_MARK } from '@/utils/astro'

export interface ChartDiamondProps {
  chart: Chart
  /** Highlighted bhava — the gold cell. */
  activeBhava?: number
  onBhavaClick?: (bhava: number) => void
  /** Show a reading count per bhava instead of the grahas (the Readings index). */
  countsByBhava?: Record<number, number>
  /** Centre text when counts are shown. */
  centerLabel?: string
  centerSubLabel?: string
  className?: string
}

/**
 * The North Indian diamond — a fixed grid where the bhava, not the sign, holds
 * position. Bhava 1 is the top diamond.
 *
 * Doubles as the Readings index: pass `countsByBhava` and each cell shows how
 * many readings were drawn from that bhava.
 */
export function ChartDiamond({
  chart,
  activeBhava,
  onBhavaClick,
  countsByBhava,
  centerLabel,
  centerSubLabel,
  className,
}: ChartDiamondProps) {
  const titleId = useId()
  const showCounts = countsByBhava !== undefined

  const grahasByBhava = new Map<number, GrahaCode[]>()
  for (const g of chart.grahas) {
    const list = grahasByBhava.get(g.bhava) ?? []
    list.push(g.graha)
    grahasByBhava.set(g.bhava, list)
  }
  const retrograde = new Set(
    chart.grahas.filter((g) => g.motion === 'retrograde').map((g) => g.graha),
  )

  return (
    <svg
      viewBox="-2 -2 304 304"
      className={cn('h-auto w-full select-none', className)}
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>
        North Indian chart. Lagna {chart.lagna.rashi} in the top diamond.
        {showCounts ? ' Each cell carries its number of readings.' : ''}
      </title>

      <rect x="0" y="0" width="300" height="300" fill="var(--color-surface)" stroke="var(--color-chart-line)" strokeWidth="1.4" />

      {/* The highlighted cell paints before the lines so the rules stay crisp. */}
      {activeBhava !== undefined && (
        <path d={CELL_PATH[activeBhava]} fill="var(--color-chart-highlight)" stroke="none" />
      )}

      <line x1="0" y1="0" x2="300" y2="300" stroke="var(--color-chart-line)" strokeWidth="1" />
      <line x1="300" y1="0" x2="0" y2="300" stroke="var(--color-chart-line)" strokeWidth="1" />
      <path d="M150 0 L300 150 L150 300 L0 150 Z" fill="none" stroke="var(--color-chart-line)" strokeWidth="1" />

      {activeBhava !== undefined && (
        <path d={CELL_PATH[activeBhava]} fill="none" stroke="var(--color-gold)" strokeWidth="2" />
      )}

      {CELLS.map(({ bhava, x, y, labelX, labelY }) => {
        const occupants = grahasByBhava.get(bhava) ?? []
        const count = countsByBhava?.[bhava] ?? 0
        const isActive = bhava === activeBhava

        return (
          <g key={bhava}>
            {onBhavaClick && (
              <path
                d={CELL_PATH[bhava]}
                fill="transparent"
                className="cursor-pointer"
                onClick={() => onBhavaClick(bhava)}
                role="button"
                aria-label={`Bhava ${bhava}${showCounts ? `, ${count} readings` : ''}`}
              />
            )}

            {/* Bhava number, always in the cell corner */}
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="9"
              fill="var(--color-gold-deep)"
            >
              {bhava}
            </text>

            {showCounts ? (
              count > 0 && (
                <>
                  <circle
                    cx={x}
                    cy={y}
                    r={isActive ? 13 : 11}
                    fill={isActive ? 'var(--color-gold)' : 'var(--color-surface)'}
                    stroke={isActive ? 'var(--color-gold)' : 'var(--color-border-strong)'}
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={y + 3.5}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                    fontSize={isActive ? 10 : 9}
                    fontWeight={isActive ? 600 : 400}
                    fill={isActive ? '#FFFFFF' : 'var(--color-muted)'}
                  >
                    {count}
                  </text>
                </>
              )
            ) : (
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="11.5"
                fill="var(--color-chart-line)"
              >
                {occupants
                  .map((c) => `${GRAHAS[c].code}${retrograde.has(c) ? ` ${RETROGRADE_MARK}` : ''}`)
                  .join(' ')}
              </text>
            )}
          </g>
        )
      })}

      {centerLabel && (
        <>
          <text
            x="150"
            y="147"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="8"
            letterSpacing="1"
            fill="var(--color-muted)"
          >
            {centerLabel}
          </text>
          {centerSubLabel && (
            <text
              x="150"
              y="161"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="7"
              letterSpacing="1"
              fill="var(--color-faint)"
            >
              {centerSubLabel}
            </text>
          )}
        </>
      )}
    </svg>
  )
}

/**
 * The twelve cells of the North Indian grid. `x`/`y` is where content sits;
 * `labelX`/`labelY` is where the bhava number sits. Bhava 1 is the top diamond
 * and the sequence runs anticlockwise, which is the standard construction.
 */
const CELLS = [
  { bhava: 1,  x: 150, y: 62,  labelX: 150, labelY: 26 },
  { bhava: 2,  x: 79,  y: 42,  labelX: 79,  labelY: 17 },
  { bhava: 3,  x: 40,  y: 80,  labelX: 17,  labelY: 79 },
  { bhava: 4,  x: 72,  y: 150, labelX: 26,  labelY: 150 },
  { bhava: 5,  x: 40,  y: 224, labelX: 17,  labelY: 228 },
  { bhava: 6,  x: 79,  y: 264, labelX: 79,  labelY: 290 },
  { bhava: 7,  x: 150, y: 244, labelX: 150, labelY: 281 },
  { bhava: 8,  x: 221, y: 264, labelX: 221, labelY: 290 },
  { bhava: 9,  x: 260, y: 224, labelX: 283, labelY: 228 },
  { bhava: 10, x: 228, y: 150, labelX: 274, labelY: 150 },
  { bhava: 11, x: 260, y: 80,  labelX: 283, labelY: 79 },
  { bhava: 12, x: 221, y: 42,  labelX: 221, labelY: 17 },
] as const

/**
 * Cell outlines, used for the highlight and the click targets. The square's
 * two diagonals plus the inner diamond cut it into four central diamonds
 * (bhavas 1, 4, 7, 10) and eight corner triangles.
 */
const CELL_PATH: Record<number, string> = {
  1: 'M150 0 L225 75 L150 150 L75 75 Z',
  2: 'M0 0 L150 0 L75 75 Z',
  3: 'M0 0 L75 75 L0 150 Z',
  4: 'M0 150 L75 75 L150 150 L75 225 Z',
  5: 'M0 150 L75 225 L0 300 Z',
  6: 'M0 300 L75 225 L150 300 Z',
  7: 'M150 300 L75 225 L150 150 L225 225 Z',
  8: 'M150 300 L225 225 L300 300 Z',
  9: 'M300 300 L225 225 L300 150 Z',
  10: 'M300 150 L225 225 L150 150 L225 75 Z',
  11: 'M300 0 L300 150 L225 75 Z',
  12: 'M150 0 L300 0 L225 75 Z',
}
