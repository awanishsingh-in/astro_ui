import { Bell, Lock } from 'lucide-react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { VRAT_KIND_LABEL, nextVrats } from '@/data/calendar-catalog'
import { paths } from '@/routes/paths'
import type { VratEntry, VratKind } from '@/types/astrology'
import { cn } from '@/utils/cn'

const FILTERS: { id: 'all' | VratKind; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ekadashi', label: 'Ekadashi' },
  { id: 'pradosh', label: 'Pradosh' },
  { id: 'purnima', label: 'Purnima' },
  { id: 'amavasya', label: 'Amavasya' },
  { id: 'sankashti', label: 'Sankashti' },
]

function formatListDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' })
}

export function VratsCalendarView({
  vrats,
  year,
  filter,
  selectedId,
  onFilter,
  onSelect,
  onRemind,
}: {
  vrats: VratEntry[]
  year: number
  filter: 'all' | VratKind
  selectedId: string | null
  onFilter: (f: 'all' | VratKind) => void
  onSelect: (id: string) => void
  onRemind: (vrat: VratEntry) => void
}) {
  const filtered = filter === 'all' ? vrats : vrats.filter((v) => v.kind === filter)
  const selected = filtered.find((v) => v.id === selectedId) ?? filtered[0] ?? null
  const upcoming = nextVrats(`${year}-01-01`, 3)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-7">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-border/80 bg-surface px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            Year · {year}
          </span>
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
                to={`${paths.panchang}?tab=downloads`}
              >
                Add to Cal
              </Button>
              <p className="text-xs text-muted text-pretty">
                Reminder is free — needs an account. Reading stays open.
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
            to={`${paths.panchang}?tab=downloads`}
            iconLeft={<Lock className="size-3.5" />}
          >
            Sync all vrats to my calendar
          </Button>
          <p className="font-mono text-[10px] uppercase text-faint">
            Cal subscription — opens in Panchang downloads
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
