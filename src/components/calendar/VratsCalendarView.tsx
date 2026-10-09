import { Bell, CalendarPlus } from 'lucide-react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { useToast } from '@/components/feedback/toast-context'
import { VRAT_KIND_LABEL, nextVrats } from '@/data/calendar-catalog'
import type { VratEntry, VratKind } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { downloadVratCalendarIcs } from '@/utils/vrat-calendar'

const FILTERS: { id: 'all' | VratKind; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ekadashi', label: 'Ekadashi' },
  { id: 'pradosh', label: 'Pradosh' },
  { id: 'purnima', label: 'Purnima' },
  { id: 'amavasya', label: 'Amavasya' },
  { id: 'sankashti', label: 'Sankashti' },
]

const YEAR_OPTIONS = Array.from({ length: 21 }, (_, i) => 2016 + i)

const AREAS = [
  { id: 'north', label: 'North India' },
  { id: 'west', label: 'West India' },
  { id: 'south', label: 'South India' },
  { id: 'east', label: 'East India' },
] as const

const REGIONS = [
  { id: 'north-indian', label: 'North Indian', area: 'north' },
  { id: 'bengali', label: 'Bengali', area: 'east' },
  { id: 'maharashtrian', label: 'Maharashtrian', area: 'west' },
  { id: 'tamil', label: 'Tamil', area: 'south' },
  { id: 'telugu', label: 'Telugu', area: 'south' },
  { id: 'gujarati', label: 'Gujarati', area: 'west' },
] as const

export type VratAreaId = (typeof AREAS)[number]['id']
export type VratRegionId = (typeof REGIONS)[number]['id']

function formatListDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' })
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="group relative inline-flex items-center">
      <span
        className={cn(
          'relative inline-flex items-center rounded-full border border-border/80',
          'bg-surface px-3.5 py-1.5',
          'shadow-[0_0_0_1px_rgba(124,77,255,0.06)]',
          'transition group-hover:border-copper/45 group-hover:bg-copper/10',
        )}
      >
        <span className="pointer-events-none mr-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
          {label} ·
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className={cn(
            'appearance-none bg-transparent pr-5',
            'font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink',
            'outline-none',
          )}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.65em] text-copper"
        >
          ▾
        </span>
      </span>
    </label>
  )
}

