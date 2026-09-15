import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/common/Card'
import { SectionHeader } from '@/components/common/SectionHeader'
import { BhavaDial } from '@/components/astrology/BhavaDial'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { PlanetaryConnection, PlanetOrbitCard } from '@/components/celestial'
import type { BhavaHighlight, ChartInsight } from '@/services/home.service'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'
import { bhavaRef } from '@/utils/astro'
import { formatDateLong, formatMonthYear } from '@/utils/format'

export interface ChartInsightPanelProps {
  insight: ChartInsight
  className?: string
}

/**
 * What the chart says before anything is asked of it.
 *
 * The running period first, because it is what changes an answer; then the
 * bhavas that support and resist, then where the user's own attention has
 * gone. Every line is a fact from the chart, not a horoscope — and each one is
 * drawn as the astrology it is: the period under its graha's orbit, the
 * bhavas on a twelve-segment dial, the note as the sightline it describes.
 */
export function ChartInsightPanel({ insight, className }: ChartInsightPanelProps) {
  return (
    <section aria-labelledby="insight-title" className={cn('space-y-4', className)}>
      <SectionHeader
        as="h2"
        size="sm"
        title={<span id="insight-title">What your chart is doing now</span>}
      />

      {/* ── The running period, under its own graha ── */}
      <PlanetOrbitCard activeGraha={insight.dashaGraha} align="right">
        <p className="font-mono text-label uppercase text-gold-deep">Running period</p>

        <div className="mt-2 flex items-center gap-3">
          <span
            aria-hidden
            className="inline-grid size-10 shrink-0 place-items-center rounded-full border border-gold bg-surface text-xl"
          >
            <PlanetGlyph code={insight.dashaGraha} size="lg" />
          </span>
          <span className="min-w-0">
            <span className="block font-mono text-data-lg text-ink">{insight.dashaPath}</span>
            <span className="mt-0.5 block font-mono text-label uppercase text-muted">
              {formatMonthYear(insight.dashaFrom)} — {formatMonthYear(insight.dashaTo)}
            </span>
          </span>
        </div>

        <p className="mt-3 text-sm text-purple text-pretty">
          Closes {formatDateLong(insight.dashaEndsOn)}. Questions asked after it may read
          differently.
        </p>
      </PlanetOrbitCard>

      {/* ── Where the chart supports, resists, and is asked about ── */}
      <Card padding="none" className="divide-y divide-border overflow-hidden">
        <Highlight label="Strongest" highlight={insight.strongest} unit="bindus" tone="strong" />
        <Highlight label="Weakest" highlight={insight.weakest} unit="bindus" tone="weak" />
        <Highlight
          label="Most asked"
          highlight={insight.mostAsked}
          unit="readings"
          tone="neutral"
          /* Reading counts are not bindus, so the arc would be measuring
             nothing — this dial shows position only. */
          measured={false}
        />
      </Card>

      {/* ── The note, and the grahas it is about ── */}
      <Card padding="md" className="gap-2">
        <p className="font-mono text-label uppercase text-muted">Planetary note</p>

        {insight.noteGrahas.length > 0 && (
          <PlanetaryConnection
            from={insight.noteGrahas}
            to={bhavaRef(insight.strongest.bhava)}
            className="my-1"
          />
        )}

        <p className="text-sm text-purple text-pretty">{insight.note}</p>

        <Link
          to={paths.chart}
          className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold-deep"
        >
          See the working
          <ArrowUpRight aria-hidden className="size-3.5" />
        </Link>
      </Card>
    </section>
  )
}

function Highlight({
  label,
  highlight,
  unit,
  tone,
  measured = true,
}: {
  label: string
  highlight: BhavaHighlight
  unit: string
  tone: 'strong' | 'weak' | 'neutral'
  measured?: boolean
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <BhavaDial
        bhava={highlight.bhava}
        value={measured ? highlight.value : undefined}
        tone={tone}
        className="size-10 shrink-0"
      />

      {/*
        Label and value share the top line and the bhava gets the whole width
        beneath it. Ranged side by side they both lose: this rail is the
        narrowest column on the page, and "strongest bhava" is two words that
        should never wrap.
      */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="min-w-0 truncate font-mono text-label uppercase text-muted">{label}</p>
          <p
            className={cn(
              'shrink-0 font-mono text-label uppercase',
              tone === 'strong' ? 'text-gold-deep' : 'text-muted',
            )}
          >
            <span className="text-data">{highlight.value}</span> {unit}
          </p>
        </div>
        <p className="mt-1 truncate text-sub text-ink">
          <span className="font-mono text-data text-purple">{bhavaRef(highlight.bhava)}</span>
          {' · '}
          {highlight.signifies}
        </p>
      </div>
    </div>
  )
}
