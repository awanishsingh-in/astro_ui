import { useId } from 'react'
import type { Chart, GrahaPosition } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { GRAHAS, RETROGRADE_MARK, rashiIndex } from '@/utils/astro'

export interface ChartEastDiamondProps {
  chart: Chart
  activeBhava?: number
  onBhavaClick?: (bhava: number) => void
  tone?: 'paper' | 'surface'
  className?: string
}

/**
 * East Indian (Bengali) kundli — same fixed-house diamond as North Indian,
 * drawn with clearer triangular cells and lagna emphasis.
 */
export function ChartEastDiamond({
  chart,
  activeBhava,
  onBhavaClick,
  tone = 'paper',
  className,
}: ChartEastDiamondProps) {
  const titleId = useId()
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
  const line = paper ? '#4A3F6B' : 'var(--color-chart-line)'
  const rim = paper ? '#2E273F' : 'var(--color-copper)'
  const signFill = paper ? '#6B5B8C' : 'var(--color-light-copper)'
  const planetColor = paper ? '#2E273F' : 'var(--color-ink)'
  const lagnaFill = paper ? '#D69E68' : 'var(--color-copper)'
  const highlight = paper ? 'rgba(214, 158, 104, 0.28)' : 'rgba(124, 77, 255, 0.18)'

  return (
    <svg
      viewBox="-2 -2 304 304"
      className={cn('h-auto w-full select-none', className)}
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>
        East Indian kundli. Lagna {chart.lagna.rashi} in the top diamond.
      </title>

      <rect x="0" y="0" width="300" height="300" fill={fill} stroke={rim} strokeWidth={2} />

      {activeBhava !== undefined && (
        <path d={CELL_PATH[activeBhava]} fill={highlight} stroke="none" />
      )}

      <line x1="0" y1="0" x2="300" y2="300" stroke={line} strokeWidth="1.35" />
      <line x1="300" y1="0" x2="0" y2="300" stroke={line} strokeWidth="1.35" />
      <path d="M150 0 L300 150 L150 300 L0 150 Z" fill="none" stroke={line} strokeWidth="1.35" />

      {activeBhava !== undefined && (
        <path
          d={CELL_PATH[activeBhava]}
          fill="none"
          stroke={paper ? '#D69E68' : 'var(--color-gold)'}
          strokeWidth="2.4"
        />
      )}

      {CELLS.map(({ bhava, x, y, labelX, labelY }) => {
        const occupants = grahasByBhava.get(bhava) ?? []
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
                aria-label={`Bhava ${bhava}, rashi ${signNo}`}
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

            <HouseContents
              x={x}
              y={y}
              isLagna={bhava === 1}
              occupants={occupants}
              lagnaFill={lagnaFill}
              planetFill={planetColor}
            />
          </g>
        )
      })}
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
    const retro = g.motion === 'retrograde' ? RETROGRADE_MARK : ''
    lines.push({
      text: `${GRAHAS[g.graha].code}${retro}`,
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
