import { useState } from 'react'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { DashaNow, DashaRibbon } from '@/components/astrology/DashaRibbon'
import { DashaTrack } from '@/components/astrology/DashaTrack'
import { CelestialCard } from '@/components/celestial/CelestialCard'
import type { DashaPeriod } from '@/types/astrology'
import type { DashaSummary } from '@/data/dasha-mock'
import { cn } from '@/utils/cn'
import { formatDateLong, formatMonthYear } from '@/utils/format'

export interface DashaTimelineProps {
  dasha: DashaSummary
  className?: string
}

/**
 * Vimshottari as three nested timelines.
 *
 * The celestial ribbon at the top carries the whole 120-year cycle at once;
 * the list under it is where the dates are actually read. Both are
 * proportional to each period's real length, so the eye reads the shape of a
 * life rather than a list of dates: Shani's nineteen years next to Surya's
 * six. The running period is opened by default at every level.
 */
export function DashaTimeline({ dasha, className }: DashaTimelineProps) {
  const current = dasha.periods.find((p) => p.current)
  const [openMaha, setOpenMaha] = useState<string | null>(current?.name ?? null)
  const opened = dasha.periods.find((p) => p.name === openMaha)

  return (
    <div className={cn('space-y-5', className)}>
      <CelestialCard motifs={['stars']} tone="midnight" seed={dasha.path} padding="lg">
        {current && (
          <DashaNow
            path={dasha.path}
            graha={current.graha}
            closes={`Closes ${formatDateLong(dasha.endsOn)}.`}
          />
        )}
        <DashaRibbon
          periods={dasha.periods}
          onSelect={(period) => setOpenMaha(period.name)}
          className="mt-5"
        />
      </CelestialCard>

      {/*
        The nakshatra's lord opens the 120-year cycle, and the Moon had already
        travelled part of that nakshatra at birth — so the first mahadasha
        starts before the birth date and only its balance is lived.
      */}
      <p className="text-sm text-muted text-pretty">
        Vimshottari, counted from Chandra in {dasha.enteredAt.name} pada {dasha.enteredAt.pada}. Its
        lord opens the sequence, which is why the first mahadasha begins before the birth date —
        only the balance of it is lived.
      </p>

      {/* The cycle as one axis — every row placed where it actually falls. */}
      <DashaTrack
        periods={dasha.periods}
        openName={openMaha}
        onSelect={(p) => setOpenMaha(openMaha === p.name ? null : p.name)}
      />

      {/*
        The opened mahadasha's antardashas, under the track rather than inside
        it: nesting a second timeline inside a row would make both unreadable
        at any width a phone has.
      */}
      {opened?.children && (
        <section aria-label={`${opened.name} antardashas`} className="space-y-1.5">
          <p className="font-mono text-label uppercase text-gold-deep">
            {opened.name} · {opened.children.length} antardashas
          </p>
          <ol className="space-y-1.5 border-l border-border pl-4">
            {opened.children.map((antar) => (
              <li key={`${antar.name}-${antar.start}`}>
                <SubPeriod period={antar} parentLabel={opened.name} />
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}

function SubPeriod({ period, parentLabel }: { period: DashaPeriod; parentLabel: string }) {
  return (
    <div
      className={cn(
        'rounded-card border p-3',
        period.current ? 'border-gold-border bg-gold-soft' : 'border-transparent bg-surface-sunken',
      )}
    >
      <div className="flex items-center gap-2.5">
        <PlanetGlyph code={period.graha} size="sm" className="shrink-0" />
        <span className="min-w-0 flex-1 truncate text-sm text-ink">
          {parentLabel} — {period.name}
        </span>
        <span className="shrink-0 font-mono text-label uppercase text-muted">
          {formatMonthYear(period.start)} → {formatMonthYear(period.end)}
        </span>
      </div>

      {period.children && (
        <ol className="mt-2.5 space-y-1 border-t border-gold-border pt-2.5">
          {period.children.map((pratyantar) => (
            <li
              key={`${pratyantar.name}-${pratyantar.start}`}
              className={cn(
                'flex items-center gap-2 font-mono text-data',
                pratyantar.current ? 'text-ink' : 'text-muted',
              )}
            >
              <span className="w-3 shrink-0 text-gold-deep">{pratyantar.current ? '›' : ''}</span>
              <span className="min-w-0 flex-1 truncate">
                {parentLabel} — {period.name} — {pratyantar.name}
              </span>
              <span className="shrink-0 text-label uppercase">
                {formatMonthYear(pratyantar.end)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
