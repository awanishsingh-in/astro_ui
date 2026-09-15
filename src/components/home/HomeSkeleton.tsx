import { Skeleton, SkeletonText } from '@/components/common/Skeleton'
import { cn } from '@/utils/cn'

/**
 * Home's loading state, shaped like Home.
 *
 * The blocks sit where the real content will, so nothing jumps when the feed
 * lands — the point of a skeleton over a spinner.
 */
export function HomeSkeleton({ className }: { className?: string }) {
  return (
    <div role="status" aria-busy aria-label="Loading your chart" className={className}>
      <span className="sr-only">Loading your chart…</span>

      <div className="space-y-2">
        <Skeleton className="h-2.5 w-56" />
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-10">
        {/* Left — composer and prompts */}
        <div className="space-y-8">
          <Skeleton shape="block" className="h-32 w-full" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-40" />
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} shape="block" className="h-14 w-full" />
            ))}
          </div>
        </div>

        {/* Centre — the chart card */}
        <ChartCardSkeleton />

        {/* Right — insight and readings */}
        <div className="hidden space-y-4 lg:block">
          <Skeleton className="h-4 w-48" />
          <Skeleton shape="block" className="h-28 w-full" />
          <Skeleton shape="block" className="h-40 w-full" />
          <Skeleton shape="block" className="h-24 w-full" />
        </div>
      </div>

      {/* Readings, which sit below the fold on mobile */}
      <div className="mt-8 space-y-3 lg:hidden">
        <Skeleton className="h-4 w-44" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} shape="block" className="h-24 w-full" />
        ))}
      </div>
    </div>
  )
}

function ChartCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-panel border border-border-strong bg-surface shadow-card">
      <div className="space-y-2 border-b border-border p-5">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-52 max-w-full" />
      </div>
      <div className={cn('flex flex-col gap-5 p-5 sm:flex-row')}>
        <Skeleton shape="circle" className="mx-auto size-[170px] shrink-0 sm:mx-0" />
        <div className="flex-1 space-y-3">
          <SkeletonText lines={3} />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
      <div className="border-t border-border p-5">
        <Skeleton className="h-4 w-44" />
      </div>
    </div>
  )
}
