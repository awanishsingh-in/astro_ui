import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { PlanetaryRelationship } from '@/components/astrology/PlanetaryRelationship'
import { CelestialCard } from '@/components/celestial/CelestialCard'
import type { Drishti, GrahaCode } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { bhavaRef, BHAVA_SIGNIFIES, GRAHAS } from '@/utils/astro'

export interface DrishtiPanelProps {
  drishti: Drishti[]
  /** Occupants per bhava, so a target can name the grahas it lands on. */
  occupants: Record<number, GrahaCode[]>
  activeGraha?: GrahaCode | null
  onSelect?: (graha: GrahaCode) => void
  className?: string
}

/**
 * Aspects, counted in whole bhavas, with the counting shown.
 *
 * The diagram shows the shape of it and the matrix gives the exact cells:
 * twelve columns, one row per graha, a mark where it looks. Reading down a
 * column tells you how contested a bhava is — which is what the tables
 * underneath then restate in words.
 */
export function DrishtiPanel({
  drishti,
  occupants,
  activeGraha,
  onSelect,
  className,
}: DrishtiPanelProps) {
  const bhavas = Array.from({ length: 12 }, (_, i) => i + 1)

  const aspectCount = (bhava: number) => drishti.filter((d) => d.aspects.includes(bhava)).length
  const mostAspected = Math.max(...bhavas.map(aspectCount))
  const unaspected = bhavas.filter((b) => aspectCount(b) === 0)
  const busiest = bhavas.filter((b) => aspectCount(b) === mostAspected)

  const selected = activeGraha ? drishti.find((d) => d.graha === activeGraha) : undefined

  return (
    <div className={cn('space-y-5', className)}>
      {/*
        The web, before the numbers. Nothing selected draws every sightline at
        low opacity — how contested the chart is, at a glance; selecting one
        graha leaves only its own.
      */}
      <CelestialCard motifs={['stars']} tone="midnight" seed="drishti" padding="lg">
        {/*
          Container-relative, not viewport-relative: this card sits in a column
          whose width does not track the breakpoints, so the figure splits when
          the card itself is wide enough rather than when the window is.
        */}
        <div className="@container/figure">
          <div className="grid items-center gap-6 @lg/figure:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
            <PlanetaryRelationship
              drishti={drishti}
              activeGraha={activeGraha}
              onSelect={onSelect}
              tone="dark"
              className="mx-auto w-full max-w-[320px]"
            />

            <div className="min-w-0">
              <p className="font-mono text-label uppercase text-gold-soft-line">Drishti</p>
              <p className="mt-2 text-sub text-on-celestial text-pretty">
                Every graha aspects the seventh bhava from itself. Mangal adds the 4th and 8th, Guru
                the 5th and 9th, Shani the 3rd and 10th.
              </p>
              <p className="mt-3 text-sm text-on-celestial-muted text-pretty">
                {selected
                  ? `${GRAHAS[selected.graha].name} stands in ${bhavaRef(selected.sitsIn)} and looks at ${selected.aspects.map(bhavaRef).join(', ')}.`
                  : 'Every sightline in the chart is drawn at once. Select a graha to leave only its own.'}
              </p>
              <p className="mt-4 font-mono text-label uppercase text-on-celestial-faint">
                Tap a graha to trace it
              </p>
            </div>
          </div>
        </div>
      </CelestialCard>

      {/*
        ── The matrix ──

        `relative` is load-bearing, not decoration. Each cell carries an
        `sr-only` span, and `sr-only` is `position: absolute`. Without a
        positioned ancestor inside the scroller those spans resolve against an
        ancestor *outside* it, escape the clip, and widen the whole page — 108
        invisible 1px elements dragging the document to 393px at a 320px
        viewport. Making the scroller their containing block clips them with
        the rest of the table.
      */}
      <div className="relative -mx-1 min-w-0 overflow-x-auto px-1">
        <table className="w-full min-w-max border-separate border-spacing-0">
          <caption className="sr-only">
            Which bhava each graha aspects. A filled cell means the graha aspects that bhava; a
            ringed cell is where it sits.
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="pb-2 pr-3 text-left font-mono text-label uppercase text-muted"
              >
                Gr
              </th>
              {bhavas.map((bhava) => (
                <th
                  key={bhava}
                  scope="col"
                  className="w-7 pb-2 text-center font-mono text-label font-medium text-muted"
                >
                  {bhava}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drishti.map((row) => {
              const active = row.graha === activeGraha
              return (
                <tr
                  key={row.graha}
                  onClick={onSelect ? () => onSelect(row.graha) : undefined}
                  tabIndex={onSelect ? 0 : undefined}
                  onKeyDown={
                    onSelect
                      ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            onSelect(row.graha)
                          }
                        }
                      : undefined
                  }
                  className={cn(
                    'border-b border-border',
                    onSelect && 'cursor-pointer transition-colors hover:bg-navy-soft',
                    active && 'bg-gold-soft',
                  )}
                >
                  <th
                    scope="row"
                    className="border-b border-border py-2 pr-3 text-left font-normal"
                  >
                    <PlanetGlyph code={row.graha} withCode size="sm" />
                  </th>
                  {bhavas.map((bhava) => {
                    const sits = row.sitsIn === bhava
                    const looks = row.aspects.includes(bhava)
                    return (
                      <td key={bhava} className="border-b border-border py-2 text-center">
                        <span
                          aria-hidden
                          className={cn(
                            'inline-block size-2.5 rounded-full transition-colors duration-200',
                            sits &&
                              'bg-transparent ring-2 ring-navy ring-offset-1 ring-offset-surface',
                            looks && !sits && (active ? 'bg-gold-deep' : 'bg-gold'),
                            !looks && !sits && 'bg-border',
                          )}
                        />
                        <span className="sr-only">
                          {GRAHAS[row.graha].english}{' '}
                          {sits ? `sits in bhava ${bhava}` : looks ? `aspects bhava ${bhava}` : '—'}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-label uppercase text-muted">
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-full bg-gold" /> aspects
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-full ring-2 ring-navy ring-offset-1" /> sits
          in
        </li>
      </ul>

      {/* ── The working, spelled out for whichever graha is selected ── */}
      {selected && (
        <div className="rounded-card border border-gold-border bg-gold-soft p-4">
          <p className="font-mono text-label uppercase text-gold-deep">The working</p>
          <p className="mt-2 text-sub text-ink text-pretty">
            {GRAHAS[selected.graha].name} stands in {bhavaRef(selected.sitsIn)} and aspects{' '}
            {selected.aspects.map(bhavaRef).join(', ')} — its {selected.by.join(', ')} drishti.
          </p>
          <ul className="mt-3 space-y-1.5">
            {selected.aspects.map((bhava, index) => (
              <li key={bhava} className="flex gap-2 font-mono text-data text-purple">
                <span className="text-gold-deep">{selected.by[index]}</span>
                <span aria-hidden>→</span>
                <span>
                  {bhavaRef(bhava)} · {BHAVA_SIGNIFIES[bhava]}
                  {occupants[bhava]?.length ? ` · ${occupants[bhava].join(' ')}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── What the columns add up to ── */}
      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-card border border-border bg-surface p-4">
          <dt className="font-mono text-label uppercase text-muted">Most aspected</dt>
          <dd className="mt-1 font-mono text-data-lg text-ink">
            {busiest.map(bhavaRef).join(' · ')}
            <span className="ml-2 text-sm font-normal text-muted">{mostAspected} each</span>
          </dd>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <dt className="font-mono text-label uppercase text-muted">Unaspected</dt>
          <dd className="mt-1 font-mono text-data-lg text-ink">
            {unaspected.length > 0 ? unaspected.map(bhavaRef).join(' · ') : 'None'}
          </dd>
        </div>
      </dl>
    </div>
  )
}
