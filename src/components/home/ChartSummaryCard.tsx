import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PremiumChartWheel } from '@/components/charts/PremiumChartWheel'
import { CelestialBackground } from '@/components/celestial/CelestialBackground'
import { ZodiacSymbols } from '@/components/celestial/ZodiacSymbols'
import type { Chart } from '@/types/astrology'
import type { BirthDetails } from '@/types/user'
import type { ChartInsight } from '@/services/home.service'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'
import { GRAHAS, rashiGlyph, type ChartSummary } from '@/utils/astro'
import { formatDateShort, formatDegree, formatTime12 } from '@/utils/format'

export interface ChartSummaryCardProps {
  fullName: string
  birthDetails: BirthDetails
  chart: Chart
  summary: ChartSummary
  insight: ChartInsight
  /** Stacks the wheel above the placements — the narrow-column arrangement. */
  layout?: 'row' | 'stack'
  className?: string
}

/**
 * The chart, as an object rather than a link.
 *
 * This is the densest card in the product and deliberately so: the whole
 * premise is that answers come from *this*, so it carries the identity, the
 * three placements it is recognised by, the wheel itself, and the period
 * currently running — everything needed to trust the next answer.
 *
 * The top half is night sky and the bottom half is paper: the chart is the
 * thing being looked at, the placements are the reading of it. That division
 * is the product's whole visual argument in one card.
 */
export function ChartSummaryCard({
  fullName,
  birthDetails,
  chart,
  summary,
  insight,
  layout = 'row',
  className,
}: ChartSummaryCardProps) {
  const stack = layout === 'stack'

  return (
    <section
      aria-labelledby="chart-card-title"
      className={cn(
        'group relative overflow-hidden rounded-panel border border-border-strong bg-surface shadow-raised',
        className,
      )}
    >
      {/* A single gold hairline along the top — the one flourish this card gets. */}
      <span aria-hidden className="absolute inset-x-0 top-0 z-10 h-0.5 bg-gold" />

      <CelestialBackground
        motifs={['stars']}
        tone="midnight"
        seed={`chart-${chart.varga}`}
        contentClassName={cn('gap-5 p-5', stack ? 'flex flex-col' : 'flex flex-col sm:flex-row')}
      >
        <div className={cn('min-w-0', stack ? '' : 'sm:order-2 sm:flex-1')}>
          <p className="font-mono text-label uppercase text-gold-soft-line">My chart</p>
          <h2
            id="chart-card-title"
            className="mt-1.5 truncate text-heading font-semibold text-on-celestial"
          >
            {fullName}
          </h2>
          <p className="mt-1 font-mono text-data text-on-celestial-muted">
            {formatDateShort(birthDetails.date)}
            {' · '}
            {birthDetails.timeUnknown ? 'time unknown' : formatTime12(birthDetails.time)}
            {' · '}
            {birthDetails.place.label.split(',')[0]}
          </p>
        </div>

        <div
          className={cn(
            'mx-auto w-full',
            stack ? 'max-w-[280px]' : 'max-w-[200px] sm:order-1 sm:mx-0',
          )}
        >
          <PremiumChartWheel chart={chart} tone="dark" animationKey={chart.varga} />

          {/*
            The twelve signs under the wheel, with this chart's lagna the only
            one lit. It is the wheel's outer band restated as a legend — which
            sign the chart actually starts from, readable at a glance.
          */}
          <ZodiacSymbols activeRashi={chart.lagna.rashi} tone="dark" className="mt-3 px-1" />
        </div>
      </CelestialBackground>

      <div className="p-5">
        <dl className="grid content-start gap-px overflow-hidden rounded-card border border-border bg-border">
          <Placement
            label="Ascendant"
            rashi={summary.ascendant.rashi}
            degree={summary.ascendant.degree}
            minute={summary.ascendant.minute}
            glyph="Lagna"
          />
          <Placement
            label="Sun sign"
            rashi={summary.sun.rashi}
            degree={summary.sun.degree}
            minute={summary.sun.minute}
            glyph={GRAHAS.Su.glyph}
          />
          <Placement
            label="Moon sign"
            rashi={summary.moon.rashi}
            degree={summary.moon.degree}
            minute={summary.moon.minute}
            glyph={GRAHAS.Mo.glyph}
          />
        </dl>
      </div>

      {/* Chart context — the period every answer is currently read against. */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-border bg-navy-soft px-5 py-3">
        <span className="font-mono text-label uppercase text-muted">Running dasha</span>
        <span className="font-mono text-data text-ink">{insight.dashaPath}</span>
      </div>

      <div className="border-t border-border p-3">
        <Link
          to={paths.chart}
          className={cn(
            'flex items-center justify-between gap-3 rounded-control px-3 py-2.5',
            'text-sub font-semibold text-navy transition-colors duration-150',
            'hover:bg-navy-soft active:bg-navy-soft',
          )}
        >
          Open my chart
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </section>
  )
}

function Placement({
  label,
  rashi,
  degree,
  minute,
  glyph,
}: {
  label: string
  rashi: string
  degree: number
  minute: number
  glyph: string
}) {
  return (
    <div className="flex items-center gap-3 bg-surface px-4 py-3">
      <span
        aria-hidden
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-xs bg-navy-soft text-gold-deep',
          glyph.length > 2 ? 'h-7 px-1.5 font-mono text-[9px] uppercase' : 'size-7 text-base',
        )}
      >
        {glyph}
      </span>
      <div className="min-w-0 flex-1">
        <dt className="font-mono text-label uppercase text-muted">{label}</dt>
        <dd className="mt-0.5 truncate text-sub font-medium text-ink">
          <span aria-hidden className="mr-1 text-muted">
            {rashiGlyph(rashi as never)}
          </span>
          {rashi}
        </dd>
      </div>
      <span className="shrink-0 font-mono text-data text-muted">
        {formatDegree(degree, minute)}
      </span>
    </div>
  )
}
