import { ArrowRight, MessageCircleQuestion } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { SectionHeader } from '@/components/common/SectionHeader'
import { ReadingCard } from '@/components/readings/ReadingCard'
import type { Reading } from '@/types/readings'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'
import { pluralise } from '@/utils/format'

export interface RecentReadingsProps {
  readings: Reading[]
  totalReadings: number
  className?: string
}

/**
 * Not an inbox.
 *
 * Every row leads with where the answer was *read from* — the bhava, the
 * grahas, the dasha that was running — because that is the index this product
 * uses. Recency only decides the order of this short list; it is never the
 * label. The full set is reached through its three lenses, not by scrolling
 * back through a thread.
 */
export function RecentReadings({ readings, totalReadings, className }: RecentReadingsProps) {
  return (
    <section aria-labelledby="recent-title" className={cn('space-y-4', className)}>
      <SectionHeader
        as="h2"
        size="sm"
        title={<span id="recent-title">Read from your chart</span>}
        description="Each answer keeps the bhava and period it was drawn from."
        action={
          <Link
            to={paths.readings}
            className="hidden min-h-11 shrink-0 items-center px-1 text-sm font-semibold text-navy transition-colors hover:text-gold-deep sm:inline-flex"
          >
            By bhava
          </Link>
        }
      />

      {readings.length === 0 ? (
        <EmptyState
          variant="inline"
          icon={<MessageCircleQuestion />}
          title="No readings yet"
          description="Ask your first question and it will sit under the bhava it was read from."
        />
      ) : (
        <>
          <ul className="space-y-3">
            {readings.map((reading) => (
              <li key={reading.id}>
                <ReadingCard reading={reading} />
              </li>
            ))}
          </ul>

          <Button
            variant="secondary"
            size="md"
            fullWidth
            to={paths.everything}
            iconRight={<ArrowRight className="size-4" />}
          >
            Explore everything · {pluralise(totalReadings, 'reading')}
          </Button>
        </>
      )}
    </section>
  )
}
