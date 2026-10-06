import { useId } from 'react'
import type { Chart, GrahaPosition, RashiName } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { GRAHAS, RASHIS } from '@/utils/astro'

export interface ChartSouthGridProps {
  chart: Chart
  activeBhava?: number
  onBhavaClick?: (bhava: number) => void
  tone?: 'paper' | 'surface'
  className?: string
}

/**
 * South Indian kundli — signs stay fixed in a 4×4 ring; lagna and planets move.
 *
 * Layout (clockwise from top-left Meena):
 *   Pi  Ar  Ta  Ge
 *   Aq          Cn
 *   Cp          Le
 *   Sg  Sc  Li  Vi
 */
export function ChartSouthGrid({
  chart,
  activeBhava,
  onBhavaClick,
  tone = 'paper',
  className,
}: ChartSouthGridProps) {
  const titleId = useId()
  const paper = tone === 'paper'

  const bhavaByRashi = new Map<RashiName, number>()
  for (const b of chart.bhavas) {
    bhavaByRashi.set(b.rashi, b.bhava)
  }

  const grahasByBhava = new Map<number, GrahaPosition[]>()
  for (const g of chart.grahas) {
    const list = grahasByBhava.get(g.bhava) ?? []
    list.push(g)
    grahasByBhava.set(g.bhava, list)
  }

  const fill = paper ? '#FDF8F4' : 'var(--color-surface-raised)'
  const line = paper ? '#B88E58' : 'var(--color-chart-line)'
  const rim = paper ? '#A07840' : 'var(--color-copper)'
  const signFill = paper ? '#8B6914' : 'var(--color-light-copper)'
  const planetColor = paper ? '#1B2A4A' : 'var(--color-ink)'
  const lagnaFill = paper ? '#8B4513' : 'var(--color-copper)'
  const highlight = paper ? 'rgba(184, 142, 88, 0.22)' : 'rgba(124, 77, 255, 0.18)'
  const highlightStroke = paper ? '#C4894A' : 'var(--color-copper)'

  const cell = 75

  return (
    <svg
      viewBox="-2 -2 304 304"
      className={cn('h-auto w-full select-none', className)}
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>
        South Indian kundli. Signs fixed; Lagna {chart.lagna.rashi}.
      </title>

      <rect
        x="0"
        y="0"
        width="300"
        height="300"
        fill={fill}
        stroke={rim}
        strokeWidth={paper ? 2 : 1.75}
      />

      {/* Inner 2×2 void — only the outer ring holds signs */}
      <rect
        x={cell}
        y={cell}
        width={cell * 2}
        height={cell * 2}
        fill={fill}
        stroke={line}
        strokeWidth="1.1"
      />

      {SOUTH_CELLS.map(({ rashiIdx, col, row }) => {
        const rashi = RASHIS[rashiIdx - 1]!
        const bhava = bhavaByRashi.get(rashi.name) ?? rashiIdx
        const active = activeBhava === bhava
        const isLagna = bhava === 1
        const occupants = grahasByBhava.get(bhava) ?? []
        const x = col * cell
        const y = row * cell

        return (
          <g key={rashi.name}>
            <rect
              x={x}
              y={y}
              width={cell}
              height={cell}
              fill={active ? highlight : 'transparent'}
              stroke={active ? highlightStroke : line}
              strokeWidth={active ? 2 : 1.1}
              className={onBhavaClick ? 'cursor-pointer' : undefined}
              onClick={onBhavaClick ? () => onBhavaClick(bhava) : undefined}
              role={onBhavaClick ? 'button' : undefined}
              aria-label={`${rashi.english}, bhava ${bhava}`}
            />

            {/* Sign abbreviation — top-left corner */}
            <text
              x={x + 6}
              y={y + 14}
              fontFamily="var(--font-sans)"
              fontSize="10"
              fontWeight="700"
              fill={signFill}
            >
              {SOUTH_ABBR[rashiIdx]}
            </text>

            {/* ASC chip — top-right, never overlaps planet stack */}
            {isLagna && (
              <g>
                <rect
                  x={x + cell - 30}
                  y={y + 5}
                  width="24"
                  height="12"
                  rx="3"
                  fill={paper ? 'rgba(124,77,255,0.14)' : 'rgba(124,77,255,0.28)'}
                  stroke={lagnaFill}
                  strokeWidth="0.75"
                />
                <text
                  x={x + cell - 18}
                  y={y + 14}
                  textAnchor="middle"
                  fontFamily="var(--font-sans)"
                  fontSize="8"
                  fontWeight="700"
                  fill={lagnaFill}
                >
                  ASC
                </text>
              </g>
            )}

            <PlanetStack
              x={x}
              y={y}
              cell={cell}
              occupants={occupants}
              planetFill={planetColor}
            />
          </g>
        )
      })}
    </svg>
  )
}

function PlanetStack({
  x,
  y,
  cell,
  occupants,
  planetFill,
}: {
  x: number
  y: number
  cell: number
  occupants: GrahaPosition[]
  planetFill: string
}) {
  if (occupants.length === 0) return null

  const codes = occupants.map((g) => {
    const retro = g.motion === 'retrograde' ? 'R' : ''
    return `${GRAHAS[g.graha].code}${retro}`
  })

  // Dense cells: 3-wide rows; sparse: 2-wide for readability.
  const perRow = codes.length >= 4 ? 3 : 2
  const rows: string[] = []
  for (let i = 0; i < codes.length; i += perRow) {
    rows.push(codes.slice(i, i + perRow).join(' '))
  }

  const crowded = codes.length >= 3
  const fontSize = crowded ? 9 : 10.5
  const lineH = crowded ? 11 : 13
  // Leave room for sign + ASC chip along the top edge.
  const contentTop = y + 20
  const contentBottom = y + cell - 6
  const blockH = rows.length * lineH
  const available = contentBottom - contentTop
  const startY = contentTop + Math.max(0, (available - blockH) / 2) + fontSize * 0.85

  const cx = x + cell / 2

  return (
    <text
      x={cx}
      textAnchor="middle"
      fontFamily="var(--font-sans)"
      fontSize={fontSize}
      letterSpacing="0.02em"
    >
      {rows.map((row, i) => (
        <tspan
          key={`${row}-${i}`}
          x={cx}
          y={startY + i * lineH}
          fill={planetFill}
          fontWeight={600}
        >
          {row}
        </tspan>
      ))}
    </text>
  )
}

/** Rashi index 1–12 → cell in the South Indian ring. */
const SOUTH_CELLS: { rashiIdx: number; col: number; row: number }[] = [
  { rashiIdx: 12, col: 0, row: 0 },
  { rashiIdx: 1, col: 1, row: 0 },
  { rashiIdx: 2, col: 2, row: 0 },
  { rashiIdx: 3, col: 3, row: 0 },
  { rashiIdx: 4, col: 3, row: 1 },
  { rashiIdx: 5, col: 3, row: 2 },
  { rashiIdx: 6, col: 3, row: 3 },
  { rashiIdx: 7, col: 2, row: 3 },
  { rashiIdx: 8, col: 1, row: 3 },
  { rashiIdx: 9, col: 0, row: 3 },
  { rashiIdx: 10, col: 0, row: 2 },
  { rashiIdx: 11, col: 0, row: 1 },
]

const SOUTH_ABBR: Record<number, string> = {
  1: 'Ar',
  2: 'Ta',
  3: 'Ge',
  4: 'Cn',
  5: 'Le',
  6: 'Vi',
  7: 'Li',
  8: 'Sc',
  9: 'Sg',
  10: 'Cp',
  11: 'Aq',
  12: 'Pi',
}
