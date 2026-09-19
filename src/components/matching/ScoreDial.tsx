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
  const display =
    Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '')

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
        {display} out of {max} - {caption}
      </title>

      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="var(--color-border-strong)"
        strokeWidth="8"
        opacity="0.55"
      />
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="var(--color-copper)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - fraction)}
        transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dashoffset 900ms var(--ease-out-soft)' }}
      />

      <text
        x="60"
        y="56"
        textAnchor="middle"
        fontFamily="var(--font-display, var(--font-sans))"
        fontSize="28"
        fontWeight="600"
        fill="var(--color-ink)"
      >
        {display}
      </text>
      <text
        x="60"
        y="72"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="8"
        letterSpacing="1.2"
        fill="var(--color-muted)"
      >
        OF {max}
      </text>
    </svg>
  )
}
