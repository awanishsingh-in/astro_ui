import { useMemo, useState } from 'react'
import { DataTable, type DataColumn } from '@/components/common/DataTable'
import { DegreeValue } from '@/components/astrology/DegreeValue'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { PlanetaryRelationship } from '@/components/astrology/PlanetaryRelationship'
import { GRAHA_FRIENDS } from '@/data/kootas'
import type { Chart, Dignity, GrahaCode, GrahaPosition, Motion } from '@/types/astrology'
import {
  dignityLabel,
  dignityToneClass,
  GRAHAS,
  GRAHA_ORDER,
  motionLabel,
  rashiGlyph,
} from '@/utils/astro'
import { cn } from '@/utils/cn'

type PlanetsLens = 'positions' | 'chalit' | 'maitri'

const LENSES: { id: PlanetsLens; label: string }[] = [
  { id: 'positions', label: 'Positions' },
  { id: 'chalit', label: 'Chalit' },
  { id: 'maitri', label: 'Maitri' },
]

interface PlanetRow {
  id: string
  label: string
  graha?: GrahaCode
  rashi: string
  degree: number
  minute: number
  bhava: number
  nakshatra: string
  pada: number
  dignity: Dignity | 'lagna'
  motion: Motion | 'lagna'
}

export interface ChartPlanetsPanelProps {
  chart: Chart
  activeGraha: GrahaCode | null
  onSelectGraha: (graha: GrahaCode) => void
  className?: string
}

/**
 * Planets tab — Positions / Chalit / Maitri lenses on the birth chart.
 */
