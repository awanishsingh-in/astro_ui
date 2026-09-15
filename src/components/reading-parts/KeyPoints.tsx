import { cn } from '@/utils/cn'

export interface KeyPointsProps {
  points: string[]
  /** `cards` for the answer screen, `list` for the denser reading page. */
  variant?: 'cards' | 'list'
  className?: string
}

/**
 * Part 3 — the three points holding the verdict up.
 *
 * Three, never more: an answer that needs a fourth is an answer that has
 * stopped being certain about the first.
 */
export function KeyPoints({ points, variant = 'cards', className }: KeyPointsProps) {
  if (variant === 'list') {
    return (
      <ul className={cn('space-y-3', className)}>
        {points.map((point, index) => (
          <li key={point} className="flex gap-4">
            <span aria-hidden className="mt-0.5 shrink-0 font-mono text-label text-gold-deep">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-sub text-purple text-pretty">{point}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ol className={cn('grid gap-3 sm:grid-cols-3', className)}>
      {points.map((point, index) => (
        <li
          key={point}
          className="flex flex-col gap-2.5 rounded-card border border-border bg-surface p-4 shadow-card"
        >
          <span
            aria-hidden
            className="inline-flex size-7 items-center justify-center rounded-full bg-gold-soft font-mono text-label font-semibold text-gold-deep"
          >
            {index + 1}
          </span>
          <span className="text-sm text-purple text-pretty">{point}</span>
        </li>
      ))}
    </ol>
  )
}
