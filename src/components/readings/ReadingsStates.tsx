import { BookOpen, Search } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/common/Skeleton'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'

/** Nothing asked yet — the one screen that has to earn the first question. */
export function ReadingsEmpty({ className }: { className?: string }) {
  return (
    <EmptyState
      className={className}
      icon={<BookOpen />}
      title="No readings yet."
      description="Ask a question and the answer will sit under the bhava and the period it was read from — not in a list ordered by when you typed it."
      action={
        <Button to={paths.ask} size="md">
          Ask your first question
        </Button>
      }
    />
  )
}

/** A search that matched nothing — distinct from having no readings at all. */
export function ReadingsNoMatch({ query, className }: { query: string; className?: string }) {
  return (
    <EmptyState
      className={className}
      variant="inline"
      icon={<Search />}
      title="Nothing matches that"
      description={`No reading mentions “${query}”. Try a shorter phrase, or a bhava number.`}
    />
  )
}

/** Card-shaped placeholders, so the list does not jump when it lands. */
export function ReadingsSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div
      role="status"
      aria-busy
      aria-label="Loading your readings"
      className={cn('space-y-3', className)}
    >
      <span className="sr-only">Loading your readings…</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-3 rounded-card border border-border bg-surface p-4 pl-5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3.5 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  )
}
