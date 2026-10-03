import { ChevronDown } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { PlanetaryRelationship } from '@/components/astrology/PlanetaryRelationship'
import { PlanetDetailSheet } from '@/components/charts/PlanetDetailSheet'
import { GRAHA_FRIENDS } from '@/data/kootas'
import type { Chart, Dignity, GrahaCode, GrahaPosition, Motion } from '@/types/astrology'
import { GRAHAS, GRAHA_ORDER, motionLabel, RASHIS } from '@/utils/astro'
import { cn } from '@/utils/cn'

interface PlanetRow {
  id: string
  label: string
  code: string
  graha?: GrahaCode
  rashi: string
  rashiEnglish: string
  degree: number
  minute: number
  bhava: number
  nakshatra: string
  pada: number
  dignity: Dignity | 'lagna'
  motion: Motion | 'lagna'
}

type AccordionId = 'chalit' | 'maitri' | 'upagraha'

export interface ChartPlanetsPanelProps {
  chart: Chart
  activeGraha: GrahaCode | null
  onSelectGraha: (graha: GrahaCode) => void
  className?: string
}

/**
 * Planets tab — positions table + Chalit / Maitri / Upagraha accordions.
 */
export function ChartPlanetsPanel({
  chart,
  activeGraha,
  onSelectGraha,
  className,
}: ChartPlanetsPanelProps) {
  const [open, setOpen] = useState<Record<AccordionId, boolean>>({
    chalit: false,
    maitri: false,
    upagraha: false,
  })

  const rows = useMemo<PlanetRow[]>(() => {
    const lagna: PlanetRow = {
      id: 'La',
      label: 'Lagna',
      code: 'As',
      rashi: chart.lagna.rashi,
      rashiEnglish: englishSign(chart.lagna.rashi),
      degree: chart.lagna.degree,
      minute: chart.lagna.minute,
      bhava: 1,
      nakshatra: '—',
      pada: 0,
      dignity: 'lagna',
      motion: 'lagna',
    }

    const grahaRows = GRAHA_ORDER.map((code) => {
      const g = chart.grahas.find((row) => row.graha === code)
      return g ? toRow(g) : null
    }).filter(Boolean) as PlanetRow[]

    return [lagna, ...grahaRows]
  }, [chart])

  function toggle(id: AccordionId) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className={cn('animate-rise space-y-4', className)}>
      <div
        className={cn(
          'grid gap-4',
          activeGraha && 'lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:items-start',
        )}
      >
        <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface shadow-card">
          <header className="flex flex-wrap items-end justify-between gap-2 px-5 py-4 sm:px-6">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">
              Planetary positions
            </h2>
            <p className="text-sm text-muted">Click a planet for its full reading.</p>
          </header>

          <div className="overflow-x-auto px-3 pb-3 sm:px-4 sm:pb-4">
            <table className="w-full min-w-[40rem] border-separate border-spacing-y-1.5 text-left">
              <thead>
                <tr className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-1 font-semibold">Planet</th>
                  <th className="px-3 py-1 font-semibold">Sign</th>
                  <th className="px-3 py-1 font-semibold">Degree</th>
                  <th className="px-3 py-1 font-semibold">House</th>
                  <th className="hidden px-3 py-1 font-semibold md:table-cell">Nakshatra · Pada</th>
                  <th className="px-3 py-1 font-semibold">State</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const active = row.graha === activeGraha
                  const state = stateLabel(row)
                  return (
                    <tr
                      key={row.id}
                      onClick={() => {
                        if (row.graha) onSelectGraha(row.graha)
                      }}
                      className={cn(
                        'cursor-pointer rounded-xl transition',
                        active ? 'bg-[#7c4dff]/14' : 'bg-surface-sunken/35 hover:bg-[#7c4dff]/08',
                        !row.graha && 'cursor-default',
                      )}
                    >
                      <td className="rounded-l-xl px-3 py-3">
                        <span className="flex items-center gap-2.5">
                          {row.graha ? (
                            <PlanetGlyph code={row.graha} size="sm" />
                          ) : (
                            <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#7c4dff]/25 text-[10px] font-bold text-[#c4a0ff]">
                              As
                            </span>
                          )}
                          <span className="text-sm font-semibold text-ink">{row.label}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-ink">{row.rashiEnglish}</td>
                      <td className="px-3 py-3 font-mono text-sm text-ink">
                        {row.degree}°{String(row.minute).padStart(2, '0')}′
                      </td>
                      <td className="px-3 py-3 font-mono text-sm text-ink">{row.bhava}</td>
                      <td className="hidden px-3 py-3 text-sm text-muted md:table-cell">
                        {row.nakshatra === '—' ? '—' : `${row.nakshatra} ${row.pada}`}
                      </td>
                      <td className="rounded-r-xl px-3 py-3">
                        {state ? (
                          <StatePill label={state} kind={stateKind(row)} />
                        ) : (
                          <span className="text-sm text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {activeGraha && (
          <PlanetDetailSheet
            chart={chart}
            graha={activeGraha}
            onClose={() => onSelectGraha(activeGraha)}
            className="lg:sticky lg:top-20"
          />
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Accordion
          title="Chalit · bhava madhya"
          open={open.chalit}
          onToggle={() => toggle('chalit')}
        >
          <ul className="space-y-2">
            {rows
              .filter((r) => r.graha)
              .map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-surface-sunken/30 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-ink">{r.label}</span>
                  <span className="font-mono text-muted">
                    bh {r.bhava} · {r.rashiEnglish}
                  </span>
                </li>
              ))}
          </ul>
        </Accordion>

        <Accordion title="Maitri" open={open.maitri} onToggle={() => toggle('maitri')}>
          <ul className="space-y-2">
            {(['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa'] as GrahaCode[]).map((code) => {
              const friends = GRAHA_FRIENDS[code] ?? []
              return (
                <li key={code} className="rounded-xl border border-border/50 bg-surface-sunken/30 px-3 py-2">
                  <p className="text-sm font-semibold text-ink">{GRAHAS[code].name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    Friends:{' '}
                    {friends.map((f) => GRAHAS[f as GrahaCode]?.name ?? f).join(', ') || '—'}
                  </p>
                </li>
              )
            })}
          </ul>
          <div className="mt-3">
            <PlanetaryRelationship
              drishti={chart.drishti}
              activeGraha={activeGraha}
              onSelect={onSelectGraha}
              tone="dark"
            />
          </div>
        </Accordion>

        <Accordion title="Upagraha" open={open.upagraha} onToggle={() => toggle('upagraha')}>
          <p className="text-sm leading-relaxed text-muted text-pretty">
            Gulika, Mandi and other upagrahas will list here from the same birth frame — coming
            next beside these positions.
          </p>
        </Accordion>
      </div>
    </div>
  )
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-border/70 bg-surface shadow-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-ink">{title}</span>
        <ChevronDown
          className={cn('size-4 text-muted transition', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      {open && <div className="border-t border-border/50 px-4 py-3">{children}</div>}
    </div>
  )
}

function StatePill({ label, kind }: { label: string; kind: 'exalted' | 'combust' | 'retro' | 'other' }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold',
        kind === 'exalted' && 'bg-[#7c4dff]/20 text-[#c4a0ff]',
        kind === 'combust' && 'bg-[#3a7bd5]/20 text-[#5ed7f2]',
        kind === 'retro' && 'bg-[#7c4dff]/15 text-[#c4a0ff]',
        kind === 'other' && 'bg-surface-sunken text-muted',
      )}
    >
      {label}
    </span>
  )
}

