import { cn } from '@/utils/cn'

export interface BhavaDialProps {
  /** The bhava this dial is about, 1–12. */
  bhava: number
  /** Fills the ring in proportion — bindus against the scale's top. */
  value?: number
  max?: number
  tone?: 'strong' | 'weak' | 'neutral'
  className?: string
}

/**
 * One bhava, located on a twelve-segment ring.
 *
 * A number on its own ("bh 8, 33 bindus") says nothing about where in the
 * chart that is. Twelve ticks with one lit puts it somewhere — and at this
 * size it costs a badge's worth of space, so every strength line can carry
 * its own position rather than only the strongest one.
 */
export function BhavaDial({ bhava, value, max = 40, tone = 'neutral', className }: BhavaDialProps) {
  const colour =
    tone === 'strong'
      ? 'var(--color-gold)'
      : tone === 'weak'
        ? 'var(--color-muted)'
        : 'var(--color-navy)'

  // Bhava 1 at nine o'clock running anticlockwise — the wheel's construction.
  const angle = (i: number) => ((180 - i * 30 - 15) * Math.PI) / 180
  const point = (i: number, r: number) => [50 + r * Math.cos(angle(i)), 50 + r * Math.sin(angle(i))]

  const R = 2 * Math.PI * 40
  const filled = value !== undefined ? Math.min(value / max, 1) : 0

  return (
    <svg viewBox="0 0 100 100" aria-hidden className={cn('size-full', className)}>
      {/* The proportion, as an arc rather than a bar. */}
      {value !== undefined && (
        <>
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-border)" strokeWidth="5" />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={colour}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${R * filled} ${R}`}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dasharray 600ms var(--ease-out-soft)' }}
          />
        </>
      )}

      {/* Twelve ticks; the one this dial is about is longer and coloured. */}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1
        const active = n === bhava
        const [x1, y1] = point(i, active ? 30 : 27)
        const [x2, y2] = point(i, 21)
        return (
          <line
            key={n}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={active ? colour : 'var(--color-border-strong)'}
            strokeWidth={active ? 3.2 : 1.6}
            strokeLinecap="round"
          />
        )
      })}

      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-mono)"
        fontSize="15"
        fill="var(--color-ink)"
      >
        {bhava}
      </text>
    </svg>
  )
}
