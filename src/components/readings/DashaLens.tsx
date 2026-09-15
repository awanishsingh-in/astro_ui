import { Badge } from '@/components/common/Badge'
import { ReadingCard } from '@/components/readings/ReadingCard'
import type { PeriodReadingGroup } from '@/types/readings'
import { cn } from '@/utils/cn'
import { formatDateLong, formatPeriod, pluralise } from '@/utils/format'

export interface DashaLensProps {
  groups: PeriodReadingGroup[]
  /** The running path, e.g. "Guru — Chandra — Budha". */
  runningPath?: string
  /** ISO date the running pratyantar closes. */
  runningEndsOn?: string
  className?: string
}

/**
 * The same questions, laid along the period they were asked in.
 *
 * A chat app orders questions by when you typed them. A chart orders them by
 * the period you were living through — which is what actually changed the
 * answer. Asked in a different dasha, the same question reads differently.
 */
export function DashaLens({ groups, runningPath, runningEndsOn, className }: DashaLensProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {runningPath && (
        <div className="rounded-card border border-gold-border bg-gold-soft p-4">
          <p className="font-mono text-label uppercase text-gold-deep">Running now</p>
          <p className="mt-1.5 font-mono text-data-lg text-ink">{runningPath}</p>
          {runningEndsOn && (
            <p className="mt-1 text-sm text-purple text-pretty">
              Closes {formatDateLong(runningEndsOn)}. Questions asked after it may read differently.
            </p>
          )}
        </div>
      )}

      <ol className="space-y-6">
        {groups.map((group) => (
          <li key={`${group.label}-${group.start}`}>
            {/*
              The rail down the left is the timeline: periods run top to bottom,
              most recent first, and the readings hang off the period they
              belong to rather than off a date.
            */}
            <section className="relative border-l-2 border-border pl-5">
              <span
                aria-hidden
                className={cn(
                  'absolute -left-[7px] top-1.5 size-3 rounded-full border-2 border-canvas',
                  group.current ? 'bg-gold' : 'bg-border-strong',
                )}
              />

              <header className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-mono text-data-lg font-medium text-ink">{group.label}</h3>
                  {group.current && (
                    <Badge tone="gold" mono>
                      Now
                    </Badge>
                  )}
                </div>
                <p className="font-mono text-label uppercase text-muted">
                  {formatPeriod(group.start, group.end)} ·{' '}
                  {pluralise(group.readings.length, 'reading')}
                </p>
              </header>

              <ul className="mt-3 space-y-3">
                {group.readings.map((reading) => (
                  <li key={reading.id}>
                    <ReadingCard reading={reading} showDasha={false} />
                  </li>
                ))}
              </ul>
            </section>
          </li>
        ))}
      </ol>

      <p className="rounded-card border border-border bg-surface-sunken p-4 text-sm text-muted text-pretty">
        <span className="font-mono text-label uppercase text-purple">Why this view · </span>
        A chat app orders questions by when you typed them. A chart orders them by the period you
        were living through — which is what actually changed the answer.
      </p>
    </div>
  )
}
