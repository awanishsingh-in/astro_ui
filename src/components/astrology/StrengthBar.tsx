import { cn } from '@/utils/cn'

export interface StrengthBarProps {
  /** 0–100. */
  value: number
  className?: string
}

/**
 * A graha's placement strength as a short bar.
 *
 * Three bands rather than a gradient, so the reading is categorical — weak,
 * workable, strong — instead of implying a precision the heuristic does not
 * have. The number is kept beside it for anyone who wants it.
 */
export function StrengthBar({ value, className }: StrengthBarProps) {
  const band = value >= 70 ? 'strong' : value >= 45 ? 'workable' : 'weak'
  const tone = {
    strong: 'bg-dignity-exalted',
    workable: 'bg-gold',
    weak: 'bg-dignity-debilitated',
  }[band]

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-surface-sunken"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Placement strength ${value} of 100, ${band}`}
      >
        <span
          className={cn('block h-full rounded-full transition-[width] duration-500 ease-out-soft', tone)}
          style={{ width: `${value}%` }}
        />
      </span>
      <span className="font-mono text-label text-muted">{value}</span>
    </span>
  )
}
