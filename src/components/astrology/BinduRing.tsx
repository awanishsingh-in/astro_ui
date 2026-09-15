import { useId } from 'react'
import type { Ashtakavarga } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { rashiGlyph } from '@/utils/astro'

export interface BinduRingProps {
  ashtakavarga: Ashtakavarga
  activeBhava?: number
  onSelect?: (bhava: number) => void
  className?: string
}

/**
 * Sarvashtakavarga as twelve zodiac segments instead of twelve bars.
 *
 * Each sign's segment grows outward with its bindus and the mean is a circle
 * through them, so a chart's support reads as a shape: which quarters of the
 * sky back this person and which do not. The bar chart below carries the exact
 * numbers; this carries the distribution.
 */
export function BinduRing({ ashtakavarga, activeBhava, onSelect, className }: BinduRingProps) {
  const titleId = useId()
  const { entries, mean } = ashtakavarga

  const max = Math.max(...entries.map((e) => e.bindus))
  const min = Math.min(...entries.map((e) => e.bindus))
  const floor = Math.max(0, min - 4)
  const ceiling = max + 1

  const R_IN = 17
  const R_OUT = 44
  const radius = (bindus: number) => R_IN + ((bindus - floor) / (ceiling - floor)) * (R_OUT - R_IN)

  const start = (bhava: number) => 180 - (bhava - 1) * 30
  const mid = (bhava: number) => start(bhava) - 15
  const point = (deg: number, r: number) => {
    const rad = (deg * Math.PI) / 180
    return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) }
  }

  // A 2° gap each side keeps the segments from fusing into a solid disc.
  const segment = (bhava: number, r: number) => {
    const from = start(bhava) - 2
    const to = start(bhava) - 28
    const a = point(from, R_IN)
    const b = point(to, R_IN)
    const c = point(to, r)
    const d = point(from, r)
    return `M${a.x} ${a.y} A${R_IN} ${R_IN} 0 0 0 ${b.x} ${b.y} L${c.x} ${c.y} A${r} ${r} 0 0 1 ${d.x} ${d.y} Z`
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('h-auto w-full select-none', className)}
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>Sarvashtakavarga bindus by sign, against a mean of {mean}.</title>

      {entries.map((entry) => {
        const active = entry.bhava === activeBhava
        const above = entry.bindus >= mean
        return (
          <g
            key={entry.bhava}
            onClick={onSelect ? () => onSelect(entry.bhava) : undefined}
            className={cn(onSelect && 'cursor-pointer')}
            role={onSelect ? 'button' : undefined}
            aria-label={
              onSelect
                ? `Bhava ${entry.bhava}, ${entry.rashi}, ${entry.bindus} bindus, ${above ? 'above' : 'below'} the mean`
                : undefined
            }
          >
            {/*
              Above the mean is solid, below it is outline only. Two fills of
              similar weight would make the distinction a colour puzzle; solid
              against hollow is readable at a glance and survives greyscale.
            */}
            <path
              d={segment(entry.bhava, radius(entry.bindus))}
              fill={
                active
                  ? 'var(--color-gold-soft-line)'
                  : above
                    ? 'var(--color-malefic-dark)'
                    : 'transparent'
              }
              opacity={active ? 0.95 : above ? 0.85 : 1}
              stroke={
                active
                  ? 'var(--color-gold-soft-line)'
                  : above
                    ? 'transparent'
                    : 'var(--color-on-celestial-faint)'
              }
              strokeWidth="0.45"
              style={{ transition: 'opacity 250ms var(--ease-out-soft)' }}
            />
          </g>
        )
      })}

      {/* The mean, drawn through the segments — the whole reading is above or below it. */}
      <circle
        cx="50"
        cy="50"
        r={radius(mean)}
        fill="none"
        stroke="var(--color-gold-soft-line)"
        strokeWidth="0.35"
        strokeDasharray="1.4 1.2"
        opacity="0.9"
      />

      {/* Sign glyphs just outside the plot. */}
      {entries.map((entry) => {
        const p = point(mid(entry.bhava), 47.5)
        const active = entry.bhava === activeBhava
        return (
          <text
            key={`glyph-${entry.bhava}`}
            x={p.x}
            y={p.y + 1.2}
            textAnchor="middle"
            fontSize="3.4"
            fill={active ? 'var(--color-gold-soft-line)' : 'var(--color-on-celestial-muted)'}
            className="pointer-events-none"
          >
            {rashiGlyph(entry.rashi)}
          </text>
        )
      })}

      <text
        x="50"
        y="49"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="4.2"
        fill="var(--color-on-celestial)"
      >
        {activeBhava ? entries.find((e) => e.bhava === activeBhava)?.bindus : mean}
      </text>
      <text
        x="50"
        y="54"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="2.8"
        letterSpacing="0.3"
        fill="var(--color-on-celestial-faint)"
      >
        {activeBhava ? `BH ${activeBhava}` : 'MEAN'}
      </text>
    </svg>
  )
}
