import { useId, useMemo, type CSSProperties } from 'react'
import type { Chart, GrahaCode, GrahaPosition } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { GRAHAS, RETROGRADE_MARK, rashiIndex } from '@/utils/astro'

export interface ChartDiamondProps {
  chart: Chart
  /** Highlighted bhava — soft violet cell. */
  activeBhava?: number
  onBhavaClick?: (bhava: number) => void
  /** Selected graha — emphasizes its label. */
  activeGraha?: GrahaCode | null
  onGrahaClick?: (graha: GrahaCode) => void
  /** Show a reading count per bhava instead of the grahas (the Readings index). */
  countsByBhava?: Record<number, number>
  /** Centre text when counts are shown. */
  centerLabel?: string
  centerSubLabel?: string
  /**
   * `paper` — classic white North Indian kundli (default).
   * `surface` — cosmic theme surface tokens (dark UI).
   */
  tone?: 'paper' | 'surface'
  /** Play the chart-reveal sequence (surface tone). Remount via key to replay. */
  animateReveal?: boolean
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
  activeGraha,
  onGrahaClick,
  countsByBhava,
  centerLabel,
  centerSubLabel,
  tone = 'paper',
  animateReveal = false,
  className,
}: ChartDiamondProps) {
  const titleId = useId()
  const showCounts = countsByBhava !== undefined
  const paper = tone === 'paper'
  const reveal = animateReveal && !paper

  const grahasByBhava = useMemo(() => {
    const map = new Map<number, GrahaPosition[]>()
    for (const g of chart.grahas) {
      const list = map.get(g.bhava) ?? []
      list.push(g)
      map.set(g.bhava, list)
    }
    return map
  }, [chart.grahas])

  const rashiByBhava = useMemo(() => {
    const map = new Map<number, number>()
    for (const b of chart.bhavas) {
      map.set(b.bhava, rashiIndex(b.rashi))
    }
    return map
  }, [chart.bhavas])

  const fill = paper ? '#FBEFE6' : 'var(--color-chart-field, #FFFFFF)'
  const line = paper ? '#9E6650' : 'var(--chart-line)'
  const rim = paper ? '#6E4234' : 'url(#kundali-copper-rim)'
  const signFill = paper ? '#6E4234' : 'var(--muted, var(--color-text-muted))'
  const planetColor = paper ? '#1A0D10' : 'var(--ink, var(--text-primary))'
  const lagnaFill = paper ? '#9E6650' : 'url(#kundali-la-text)'
  const highlight = paper
    ? 'transparent'
    : 'url(#kundali-lagna-fill)'
  const lagnaWash = paper ? 'transparent' : 'url(#kundali-lagna-fill)'
  const dimmed = paper ? planetColor : 'color-mix(in srgb, var(--text-primary) 62%, transparent)'
  const accentStroke = paper ? 'var(--color-gold)' : 'var(--accent-text)'

  return (
    <svg
      viewBox="-2 -2 304 304"
      className={cn(
        'kundali-diamond h-auto w-full select-none',
        reveal && 'kundali-diamond--reveal',
        !paper && 'kundali-diamond--glow drop-shadow-[0_0_22px_rgba(240,184,120,0.45)]',
        className,
      )}
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>
        North Indian kundli. Lagna {chart.lagna.rashi} in the top diamond.
        {showCounts ? ' Each cell carries its number of readings.' : ''}
      </title>

      <defs>
        <linearGradient id="kundali-copper-rim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--kundali-rim-0, #ffe0b4)" />
          <stop offset="20%" stopColor="var(--kundali-rim-1, #e8a86a)" />
          <stop offset="45%" stopColor="var(--kundali-rim-2, #8b4550)" />
          <stop offset="70%" stopColor="var(--kundali-rim-3, #3d1a2e)" />
          <stop offset="100%" stopColor="var(--kundali-rim-4, #f0c090)" />
        </linearGradient>
        <filter id="kundali-rim-glow" x="-14%" y="-14%" width="128%" height="128%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1.1 0.35 0.2 0 0
                    0.35 0.4 0.25 0 0
                    0.35 0.2 0.55 0 0
                    0 0 0 0.9 0"
            result="metalGlow"
          />
          <feMerge>
            <feMergeNode in="metalGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="kundali-la-text" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--kundali-la-0)" />
          <stop offset="45%" stopColor="var(--kundali-la-1)" />
          <stop offset="100%" stopColor="var(--kundali-la-2)" />
        </linearGradient>
        <linearGradient id="kundali-lagna-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--kundali-wash-0)" />
          <stop offset="100%" stopColor="var(--kundali-wash-1)" />
        </linearGradient>
      </defs>

      <rect
        x="0"
        y="0"
        width="300"
        height="300"
        fill={fill}
        stroke={rim}
        strokeWidth={paper ? 2 : 2.25}
        filter={paper ? undefined : 'url(#kundali-rim-glow)'}
        className={cn('kundali-rim-frame', reveal && 'kundali-draw-rim')}
        style={
          reveal
            ? ({
                strokeDasharray: 1200,
                fillOpacity: 0.94,
                '--draw-length': 1200,
              } as CSSProperties)
            : undefined
        }
      />

      {/* Permanent lagna wash — top diamond */}
      {!paper && (
        <path
          d={CELL_PATH[1]}
          fill={lagnaWash}
          stroke="none"
          className={cn(reveal && 'kundali-fade')}
          style={reveal ? { animationDelay: '480ms' } : undefined}
        />
      )}

      {activeBhava !== undefined && (
        <g className="pointer-events-none">
          <path
            d={CELL_PATH[activeBhava]}
            fill={highlight}
            stroke={paper ? 'none' : 'var(--kundali-active-stroke, none)'}
            strokeWidth={paper ? 0 : 1.5}
            className="kundali-active-house"
          />
          {!paper && (
            <circle
              key={`ripple-${activeBhava}-${activeGraha ?? 'h'}`}
              cx={CELLS.find((c) => c.bhava === activeBhava)?.x ?? 150}
              cy={CELLS.find((c) => c.bhava === activeBhava)?.y ?? 150}
              r={28}
              fill="none"
              stroke="rgba(201,145,115,0.5)"
              strokeWidth="1.25"
              className="origin-center animate-[kundali-ripple_700ms_var(--ease-out-soft)_both]"
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
          )}
        </g>
      )}

      <line
        x1="0"
        y1="0"
        x2="300"
        y2="300"
        stroke={line}
        strokeWidth="1.25"
        className={cn(reveal && 'kundali-draw-line')}
        style={
          reveal
            ? ({
                strokeDasharray: 424,
                animationDelay: '220ms',
                '--draw-length': 424,
              } as CSSProperties)
            : undefined
        }
      />
      <line
        x1="300"
        y1="0"
        x2="0"
        y2="300"
        stroke={line}
        strokeWidth="1.25"
        className={cn(reveal && 'kundali-draw-line')}
        style={
          reveal
            ? ({
                strokeDasharray: 424,
                animationDelay: '320ms',
                '--draw-length': 424,
              } as CSSProperties)
            : undefined
        }
      />
      <path
        d="M150 0 L300 150 L150 300 L0 150 Z"
        fill="none"
        stroke={line}
        strokeWidth="1.25"
        className={cn(reveal && 'kundali-draw-line')}
        style={
          reveal
            ? ({
                strokeDasharray: 848,
                animationDelay: '400ms',
                '--draw-length': 848,
              } as CSSProperties)
            : undefined
        }
      />

      {/* Lagna light sweep on reveal */}
      {!paper && (
        <path
          d={CELL_PATH[1]}
          fill="none"
          stroke="rgba(201,145,115,0.45)"
          strokeWidth="1.6"
          className={cn(reveal && 'kundali-lagna-sweep')}
          style={
            reveal
              ? ({
                  strokeDasharray: 480,
                  animationDelay: '700ms',
                  '--draw-length': 480,
                } as CSSProperties)
              : { opacity: activeBhava === 1 ? 0.7 : 0.35 }
          }
        />
      )}

      {activeBhava !== undefined && (
        <path
          d={CELL_PATH[activeBhava]}
          fill="none"
          stroke={accentStroke}
          strokeWidth="1.5"
          className="pointer-events-none"
        />
      )}

      {CELLS.map(({ bhava, x, y, labelX, labelY }, cellIndex) => {
        const occupants = grahasByBhava.get(bhava) ?? []
        const count = countsByBhava?.[bhava] ?? 0
        const signNo = rashiByBhava.get(bhava) ?? bhava
        const isActive = activeBhava === bhava
        const labelDelay = 620 + cellIndex * 45

        return (
          <g key={bhava}>
            {(onBhavaClick || onGrahaClick) && (
              <path
                d={CELL_PATH[bhava]}
                fill="transparent"
                className={cn(
                  'cursor-pointer outline-none',
                  !paper && 'transition-[fill] duration-200 hover:fill-[]',
                )}
                onClick={() => onBhavaClick?.(bhava)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onBhavaClick?.(bhava)
                  }
                }}
                aria-label={`Bhava ${bhava}, rashi ${signNo}${showCounts ? `, ${count} readings` : ''}${isActive ? ', selected' : ''}`}
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
              className={cn('kundali-house-num', reveal && 'kundali-label')}
              style={reveal ? { animationDelay: `${labelDelay}ms` } : undefined}
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
                    fill={paper ? '#FBEFE6' : 'var(--color-surface)'}
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
                dimmedFill={dimmed}
                activeGraha={activeGraha}
                onGrahaClick={onGrahaClick}
                reveal={reveal}
                revealDelay={labelDelay + 80}
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
            fill={paper ? '#5C4750' : 'var(--color-text-secondary)'}
          >
            {centerLabel}
          </text>
          {centerSubLabel && (
            <text
              x="150"
              y="161"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="8"
              letterSpacing="1"
              fill={paper ? '#7A6E74' : 'var(--color-text-muted)'}
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
  dimmedFill,
  activeGraha,
  onGrahaClick,
  reveal,
  revealDelay,
}: {
  x: number
  y: number
  isLagna: boolean
  occupants: GrahaPosition[]
  lagnaFill: string
  planetFill: string
  dimmedFill: string
  activeGraha?: GrahaCode | null
  onGrahaClick?: (graha: GrahaCode) => void
  reveal: boolean
  revealDelay: number
}) {
  type Line = {
    key: string
    text: string
    fill: string
    weight: number
    graha?: GrahaCode
    selected: boolean
  }

  const lines: Line[] = []
  if (isLagna) {
    lines.push({
      key: 'La',
      text: 'La',
      fill: lagnaFill,
      weight: 700,
      selected: false,
    })
  }
  for (const g of occupants) {
    const deg = Math.round(g.degree)
    const retro = g.motion === 'retrograde' ? RETROGRADE_MARK : ''
    const selected = activeGraha === g.graha
    const hasSelection = Boolean(activeGraha)
    lines.push({
      key: g.graha,
      text: `${GRAHAS[g.graha].code}${deg}${retro}`,
      fill: selected ? 'var(--color-light-copper)' : hasSelection ? dimmedFill : planetFill,
      weight: selected ? 700 : 600,
      graha: g.graha,
      selected,
    })
  }
  if (lines.length === 0) return null

  const lineH = 11
  const startY = y - ((lines.length - 1) * lineH) / 2

  return (
    <g className={cn(reveal && 'kundali-label')} style={reveal ? { animationDelay: `${revealDelay}ms` } : undefined}>
      {lines.map((line, i) => {
        const cy = startY + i * lineH
        const interactive = Boolean(line.graha && onGrahaClick)
        return (
          <g
            key={line.key}
            className={cn(interactive && 'cursor-pointer')}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={
              interactive
                ? `${GRAHAS[line.graha!].english}${line.selected ? ', selected' : ''}`
                : undefined
            }
            data-focus-ring="none"
            style={{ outline: 'none' }}
            onClick={
              interactive
                ? (e) => {
                    e.stopPropagation()
                    ;(e.currentTarget as SVGGElement).blur()
                    onGrahaClick?.(line.graha!)
                  }
                : undefined
            }
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      onGrahaClick?.(line.graha!)
                    }
                  }
                : undefined
            }
          >
            {/* Invisible hit target — no fill/stroke so focus never paints a pill. */}
            {interactive && (
              <rect x={x - 18} y={cy - 7} width={36} height={11} fill="none" pointerEvents="all" />
            )}
            <text
              x={x}
              y={cy}
              textAnchor="middle"
              fontFamily="var(--font-sans)"
              fontSize={line.selected ? 12 : 11}
              fontWeight={line.weight}
              fill={line.fill}
              className={cn(
                'pointer-events-none',
                line.key === 'La' ? 'kundali-la' : 'kundali-planet-label',
                line.selected && 'drop-shadow-[0_0_6px_rgba(184,50,122,0.55)]',
              )}
            >
              {line.text}
            </text>
          </g>
        )
      })}
    </g>
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
