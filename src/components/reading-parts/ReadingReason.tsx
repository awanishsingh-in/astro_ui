import { cn } from '@/utils/cn'

export interface ReadingReasonProps {
  reason: string
  className?: string
}

/** Part 2 — why the chart says so. Prose, deliberately, not another list. */
export function ReadingReason({ reason, className }: ReadingReasonProps) {
  return <p className={cn('text-body text-purple text-pretty', className)}>{reason}</p>
}
