import { cn } from '@/utils/cn'

export interface SkeletonProps {
  className?: string
  /** Rounded pill for text lines, card radius for blocks. */
  shape?: 'line' | 'block' | 'circle'
}

/** A shimmering placeholder. Never announced — the region around it is. */
export function Skeleton({ className, shape = 'line' }: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'shimmer block',
        shape === 'line' && 'h-3 rounded-full',
        shape === 'block' && 'rounded-card',
        shape === 'circle' && 'rounded-full',
        className,
      )}
    />
  )
}

/** A few stacked lines, the common case for prose and table rows. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <span className={cn('flex flex-col gap-2.5', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={i === lines - 1 ? 'w-2/3' : 'w-full'} />
      ))}
    </span>
  )
}

/**
 * A card-shaped placeholder: heading, a few lines, and an optional leading
 * circle. Used wherever a `Card` is about to arrive.
 */
export function SkeletonCard({
  lines = 2,
  withAvatar = false,
  className,
}: {
  lines?: number
  withAvatar?: boolean
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn('flex gap-3 rounded-card border border-border bg-surface p-4', className)}
    >
      {withAvatar && <Skeleton shape="circle" className="size-9 shrink-0" />}
      <span className="min-w-0 flex-1 space-y-2.5">
        <Skeleton className="h-3.5 w-1/2" />
        <SkeletonText lines={lines} />
      </span>
    </div>
  )
}

/** A stack of skeleton cards — list screens before their data lands. */
export function SkeletonList({
  count = 3,
  withAvatar = false,
  className,
}: {
  count?: number
  withAvatar?: boolean
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} withAvatar={withAvatar} />
      ))}
    </div>
  )
}

/** Rows of cells, matching `DataTable`'s rhythm while a chart is calculated. */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div aria-hidden className={cn('w-full', className)}>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-3 border-b border-border py-3.5 last:border-b-0">
          {Array.from({ length: columns }, (_, c) => (
            <Skeleton key={c} className={cn('h-3', c === 0 ? 'w-12 shrink-0' : 'flex-1')} />
          ))}
        </div>
      ))}
    </div>
  )
}
