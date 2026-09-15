import type { Ashtakavarga } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { BHAVA_SIGNIFIES, bhavaRef, rashiGlyph } from '@/utils/astro'
import { BinduRing } from '@/components/astrology/BinduRing'
import { CelestialCard } from '@/components/celestial/CelestialCard'

export interface AshtakavargaGridProps {
  ashtakavarga: Ashtakavarga
  activeBhava?: number
  onSelect?: (bhava: number) => void
  className?: string
}

/**
 * Sarvashtakavarga: bindus per sign, read against the mean.
 *
 * The ring shows the distribution — which quarters of the sky back this chart —
 * and the bars underneath carry the exact counts. In both, the mean is drawn
 * through the data rather than stated in a caption, because the whole reading
 * is "above it or below it": a segment that crosses the line supports what is
 * tried in that bhava, one that falls short resists it.
 */
export function AshtakavargaGrid({
  ashtakavarga,
  activeBhava,
  onSelect,
  className,
}: AshtakavargaGridProps) {
  const { entries, total, mean } = ashtakavarga

  const max = Math.max(...entries.map((e) => e.bindus))
  const min = Math.min(...entries.map((e) => e.bindus))
  // Give the chart a little headroom so the tallest bar is not flush to the top.
  const ceiling = max + 2
  const floor = Math.max(0, min - 4)
  const scale = (value: number) => ((value - floor) / (ceiling - floor)) * 100

  const strongest = entries.reduce((best, e) => (e.bindus > best.bindus ? e : best))
  const weakest = entries.reduce((worst, e) => (e.bindus < worst.bindus ? e : worst))

  return (
    <div className={cn('space-y-5', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-mono text-label uppercase text-muted">Sarvashtakavarga</p>
        <p className="font-mono text-data text-purple">
          total {total} · mean {mean}
        </p>
      </div>

      <CelestialCard motifs={['stars']} tone="midnight" seed="sav" padding="lg">
        {/*
          Container-relative, not viewport-relative: this card sits in a column
          whose width does not track the breakpoints, so the figure splits when
          the card itself is wide enough rather than when the window is.
        */}
        <div className="@container/figure">
          <div className="grid items-center gap-6 @lg/figure:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
            <BinduRing
              ashtakavarga={ashtakavarga}
              activeBhava={activeBhava}
              onSelect={onSelect}
              className="mx-auto w-full max-w-[300px]"
            />

            <div className="min-w-0">
              <p className="font-mono text-label uppercase text-gold-soft-line">Distribution</p>
              <p className="mt-2 text-sub text-on-celestial text-pretty">
                {strongest.rashi} carries the most support at {strongest.bindus} bindus;{' '}
                {weakest.rashi} the least at {weakest.bindus}.
              </p>
              <p className="mt-3 text-sm text-on-celestial-muted text-pretty">
                The dashed circle is the mean of {mean}. Segments that reach past it mark where the
                chart backs what is attempted; the ones inside it mark where it does not.
              </p>
              <p className="mt-4 font-mono text-label uppercase text-on-celestial-faint">
                Tap a segment to open that bhava
              </p>
            </div>
          </div>
        </div>
      </CelestialCard>

      {/* ── The bars, with the mean drawn through them ── */}
      <div className="relative -mx-1 overflow-x-auto px-1 pb-1">
        <div className="relative flex min-w-[420px] items-end gap-1.5" style={{ height: 180 }}>
          {/*
            The mean is drawn *over* the bars, not behind them — comparing a
            bar to the line is the whole reading, so the line must stay visible
            where it crosses. The label carries the page ground behind it so it
            never disappears into a tall bar.
          */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 z-20 border-t border-dashed border-gold"
            style={{ bottom: `${scale(mean)}%` }}
          >
            <span className="absolute -top-2.5 right-0 rounded-xs bg-canvas px-1.5 font-mono text-label uppercase text-gold-deep">
              mean {mean}
            </span>
          </div>

          {entries.map((entry) => {
            const above = entry.bindus >= mean
            const active = entry.bhava === activeBhava
            const Tag = onSelect ? 'button' : 'div'

            return (
              <Tag
                key={entry.bhava}
                type={onSelect ? 'button' : undefined}
                onClick={onSelect ? () => onSelect(entry.bhava) : undefined}
                aria-label={`Bhava ${entry.bhava}, ${entry.rashi}, ${entry.bindus} bindus, ${above ? 'above' : 'below'} the mean`}
                className={cn(
                  'group relative z-10 flex h-full min-w-0 flex-1 flex-col justify-end gap-1.5',
                  onSelect && 'cursor-pointer',
                )}
              >
                <span className="text-center font-mono text-label text-muted group-hover:text-ink">
                  {entry.bindus}
                </span>
                <span
                  className={cn(
                    'w-full rounded-t-xs transition-[height,background-color] duration-500 ease-out-soft',
                    active
                      ? 'bg-gold'
                      : above
                        ? 'bg-navy group-hover:bg-navy-hover'
                        : 'bg-border-strong group-hover:bg-faint',
                  )}
                  style={{ height: `${scale(entry.bindus)}%` }}
                />
              </Tag>
            )
          })}
        </div>

        {/* Axis: bhava number and its sign glyph */}
        <div className="mt-2 flex min-w-[420px] gap-1.5">
          {entries.map((entry) => (
            <div key={entry.bhava} className="min-w-0 flex-1 text-center">
              <p
                className={cn(
                  'font-mono text-label',
                  entry.bhava === activeBhava ? 'text-gold-deep' : 'text-muted',
                )}
              >
                {entry.bhava}
              </p>
              <p aria-hidden className="text-xs text-muted">
                {rashiGlyph(entry.rashi)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted text-pretty">
        Bindus per sign, ordered from the lagna. Above the mean a bhava supports what is tried in
        it; below, it resists.
      </p>

      <dl className="grid gap-3 sm:grid-cols-2">
        <Extreme label="Strongest" entry={strongest} tone="positive" />
        <Extreme label="Weakest" entry={weakest} tone="caution" />
      </dl>
    </div>
  )
}

function Extreme({
  label,
  entry,
  tone,
}: {
  label: string
  entry: { bhava: number; rashi: string; bindus: number }
  tone: 'positive' | 'caution'
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <dt className="font-mono text-label uppercase text-muted">{label}</dt>
      <dd className="mt-1">
        <span className="font-mono text-data-lg text-ink">
          {bhavaRef(entry.bhava)} · {entry.bindus}
        </span>
        <span
          className={cn(
            'ml-2 text-sm',
            tone === 'positive' ? 'text-dignity-exalted' : 'text-caution',
          )}
        >
          {BHAVA_SIGNIFIES[entry.bhava]}
        </span>
      </dd>
    </div>
  )
}
