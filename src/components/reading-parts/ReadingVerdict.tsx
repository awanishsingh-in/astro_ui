import { ReadingWindowChip } from '@/components/readings/ReadingWindowChip'
import type { ReadingWindow } from '@/types/readings'
import { cn } from '@/utils/cn'

export interface ReadingVerdictProps {
  verdict: string
  window?: ReadingWindow
  className?: string
}

/**
 * Part 1 — the answer, before any of the working.
 *
 * The largest text in the reading and the only thing set against a gold rule,
 * because a reader who takes nothing else away should take this.
 */
export function ReadingVerdict({ verdict, window, className }: ReadingVerdictProps) {
  return (
    <div className={cn('border-l-2 border-gold py-6 pl-5', className)}>
      <p className="text-title font-semibold text-ink text-balance lg:text-title-lg">{verdict}</p>
      {window && <ReadingWindowChip window={window} withDriver className="mt-4" />}
    </div>
  )
}
