import { useId } from 'react'
import type { Chart, GrahaPosition } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { GRAHAS, RETROGRADE_MARK, rashiIndex } from '@/utils/astro'

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
  /**
   * `paper` — classic white North Indian kundli (default).
   * `surface` — uses theme surface tokens (dark UI).
   */
  tone?: 'paper' | 'surface'
  className?: string
}

/**
 * North Indian diamond kundli — fixed bhava grid (house 1 = top diamond).
 * Sign numbers rotate with the lagna; planet glyphs sit in each house.
 */
export function ChartDiamond({
  chart,
  activeBhava,
  onBhavaClick,
  countsByBhava,
  centerLabel,
  centerSubLabel,
  tone = 'paper',
  className,
}: ChartDiamondProps) {
  const titleId = useId()
  const showCounts = countsByBhava !== undefined
  const paper = tone === 'paper'

  const grahasByBhava = new Map<number, GrahaPosition[]>()
  for (const g of chart.grahas) {
    const list = grahasByBhava.get(g.bhava) ?? []
    list.push(g)
    grahasByBhava.set(g.bhava, list)
  }

  const rashiByBhava = new Map<number, number>()
  for (const b of chart.bhavas) {
    rashiByBhava.set(b.bhava, rashiIndex(b.rashi))
  }

  const fill = paper ? '#FDF8F4' : 'var(--color-surface-raised)'
  const line = paper ? '#B88E58' : 'var(--color-chart-line)'
  const rim = paper ? '#A07840' : 'var(--color-copper)'
  const signFill = paper ? '#8B6914' : 'var(--color-light-copper)'
  const planetColor = paper ? '#1B2A4A' : 'var(--color-ink)'
  const lagnaFill = paper ? '#8B4513' : 'var(--color-copper)'
  const highlight = paper ? 'rgba(184, 142, 88, 0.18)' : 'rgba(220, 132, 79, 0.18)'

  return (
    <svg
      viewBox="-2 -2 304 304"
      className={cn(
        'h-auto w-full select-none',
        !paper && 'drop-shadow-[0_0_28px_rgba(220,132,79,0.12)]',
        className,
      )}
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>
        North Indian kundli. Lagna {chart.lagna.rashi} in the top diamond.
        {showCounts ? ' Each cell carries its number of readings.' : ''}
      </title>

      <rect x="0" y="0" width="300" height="300" fill={fill} stroke={rim} strokeWidth={paper ? 2 : 1.75} />

      {activeBhava !== undefined && (
        <path d={CELL_PATH[activeBhava]} fill={highlight} stroke="none" />
      )}

      <line x1="0" y1="0" x2="300" y2="300" stroke={line} strokeWidth="1.25" />
      <line x1="300" y1="0" x2="0" y2="300" stroke={line} strokeWidth="1.25" />
      <path d="M150 0 L300 150 L150 300 L0 150 Z" fill="none" stroke={line} strokeWidth="1.25" />

      {activeBhava !== undefined && (
        <path d={CELL_PATH[activeBhava]} fill="none" stroke="var(--color-gold)" strokeWidth="2.25" />
      )}

      {CELLS.map(({ bhava, x, y, labelX, labelY }) => {
        const occupants = grahasByBhava.get(bhava) ?? []
        const count = countsByBhava?.[bhava] ?? 0
        const signNo = rashiByBhava.get(bhava) ?? bhava

        return (
          <g key={bhava}>
            {onBhavaClick && (
              <path
                d={CELL_PATH[bhava]}
                fill="transparent"
                className="cursor-pointer"
                onClick={() => onBhavaClick(bhava)}
                role="button"
                aria-label={`Bhava ${bhava}, rashi ${signNo}${showCounts ? `, ${count} readings` : ''}`}
              />
            )}

            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              fontFamily="var(--font-sans)"
              fontSize="11"
              fontWeight="600"
              fill={signFill}
            >
              {signNo}
            </text>

            {showCounts ? (
              count > 0 && (
                <>
                  <circle
                    cx={x}
                    cy={y}
                    r={11}
                    fill={paper ? '#FFF' : 'var(--color-surface)'}
                    stroke={line}
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={y + 3.5}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                    fontSize="9"
                    fill={planetColor}
                  >
                    {count}
                  </text>
                </>
              )
            ) : (
              <HouseContents
                x={x}
                y={y}
                isLagna={bhava === 1}
                occupants={occupants}
                lagnaFill={lagnaFill}
                planetFill={planetColor}
              />
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
            fill={paper ? '#7A6E74' : 'var(--color-muted)'}
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
              fill={paper ? '#A097A7' : 'var(--color-faint)'}
            >
              {centerSubLabel}
            </text>
          )}
        </>
      )}
    </svg>
  )
}

function HouseContents({
  x,
  y,
  isLagna,
  occupants,
  lagnaFill,
  planetFill,
}: {
  x: number
  y: number
  isLagna: boolean
  occupants: GrahaPosition[]
  lagnaFill: string
  planetFill: string
}) {
  const lines: { text: string; fill: string; weight: number }[] = []
  if (isLagna) {
    lines.push({ text: 'La', fill: lagnaFill, weight: 700 })
  }
  for (const g of occupants) {
    const deg = Math.round(g.degree)
    const retro = g.motion === 'retrograde' ? RETROGRADE_MARK : ''
    lines.push({
      text: `${GRAHAS[g.graha].code}${deg}${retro}`,
      fill: planetFill,
      weight: 600,
    })
  }
  if (lines.length === 0) return null

  const lineH = 11
  const startY = y - ((lines.length - 1) * lineH) / 2

  return (
    <text x={x} textAnchor="middle" fontFamily="var(--font-sans)" fontSize="10">
      {lines.map((line, i) => (
        <tspan
          key={`${line.text}-${i}`}
          x={x}
          y={startY + i * lineH}
          fill={line.fill}
          fontWeight={line.weight}
        >
          {line.text}
        </tspan>
      ))}
    </text>
  )
}

/** Bhava 1 = top diamond; sequence runs anticlockwise. */
const CELLS = [
  { bhava: 1, x: 150, y: 68, labelX: 150, labelY: 22 },
  { bhava: 2, x: 72, y: 40, labelX: 55, labelY: 16 },
  { bhava: 3, x: 38, y: 78, labelX: 14, labelY: 55 },
  { bhava: 4, x: 68, y: 150, labelX: 22, labelY: 154 },
  { bhava: 5, x: 38, y: 222, labelX: 14, labelY: 250 },
  { bhava: 6, x: 72, y: 262, labelX: 55, labelY: 292 },
  { bhava: 7, x: 150, y: 238, labelX: 150, labelY: 290 },
  { bhava: 8, x: 228, y: 262, labelX: 245, labelY: 292 },
  { bhava: 9, x: 262, y: 222, labelX: 286, labelY: 250 },
  { bhava: 10, x: 232, y: 150, labelX: 278, labelY: 154 },
  { bhava: 11, x: 262, y: 78, labelX: 286, labelY: 55 },
  { bhava: 12, x: 228, y: 40, labelX: 245, labelY: 16 },
] as const

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
