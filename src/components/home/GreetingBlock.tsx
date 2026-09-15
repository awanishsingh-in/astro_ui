import type { Panchang } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { firstNameOf, formatDayAndDate, greetingFor } from '@/utils/format'

export interface GreetingBlockProps {
  fullName: string
  /** Omitted while the feed is loading; the greeting still renders. */
  panchang?: Panchang
  className?: string
}

/**
 * The opening of the screen: the day, the greeting, and the one line that says
 * what this product is for.
 */
export function GreetingBlock({ fullName, panchang, className }: GreetingBlockProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <p className="font-mono text-label uppercase text-muted">
        {formatDayAndDate(new Date().toISOString())}
        {panchang && (
          <>
            {' · '}
            {panchang.tithi} · {panchang.nakshatra} nakshatra
          </>
        )}
      </p>

      <h1 className="font-serif text-title font-normal text-ink text-balance lg:text-title-lg">
        {greetingFor()}, {firstNameOf(fullName)}
      </h1>

      <p className="max-w-md text-body text-purple text-pretty">
        Ask something. Your chart already knows where to look.
      </p>
    </div>
  )
}