export function ChartPlanetsPanel({
  chart,
  activeGraha,
  onSelectGraha,
  className,
}: ChartPlanetsPanelProps) {
  const [lens, setLens] = useState<PlanetsLens>('positions')

  const rows = useMemo<PlanetRow[]>(() => {
    const lagna: PlanetRow = {
      id: 'La',
      label: 'Lagna',
      rashi: chart.lagna.rashi,
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
      if (!g) return null
      return toRow(g)
    }).filter(Boolean) as PlanetRow[]

    return [lagna, ...grahaRows]
  }, [chart])

  const columns: DataColumn<PlanetRow>[] = [
    {
      id: 'planet',
      header: 'Planet',
      render: (row) =>
        row.graha ? (
          <PlanetGlyph code={row.graha} withName size="sm" />
        ) : (
          <span className="font-medium text-ink">Lagna</span>
        ),
    },
    {
      id: 'sign',
      header: 'Sign',
      render: (row) => (
        <span className="whitespace-nowrap">
          <span aria-hidden className="mr-1.5 text-muted">
            {rashiGlyph(row.rashi as never)}
          </span>
          {row.rashi}
        </span>
      ),
    },
    {
      id: 'degree',
      header: 'Degree',
      align: 'right',
      render: (row) =>
        row.motion === 'lagna' ? (
          <span className="font-mono text-data">
            {String(row.degree).padStart(2, '0')}°{String(row.minute).padStart(2, '0')}′
          </span>
        ) : (
          <DegreeValue degree={row.degree} minute={row.minute} motion={row.motion} />
        ),
    },
    {
      id: 'house',
      header: 'House',
      align: 'right',
      render: (row) => <span className="font-mono text-data">{row.bhava}</span>,
    },
    {
      id: 'nakshatra',
      header: 'Nakshatra',
      hideBelow: 'md',
      render: (row) => (
        <span className="font-mono text-data text-purple">
          {row.nakshatra === '—' ? '—' : row.nakshatra}
        </span>
      ),
    },
    {
      id: 'pada',
      header: 'Pada',
      align: 'right',
      hideBelow: 'md',
      render: (row) => (
        <span className="font-mono text-data">{row.pada === 0 ? '—' : row.pada}</span>
      ),
    },
    {
      id: 'dignity',
      header: 'Dignity',
      hideBelow: 'lg',
      render: (row) =>
        row.dignity === 'lagna' ? (
          <span className="text-muted">—</span>
        ) : (
          <span className={cn('whitespace-nowrap', dignityToneClass(row.dignity))}>
            {dignityLabel(row.dignity)}
          </span>
        ),
    },
    {
      id: 'state',
      header: 'State',
      hideBelow: 'lg',
      render: (row) =>
        row.motion === 'lagna' ? (
          <span className="text-muted">Rising</span>
        ) : (
          <span className={cn(row.motion === 'retrograde' ? 'text-retrograde' : 'text-muted')}>
            {motionLabel(row.motion)}
          </span>
        ),
    },
  ]

  return (
    <div className={cn('animate-rise space-y-5', className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            Planets
          </p>
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Planets
          </h2>
          <p className="text-sm text-muted">
            {rows.length} rows · click a row to focus it
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Planet lenses"
          className="inline-flex rounded-full border border-border/80 bg-surface-sunken/40 p-1"
        >
          {LENSES.map((item) => {
            const active = item.id === lens
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setLens(item.id)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-sm transition',
                  active
                    ? 'bg-copper/20 font-semibold text-copper shadow-[inset_0_0_0_1px_rgba(196, 160, 255,0.45)]'
                    : 'font-medium text-muted hover:text-ink',
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      {lens === 'positions' && (
        <div className="overflow-hidden rounded-3xl border border-border/80 bg-surface/90 shadow-card">
          <div className="p-3 sm:p-4">
            <DataTable
              caption="Planetary positions"
              columns={columns}
              rows={rows}
              rowKey={(row) => row.id}
              onRowClick={(row) => {
                if (row.graha) onSelectGraha(row.graha)
              }}
              isRowActive={(row) => row.graha === activeGraha}
            />
          </div>
          <p className="border-t border-border/60 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-faint sm:px-5">
            Column headers sort · sticky on scroll
          </p>
        </div>
      )}

      {lens === 'chalit' && (
        <div className="overflow-hidden rounded-3xl border border-border/80 bg-surface/90 shadow-card">
          <div className="space-y-3 border-b border-border/60 px-4 py-3 sm:px-5">
            <p className="text-sm text-muted text-pretty">
              Chalit view — each graha against the house it occupies from the lagna (equal bhava).
            </p>
          </div>
          <div className="p-3 sm:p-4">
            <DataTable
              caption="Chalit house placements"
              columns={columns.filter((c) =>
                ['planet', 'sign', 'degree', 'house', 'nakshatra', 'state'].includes(c.id),
              )}
              rows={rows.filter((r) => r.graha)}
              rowKey={(row) => row.id}
              onRowClick={(row) => {
                if (row.graha) onSelectGraha(row.graha)
              }}
              isRowActive={(row) => row.graha === activeGraha}
            />
          </div>
        </div>
      )}

      {lens === 'maitri' && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-border/80 bg-surface/90 p-4 shadow-card sm:p-5">
            <p className="mb-4 text-sm text-muted text-pretty">
              Natural friendship among the seven graha rulers — tap a planet in the table to focus
              its sightlines below.
            </p>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa'] as GrahaCode[]).map((code) => {
                const friends = GRAHA_FRIENDS[code] ?? []
                const active = activeGraha === code
                return (
                  <li key={code}>
                    <button
                      type="button"
                      onClick={() => onSelectGraha(code)}
                      className={cn(
                        'flex w-full flex-col gap-2 rounded-2xl border px-3.5 py-3 text-left transition',
                        active
                          ? 'border-copper/55 bg-copper/12'
                          : 'border-border/80 bg-surface-sunken/30 hover:border-copper/35',
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <PlanetGlyph code={code} size="sm" />
                        <span className="text-sm font-semibold text-ink">{GRAHAS[code].name}</span>
                      </span>
                      <span className="text-xs text-muted text-pretty">
                        Friends:{' '}
                        {friends.map((f) => GRAHAS[f as GrahaCode]?.name ?? f).join(', ') || '—'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border/80 bg-surface/90 p-4 shadow-card sm:p-5">
            <div className="mx-auto w-full max-w-[420px] sm:max-w-[480px]">
              <PlanetaryRelationship
                drishti={chart.drishti}
                activeGraha={activeGraha}
                onSelect={onSelectGraha}
                tone="dark"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function toRow(g: GrahaPosition): PlanetRow {
  return {
    id: g.graha,
    label: GRAHAS[g.graha].name,
    graha: g.graha,
    rashi: g.rashi,
    degree: g.degree,
    minute: g.minute,
    bhava: g.bhava,
    nakshatra: g.nakshatra.name,
    pada: g.nakshatra.pada,
    dignity: g.dignity,
    motion: g.motion,
  }
}
