import { Card } from '@/components/common/Card'
import { SectionHeader } from '@/components/common/SectionHeader'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import type { Chart, GrahaCode } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { NakshatraBadge } from '@/components/celestial'
import {
  bhavaRef,
  dignityLabel,
  dignityToneClass,
  GRAHAS,
  GRAHA_ORDER,
  rashiGlyph,
} from '@/utils/astro'
import { formatDegree } from '@/utils/format'

export interface ReadingNotesProps {
  chart: Chart
  /** When a graha is selected, its detail replaces the general notes. */
  activeGraha?: GrahaCode | null
  activeBhava?: number
  className?: string
}

/**
 * The right-hand column: what the chart says in words.
 *
 * With nothing selected it shows the chart's general observations. Select a
 * graha and it becomes that graha's detail — the same panel, focused, rather
 * than a second panel appearing.
 */
export function ReadingNotes({ chart, activeGraha, activeBhava, className }: ReadingNotesProps) {
  const graha = activeGraha ? chart.grahas.find((g) => g.graha === activeGraha) : undefined
  const bhava = activeBhava ? chart.bhavas.find((b) => b.bhava === activeBhava) : undefined
  const bindus = chart.ashtakavarga.entries.find((e) => e.bhava === (bhava?.bhava ?? -1))

  return (
    <aside className={cn('space-y-4', className)}>
      {graha ? (
        <>
          <SectionHeader as="h2" size="sm" title={`${GRAHAS[graha.graha].name} in detail`} />
          <Card padding="md" tone="gold" className="gap-3">
            <div className="flex items-center gap-3">
              <PlanetGlyph code={graha.graha} size="lg" />
              <div className="min-w-0">
                <p className="text-sub font-medium text-ink">
                  <span aria-hidden className="mr-1.5 text-muted">
                    {rashiGlyph(graha.rashi)}
                  </span>
                  {graha.rashi} {formatDegree(graha.degree, graha.minute)}
                </p>
                <NakshatraBadge
                  name={graha.nakshatra.name}
                  pada={graha.nakshatra.pada}
                  lord={graha.nakshatra.lord}
                  size="sm"
                  className="mt-1"
                />
              </div>
            </div>

            <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-card border border-border bg-border">
              <Fact label="Bhava" value={bhavaRef(graha.bhava)} />
              <Fact
                label="Dignity"
                value={dignityLabel(graha.dignity)}
                valueClass={dignityToneClass(graha.dignity)}
              />
              <Fact
                label="Motion"
                value={
                  graha.motion === 'retrograde'
                    ? 'Retrograde'
                    : graha.motion === 'node'
                      ? 'Node'
                      : 'Direct'
                }
                valueClass={graha.motion === 'retrograde' ? 'text-retrograde' : undefined}
              />
            </dl>
          </Card>
        </>
      ) : bhava ? (
        <>
          <SectionHeader as="h2" size="sm" title={`Bhava ${bhava.bhava} in detail`} />
          <Card padding="md" tone="gold" className="gap-3">
            <p className="text-sub font-medium text-ink">{bhava.signifies}</p>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border">
              <Fact label="Rashi" value={bhava.rashi} />
              <Fact label="Lord" value={bhava.lord} />
              <Fact label="Lord sits in" value={bhavaRef(bhava.lordSitsIn)} />
              <Fact label="Bindus" value={bindus ? String(bindus.bindus) : '—'} />
            </dl>
            {bhava.occupants.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-label uppercase text-muted">Occupied by</span>
                {bhava.occupants.map((code) => (
                  <PlanetGlyph key={code} code={code} withCode size="sm" />
                ))}
              </div>
            )}
          </Card>
        </>
      ) : (
        <>
          <SectionHeader
            as="h2"
            size="sm"
            title="Reading notes"
            description="What this chart says before anything is asked of it."
          />
          {chart.notes.length === 0 ? (
            <Card padding="md" className="gap-2 border-dashed">
              <p className="text-sm text-muted text-pretty">
                Tap a house on the diamond, or a graha in the tables, to focus a reading here.
              </p>
            </Card>
          ) : (
            <ul className="space-y-3">
              {chart.notes.map((note, index) => {
                const cited = GRAHA_ORDER.filter((code) => note.includes(GRAHAS[code].name))
                return (
                  <li key={note}>
                    <Card
                      padding="md"
                      tone={index === 0 ? 'gold' : 'default'}
                      className="gap-2"
                    >
                      {cited.length > 0 && (
                        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          {cited.map((code) => (
                            <PlanetGlyph key={code} code={code} withName size="sm" />
                          ))}
                        </span>
                      )}
                      <p className="text-sm leading-relaxed text-purple text-pretty">{note}</p>
                    </Card>
                  </li>
                )
              })}
            </ul>
          )}
          {!activeGraha && !activeBhava && chart.notes.length > 0 && (
            <p className="font-mono text-label uppercase tracking-[0.12em] text-faint">
              Tip · tap a house on the chart
            </p>
          )}
        </>
      )}
    </aside>
  )
}

function Fact({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="bg-surface p-3">
      <dt className="font-mono text-label uppercase text-muted">{label}</dt>
      <dd className={cn('mt-0.5 text-sm text-ink', valueClass)}>{value}</dd>
    </div>
  )
}
