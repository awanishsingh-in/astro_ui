import { CalendarRange } from 'lucide-react'
import type { ReadingWindow } from '@/types/readings'
import { cn } from '@/utils/cn'
import { formatMonthYear } from '@/utils/format'

export interface ReadingWindowChipProps {
  window: ReadingWindow
  /** Show what opens and closes the window. */
  withDriver?: boolean
  className?: string
}

/**
 * The range an answer applies to, written as a range.
 *
 * Months, not days: the chart marks when a transit turns over, and rendering
 * that as an exact date would claim a precision it does not have.
 */
export function ReadingWindowChip({ window, withDriver = false, className }: ReadingWindowChipProps) {
  return (
    <span
      className={cn(
        'inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-xs',
        'border border-gold-border bg-gold-soft px-2 py-1',
        'font-mono text-label uppercase text-gold-deep',
        className,
      )}
    >
      <CalendarRange aria-hidden className="size-3" />
      <span className="whitespace-nowrap">
        {formatMonthYear(window.start)} – {formatMonthYear(window.end)}
      </span>
      {withDriver && window.driver && (
        <span className="normal-case text-muted">· {window.driver}</span>
      )}
    </span>
  )
}