export function VratsCalendarView({
  vrats,
  year,
  area,
  region,
  filter,
  selectedId,
  onYearChange,
  onAreaChange,
  onRegionChange,
  onFilter,
  onSelect,
  onRemind,
}: {
  vrats: VratEntry[]
  year: number
  area: VratAreaId
  region: VratRegionId
  filter: 'all' | VratKind
  selectedId: string | null
  onYearChange: (year: number) => void
  onAreaChange: (area: VratAreaId) => void
  onRegionChange: (region: VratRegionId) => void
  onFilter: (f: 'all' | VratKind) => void
  onSelect: (id: string) => void
  onRemind: (vrat: VratEntry) => void
}) {
  const toast = useToast()
  const filtered = filter === 'all' ? vrats : vrats.filter((v) => v.kind === filter)
  const selected = filtered.find((v) => v.id === selectedId) ?? filtered[0] ?? null
  const upcoming = nextVrats(`${year}-01-01`, 3)
  const yearChoices = YEAR_OPTIONS.includes(year)
    ? YEAR_OPTIONS
    : [...YEAR_OPTIONS, year].sort((a, b) => a - b)
  const areaMeta = AREAS.find((a) => a.id === area) ?? AREAS[0]
  const regionOptions = REGIONS.filter((r) => r.area === area)
  const regionMeta =
    regionOptions.find((r) => r.id === region) ?? regionOptions[0] ?? REGIONS[0]

  function addSelectedToCalendar() {
    if (!selected) return
    downloadVratCalendarIcs(
      [selected],
      `${selected.name.replace(/\s+/g, '-').toLowerCase()}.ics`,
      selected.name,
    )
    toast.success('Added to calendar', {
      description: `${selected.name} · ${formatListDate(selected.date)}. Open the file to save it.`,
    })
  }

  function syncAllToCalendar() {
    if (filtered.length === 0) {
      toast.info('No vrats to sync', { description: 'Try another filter or year.' })
      return
    }
    downloadVratCalendarIcs(
      filtered,
      `cyklos-vrats-${year}.ics`,
      `Cyklos vrats ${year}`,
    )
    toast.success('Vrats synced to calendar', {
      description: `${filtered.length} vrat${filtered.length === 1 ? '' : 's'} for ${year}. Open the .ics file in your calendar app.`,
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-7">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Year"
            value={String(year)}
            onChange={(value) => onYearChange(Number(value))}
            options={yearChoices.map((y) => ({ value: String(y), label: String(y) }))}
          />
          <FilterSelect
            label="Area"
            value={area}
            onChange={(value) => {
              const nextArea = value as VratAreaId
              onAreaChange(nextArea)
              const firstRegion = REGIONS.find((r) => r.area === nextArea)
              if (firstRegion) onRegionChange(firstRegion.id)
            }}
            options={AREAS.map((a) => ({ value: a.id, label: a.label }))}
          />
          <FilterSelect
            label="Region"
            value={regionMeta.id}
            onChange={(value) => onRegionChange(value as VratRegionId)}
            options={regionOptions.map((r) => ({ value: r.id, label: r.label }))}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilter(f.id)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                filter === f.id
                  ? 'border-copper/50 bg-copper/15 text-ink'
                  : 'border-border text-muted hover:text-ink',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
          Reading as {regionMeta.label} · {areaMeta.label}
        </p>

        <ul className="space-y-2.5">
          {filtered.map((vrat) => {
            const active = selected?.id === vrat.id
            return (
              <li key={vrat.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(vrat.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onSelect(vrat.id)
                    }
                  }}
                  className={cn(
                    'flex w-full flex-col gap-2.5 rounded-2xl border px-4 py-4 text-left transition-colors sm:flex-row sm:items-center sm:justify-between',
                    active
                      ? 'border-copper/45 bg-copper/12'
                      : 'border-border/80 bg-surface hover:bg-navy-soft/60',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-label uppercase text-faint">
                      {formatListDate(vrat.date)}
                    </span>
                    <span className="mt-0.5 block text-sub font-semibold text-ink">{vrat.name}</span>
                    <span className="mt-0.5 block text-xs text-muted">{vrat.hinduDate}</span>
                  </span>
                  <Badge tone="neutral" mono>
                    {VRAT_KIND_LABEL[vrat.kind]}
                  </Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full"
                    iconLeft={<Bell className="size-3.5" />}
                    onClick={(event) => {
                      event.stopPropagation()
                      onRemind(vrat)
                    }}
                  >
                    Remind me
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>

        <p className="font-mono text-label uppercase tracking-[0.1em] text-faint">
          Showing {filtered.length} of {vrats.length} vrats in {year} — free to browse
        </p>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6">
        {selected ? (
          <Card padding="lg" className="gap-4 border-border/80 bg-surface/90">
            <div>
              <h2 className="text-heading font-semibold text-ink">{selected.name}</h2>
              <p className="mt-1 text-sm text-muted">
                {formatListDate(selected.date)} · {selected.hinduDate}
              </p>
            </div>

            <dl className="space-y-2.5 border-y border-border/70 py-3">
              <DetailRow label="Ekadashi tithi" value={selected.tithiWindow} />
              <DetailRow label="Parana (breaking fast)" value={selected.parana} />
              <DetailRow label="Fast type" value={selected.fastType} />
            </dl>

            <section className="space-y-1.5">
              <h3 className="font-mono text-label uppercase text-gold-deep">What the fast involves</h3>
              <p className="text-sm text-purple text-pretty">{selected.involves}</p>
            </section>

            <section className="space-y-1.5">
              <h3 className="font-mono text-label uppercase text-gold-deep">Puja vidhi</h3>
              <p className="text-sm text-purple text-pretty">{selected.pujaVidhi}</p>
            </section>

            <div className="flex flex-col gap-2 pt-1">
              <Button
                variant="primary"
                size="sm"
                className="w-full rounded-full"
                iconLeft={<Bell className="size-3.5" />}
                onClick={() => onRemind(selected)}
              >
                Set a reminder
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full rounded-full"
                iconLeft={<CalendarPlus className="size-3.5" />}
                onClick={addSelectedToCalendar}
              >
                Add to Cal
              </Button>
              <p className="text-xs text-muted text-pretty">
                Downloads a calendar file for this vrat — open it in Google Calendar, Apple Calendar, or Outlook.
              </p>
            </div>
          </Card>
        ) : (
          <Card padding="lg">
            <p className="text-sm text-muted">Select a vrat to read the details.</p>
          </Card>
        )}

        <Card padding="md" className="gap-2 border-border/80">
          <p className="font-mono text-label uppercase text-gold-deep">Next 30 days</p>
          <ul className="space-y-1.5 text-sm text-ink">
            {upcoming.map((v) => (
              <li key={v.id}>
                {v.name} · {formatListDate(v.date)}
              </li>
            ))}
          </ul>
          <Button
            variant="primary"
            size="sm"
            className="mt-2 w-full rounded-full"
            iconLeft={<CalendarPlus className="size-3.5" />}
            onClick={syncAllToCalendar}
          >
            Sync all vrats to my calendar
          </Button>
          <p className="font-mono text-[10px] uppercase text-faint">
            Downloads .ics for all listed vrats — stays on Calendar
          </p>
        </Card>
      </aside>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
      <dt className="font-mono text-label uppercase text-faint">{label}</dt>
      <dd className="text-sm text-ink text-pretty sm:text-right">{value}</dd>
    </div>
  )
}
