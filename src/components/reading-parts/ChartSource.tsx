import { Compass } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/common/Button'
import { CelestialCard } from '@/components/celestial/CelestialCard'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { paths } from '@/routes/paths'
import type { Answer } from '@/types/readings'
import { cn } from '@/utils/cn'
import { bhavaRef, BHAVA_SIGNIFIES } from '@/utils/astro'
import { formatDateLong } from '@/utils/format'

export interface ChartSourceProps {
  answer: Answer
  /** Hide the link when the reading is shown inside the chart already. */
  withChartLink?: boolean
  className?: string
}

/**
 * Parts 4 and 5 — what the answer was read from, and when it applies.
 *
 * This block is the product's whole claim, so it is the one celestial surface
 * inside a reading: the prose above it is the app talking, this is the sky it
 * was read from. Anything asserted above can be checked against the chart
 * dashboard, which is why the bhava is a link and the window is a range rather
 * than a date.
 */
export function ChartSource({ answer, withChartLink = true, className }: ChartSourceProps) {
  const { source, window } = answer

  return (
    <CelestialCard
      motifs={['stars']}
      tone="midnight"
      seed={source.dashaPath ?? 'source'}
      padding="lg"
      className={className}
    >
      <p className="font-mono text-label uppercase text-gold-soft-line">Read from your chart</p>

      <dl className="mt-4 space-y-3">
        {source.bhava !== undefined && (
          <Row label="House">
            <span className="font-mono text-data text-on-celestial">
              {bhavaRef(source.bhava)} · {BHAVA_SIGNIFIES[source.bhava]}
            </span>
          </Row>
        )}

        <Row label="Planets">
          <span className="flex flex-wrap items-center gap-3">
            {source.grahas.map((code) => (
              <PlanetGlyph key={code} code={code} withName size="sm" tone="dark" />
            ))}
          </span>
        </Row>

        {source.dashaPath && (
          <Row label="Dasha">
            <span className="font-mono text-data text-on-celestial">{source.dashaPath}</span>
          </Row>
        )}

        {/* Part 5 — a range, never a single date. */}
        {window && (
          <Row label="Window">
            <span className="font-mono text-data text-on-celestial">
              {formatDateLong(window.start)} – {formatDateLong(window.end)}
            </span>
          </Row>
        )}
      </dl>

      {withChartLink && (
        <Button
          variant="celestialGhost"
          size="sm"
          to={paths.chart}
          iconLeft={<Compass className="size-4" />}
          className="mt-4 w-fit"
        >
          Open this in my chart
        </Button>
      )}
    </CelestialCard>
  )
}

/** What the chart cannot see. Always shown next to the source it qualifies. */
export function ChartLimits({ limits, className }: { limits: string; className?: string }) {
  return (
    <div className={cn('rounded-card border border-border bg-surface-sunken p-4', className)}>
      <p className="font-mono text-label uppercase text-muted">What this does not show</p>
      <p className="mt-1.5 text-sm text-purple text-pretty">{limits}</p>
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="shrink-0 font-mono text-label uppercase text-on-celestial-faint sm:w-20">
        {label}
      </dt>
      <dd className="min-w-0 flex-1">{children}</dd>
    </div>
  )
}
