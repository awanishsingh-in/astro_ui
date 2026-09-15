import { useId } from 'react'
import { cn } from '@/utils/cn'

export interface ScoreDialProps {
  value: number
  max: number
  /** Shown under the figure, e.g. "of 36 gunas". */
  caption: string
  size?: number
  className?: string
}

/**
 * The total, drawn as an arc.
 *
 * Deliberately not a percentage and not colour-graded green-to-red: a Guna
 * Milan score is a checklist tally, and rendering it like a test result would
 * lend it a precision it does not have. One gold arc, one number.
 */
export function ScoreDial({ value, max, caption, size = 160, className }: ScoreDialProps) {
  const titleId = useId()
  const radius = 46
  const circumference = 2 * Math.PI * radius
  const fraction = Math.max(0, Math.min(1, value / max))

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>
        {value} out of {max} — {caption}
      </title>

      <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="7" />
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - fraction)}
        transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dashoffset 900ms var(--ease-out-soft)' }}
      />

      <text
        x="60"
        y="58"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="26"
        fill="var(--color-ink)"
      >
        {value}
      </text>
      <text
        x="60"
        y="74"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="8"
        letterSpacing="0.6"
        fill="var(--color-muted)"
      >
        OF {max}
      </text>
    </svg>
  )
}