function stateLabel(row: PlanetRow): string | null {
  if (row.motion === 'lagna') return null
  if (row.dignity === 'exalted') return 'Exalted'
  if (row.dignity === 'debilitated') return 'Debilitated'
  if (row.dignity === 'own') return 'Own sign'
  if (row.graha === 'Me' && row.degree < 8) return 'Combust'
  if (row.motion === 'retrograde') return `R. ${motionLabel(row.motion)}`
  return null
}

function stateKind(row: PlanetRow): 'exalted' | 'combust' | 'retro' | 'other' {
  if (row.dignity === 'exalted') return 'exalted'
  if (row.graha === 'Me' && row.degree < 8) return 'combust'
  if (row.motion === 'retrograde') return 'retro'
  return 'other'
}

function englishSign(name: string): string {
  return RASHIS.find((r) => r.name === name)?.english ?? name
}

function toRow(g: GrahaPosition): PlanetRow {
  return {
    id: g.graha,
    label: GRAHAS[g.graha].english,
    code: g.graha,
    graha: g.graha,
    rashi: g.rashi,
    rashiEnglish: englishSign(g.rashi),
    degree: g.degree,
    minute: g.minute,
    bhava: g.bhava,
    nakshatra: g.nakshatra.name,
    pada: g.nakshatra.pada,
    dignity: g.dignity,
    motion: g.motion,
  }
}
