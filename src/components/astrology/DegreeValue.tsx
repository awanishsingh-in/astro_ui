import type { Motion } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { RETROGRADE_MARK } from '@/utils/astro'
import { formatDegree } from '@/utils/format'

export interface DegreeValueProps {
  degree: number
  minute: number
  motion?: Motion
  className?: string
}

/** `20°41′` with `℞` appended when retrograde. Always mono, always tabular. */
export function DegreeValue({ degree, minute, motion, className }: DegreeValueProps) {
  const retrograde = motion === 'retrograde'
  return (
    <span className={cn('font-mono text-data text-ink', className)}>
      {formatDegree(degree, minute)}
      {retrograde && (
        <>
          <span className="ml-1 text-retrograde" aria-hidden>
            {RETROGRADE_MARK}
          </span>
          <span className="sr-only"> retrograde</span>
        </>
      )}
    </span>
  )
}
