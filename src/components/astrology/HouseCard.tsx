import { ArrowUpRight } from 'lucide-react'
import type { BhavaPlacement } from '@/types/astrology'
import { Card } from '@/components/common/Card'
import { cn } from '@/utils/cn'
import { bhavaRef } from '@/utils/astro'
import { pluralise } from '@/utils/format'
import { PlanetGlyph } from './PlanetGlyph'

export interface HouseCardProps {
  placement: BhavaPlacement
  /** Number of readings drawn from this bhava, when shown in Readings. */
  readingCount?: number
  active?: boolean
  onClick?: () => void
  className?: string
}

/**
 * One bhava: its sign, its lord, where that lord stands, and who sits in it.
 * In Readings it also carries the count of answers drawn from it.
 */
export function HouseCard({
  placement,
  readingCount,
  active = false,
  onClick,
  className,
}: HouseCardProps) {
  const interactive = Boolean(onClick)

  return (
    <Card
      tone={active ? 'gold' : 'default'}
      padding="md"
      interactive={interactive}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      className={cn('gap-3', interactive && 'cursor-pointer', className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-label uppercase text-gold-deep">
            Bhava {placement.bhava}
          </p>
          <p className="mt-1 truncate text-heading font-semibold text-ink">
            {placement.signifies}
          </p>
        </div>
        {readingCount !== undefined && (
          <span className="shrink-0 text-right">
            <span className="block font-mono text-data-lg font-semibold text-ink">
              {readingCount}
            </span>
            <span className="block font-mono text-label uppercase text-muted">
              {readingCount === 1 ? 'reading' : 'readings'}
            </span>
          </span>
        )}
        {interactive && readingCount === undefined && (
          <ArrowUpRight aria-hidden className="size-4 shrink-0 text-muted" />
        )}
      </div>

      <p className="font-mono text-data text-purple">
        {placement.rashi} · lord {placement.lord} in {bhavaRef(placement.lordSitsIn)}
      </p>

      {placement.occupants.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {placement.occupants.map((code) => (
            <PlanetGlyph key={code} code={code} withCode size="sm" />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No graha stands here</p>
      )}

      {readingCount !== undefined && readingCount > 0 && (
        <span className="sr-only">{pluralise(readingCount, 'reading')}</span>
      )}
    </Card>
  )
}
