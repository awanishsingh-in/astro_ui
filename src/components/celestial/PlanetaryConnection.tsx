import { cn } from '@/utils/cn'
import type { GrahaCode } from '@/types/astrology'
import { GRAHAS, grahaToneClass, grahaToneClassDark } from '@/utils/astro'

export interface PlanetaryConnectionProps {
  /** The grahas doing the looking, drawn down the left. */
  from: GrahaCode[]
  /** What they land on — "bh 7", "Chandra", a rashi. */
  to: string
  tone?: 'light' | 'dark'
  className?: string
}

/**
 * One relationship, drawn: the grahas on the left, a curve from each, the
 * thing they act on at the right.
 *
 * The wheel-sized version of this is `PlanetaryRelationship`; this is the
 * inline form for a card, where the claim is about two or three grahas rather
 * than the whole chart. A sentence saying "Shani and Budha both reach bh 7"
 * is a fact to take on trust — the curve is a thing to follow.
 */
export function PlanetaryConnection({
  from,
  to,
  tone = 'light',
  className,
}: PlanetaryConnectionProps) {
  const dark = tone === 'dark'
  const rows = from.slice(0, 3)
  const height = rows.length * 26

  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      <ul className="flex shrink-0 flex-col justify-center" style={{ gap: 6 }}>
        {rows.map((code) => (
          <li
            key={code}
            className={cn(
              'flex h-5 items-center gap-1.5 text-sm leading-none',
              dark ? grahaToneClassDark(code) : grahaToneClass(code),
            )}
          >
            <span aria-hidden>{GRAHAS[code].glyph}</span>
            <span
              className={cn(
                'font-mono text-label uppercase',
                dark ? 'text-on-celestial-muted' : 'text-muted',
              )}
            >
              {GRAHAS[code].code}
            </span>
          </li>
        ))}
      </ul>

      {/*
        One curve per graha, fanning into a single point on the right. Drawn
        at the row pitch so each starts level with the glyph it belongs to.
      */}
      <svg
        aria-hidden
        viewBox={`0 0 60 ${height}`}
        preserveAspectRatio="none"
        className="h-auto min-w-0 flex-1 self-stretch"
        style={{ height }}
      >
        {rows.map((code, i) => {
          const y = 13 + i * 26
          const mid = height / 2
          return (
            <path
              key={code}
              d={`M0 ${y} C 26 ${y}, 34 ${mid}, 60 ${mid}`}
              fill="none"
              stroke={dark ? 'var(--color-gold-soft-line)' : 'var(--color-gold)'}
              strokeWidth="1"
              strokeDasharray="3 2.5"
              opacity="0.7"
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
        <circle
          cx="58"
          cy={height / 2}
          r="2"
          fill={dark ? 'var(--color-gold-soft-line)' : 'var(--color-gold)'}
        />
      </svg>

      <span className={cn('shrink-0 font-mono text-data', dark ? 'text-on-celestial' : 'text-ink')}>
        {to}
      </span>
    </div>
  )
}
