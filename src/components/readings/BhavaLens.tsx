import { ChartDiamond } from '@/components/charts/ChartDiamond'
import { ReadingCard } from '@/components/readings/ReadingCard'
import type { Chart } from '@/types/astrology'
import type { BhavaReadingGroup } from '@/types/readings'
import { cn } from '@/utils/cn'
import { bhavaRef, BHAVA_SIGNIFIES } from '@/utils/astro'
import { pluralise } from '@/utils/format'

export interface BhavaLensProps {
  groups: BhavaReadingGroup[]
  /** Bhavas with no readings yet — an invitation, not an omission. */
  unasked: number[]
  /** Drives the diamond index. Omitted on narrow screens. */
  chart?: Chart
  activeBhava?: number
  onSelectBhava: (bhava: number) => void
  className?: string
}

/**
 * The chart as the index.
 *
 * Each bhava carries the number of readings drawn from it, so the shape of
 * what you have asked about is visible before you read a word. Chosen together
 * the readings under one bhava are a continuous account of that part of life
 * rather than separate conversations.
 */
export function BhavaLens({
  groups,
  unasked,
  chart,
  activeBhava,
  onSelectBhava,
  className,
}: BhavaLensProps) {
  const counts = Object.fromEntries(groups.map((g) => [g.bhava, g.readings.length]))
  const active = groups.find((g) => g.bhava === activeBhava) ?? groups[0]

  return (
    <div className={cn('space-y-6', className)}>
      {chart && (
        <div className="grid gap-5 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:items-start">
          <div className="rounded-card border border-border bg-surface p-3">
            <ChartDiamond
              chart={chart}
              countsByBhava={counts}
              activeBhava={active?.bhava}
              onBhavaClick={onSelectBhava}
              centerLabel="TAP A BHAVA"
              centerSubLabel={`${groups.reduce((n, g) => n + g.readings.length, 0)} READINGS`}
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted text-pretty">
              Each bhava carries the number of readings drawn from it. The gold cell is the one you
              are looking at.
            </p>

            {unasked.length > 0 && (
              <div className="rounded-card border border-border bg-surface-sunken p-4">
                <p className="font-mono text-label uppercase text-muted">Never asked about</p>
                <p className="mt-1.5 font-mono text-data text-purple">
                  {unasked.map(bhavaRef).join(' · ')}
                </p>
                <p className="mt-1.5 text-sm text-muted text-pretty">
                  {unasked.map((b) => BHAVA_SIGNIFIES[b]).join(', ')}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Bhava selector, for when the diamond is not shown ── */}
      <div
        role="tablist"
        aria-label="Bhavas with readings"
        className="no-scrollbar rail-bleed flex gap-2 overflow-x-auto"
      >
        {groups.map((group) => {
          const selected = group.bhava === active?.bhava
          return (
            <button
              key={group.bhava}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onSelectBhava(group.bhava)}
              className={cn(
                'flex min-h-11 shrink-0 items-center gap-2 rounded-control border px-4 py-2 text-sm',
                'transition-[background-color,border-color,color,transform] duration-150 ease-out-soft',
                'active:scale-[0.98]',
                selected
                  ? 'border-gold bg-gold-soft font-semibold text-gold-deep'
                  : 'border-border bg-surface text-purple hover:border-border-strong hover:bg-navy-soft',
              )}
            >
              <span className="font-mono">{bhavaRef(group.bhava)}</span>
              <span className="truncate">{group.signifies}</span>
              <span className={cn('font-mono text-label', selected ? 'text-gold-deep' : 'text-muted')}>
                {group.readings.length}
              </span>
            </button>
          )
        })}
      </div>

      {active && (
        <section aria-live="polite" className="space-y-4">
          <header className="space-y-1.5 border-l-2 border-gold pl-4">
            <h2 className="text-heading font-semibold text-ink">
              Bhava {active.bhava} · {active.signifies}
            </h2>
            <p className="font-mono text-data text-muted">{active.context}</p>
            <p className="text-sm text-muted text-pretty">
              {pluralise(active.readings.length, 'reading')} drawn from this bhava. Read together
              they are one continuous account, not separate conversations.
            </p>
          </header>

          <ul className="space-y-3">
            {active.readings.map((reading) => (
              <li key={reading.id}>
                <ReadingCard reading={reading} showBhava={false} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
