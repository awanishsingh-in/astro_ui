import { Bell, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { expandDashaChildren, type DashaSummary } from '@/data/dasha-mock'
import type { DashaLevel, DashaPeriod } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { formatDateShort } from '@/utils/format'

export interface ChartDashaPanelProps {
  dasha: DashaSummary
  className?: string
}

const COLUMNS: {
  level: DashaLevel
  title: string
  under: (names: string[]) => string
}[] = [
  { level: 'maha', title: 'Mahadasha', under: () => '120-year cycle' },
  { level: 'antar', title: 'Antardasha', under: (n) => (n[0] ? `under ${n[0]}` : '—') },
  { level: 'pratyantar', title: 'Pratyantar', under: (n) => (n[1] ? `under ${n[1]}` : '—') },
  { level: 'sookshma', title: 'Sookshma', under: (n) => (n[2] ? `under ${n[2]}` : '—') },
  {
    level: 'prana',
    title: 'Prana',
    under: (n) => (n[3] ? `under ${n[3]} · last level` : 'last level'),
  },
]

/**
 * Dasha tab — running-now banner + five Vimshottari columns.
 */
export function ChartDashaPanel({ dasha, className }: ChartDashaPanelProps) {
  const currentPath = useMemo(() => findPath(dasha.periods), [dasha.periods])
  const [selected, setSelected] = useState<DashaPeriod[]>(currentPath)
  const [alertOn, setAlertOn] = useState(false)

  useEffect(() => {
    setSelected(currentPath)
  }, [currentPath])

  const columns = useMemo(() => {
    const lists: DashaPeriod[][] = []
    let source: DashaPeriod[] = dasha.periods

    for (let i = 0; i < COLUMNS.length; i++) {
      lists.push(source)
      const pick = selected[i]
      if (!pick) {
        while (lists.length < COLUMNS.length) lists.push([])
        break
      }
      const children = expandDashaChildren(pick)
      source = children
    }

    return lists
  }, [dasha.periods, selected])

  function selectAt(levelIndex: number, period: DashaPeriod) {
    setSelected((prev) => {
      const next = prev.slice(0, levelIndex)
      next[levelIndex] = period
      // Prefer the current child chain under this pick when available.
      let cursor: DashaPeriod | undefined = period
      while (cursor) {
        const kids = expandDashaChildren(cursor)
        const currentKid = kids.find((k) => k.current) ?? kids[0]
        if (!currentKid) break
        next.push(currentKid)
        cursor = currentKid
      }
      return next.slice(0, COLUMNS.length)
    })
  }

  function jumpToToday() {
    setSelected(currentPath)
  }

  const pathLabel = selected.map((p) => p.name).filter(Boolean).join(' / ')
  const antar = selected.find((p) => p.level === 'antar') ?? currentPath.find((p) => p.level === 'antar')
  const progressPct = Math.round(dasha.progress * 100)

  return (
    <div className={cn('animate-rise space-y-5', className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            Dasha
          </p>
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Dasha
          </h2>
          <p className="text-sm text-muted">Vimshottari · five levels</p>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-border/80 bg-surface/80 px-3 py-2 text-sm text-ink">
          <span className="relative inline-flex h-5 w-9 items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={alertOn}
              onChange={(e) => setAlertOn(e.target.checked)}
            />
            <span className="absolute inset-0 rounded-full bg-surface-sunken peer-checked:bg-copper/40" />
            <span className="absolute left-0.5 size-4 rounded-full bg-muted transition peer-checked:translate-x-4 peer-checked:bg-copper" />
          </span>
          <Bell className="size-3.5 text-muted" aria-hidden />
          Alert me when a period changes
        </label>
      </div>

      <article className="overflow-hidden rounded-3xl border border-copper/35 bg-copper/10 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
              Running now
            </p>
            <p className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {(pathLabel || dasha.path).replace(/ — /g, ' / ')}
            </p>
            <div className="max-w-md space-y-1.5">
              <div className="h-1.5 overflow-hidden rounded-full bg-surface/60">
                <div
                  className="h-full rounded-full bg-copper"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-muted">
                {progressPct}% through the Antardasha
                {antar ? ` · ${formatDateShort(antar.start)} → ends ${formatDateShort(antar.end)}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={jumpToToday}
            className="rounded-full border border-copper/45 bg-surface/80 px-3.5 py-2 text-sm font-medium text-copper transition hover:bg-copper/15"
          >
            Jump to today
          </button>
        </div>
      </article>

      <div className="overflow-x-auto rounded-3xl border border-border/80 bg-surface/90 shadow-card">
        <div className="grid min-w-[56rem] grid-cols-5 divide-x divide-border/70">
          {COLUMNS.map((col, index) => {
            const list = columns[index] ?? []
            const activeId = selected[index]
              ? `${selected[index].name}-${selected[index].start}`
              : null
            const names = selected.map((p) => p.name)

            return (
              <section key={col.level} className="min-w-0">
                <header className="border-b border-border/70 px-3 py-3">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                    {col.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">{col.under(names)}</p>
                </header>
                <ul className="max-h-[28rem] overflow-y-auto p-2">
                  {list.length === 0 ? (
                    <li className="px-2 py-4 text-xs text-muted">Select a parent period</li>
                  ) : (
                    list.map((period) => {
                      const id = `${period.name}-${period.start}`
                      const active = id === activeId
                      return (
                        <li key={id}>
                          <button
                            type="button"
                            onClick={() => selectAt(index, period)}
                            className={cn(
                              'flex w-full items-center gap-2 rounded-xl px-2.5 py-2.5 text-left transition',
                              active
                                ? 'bg-copper/15 text-ink'
                                : 'hover:bg-navy-soft/60',
                              period.current && !active && 'bg-surface-sunken/50',
                            )}
                          >
                            <PlanetGlyph code={period.graha} size="sm" className="shrink-0" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-ink">
                                {period.name}
                              </span>
                              <span className="block truncate font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                                {formatDateShort(period.start)} – {formatDateShort(period.end)}
                              </span>
                            </span>
                            {index < COLUMNS.length - 1 && (
                              <ChevronRight className="size-3.5 shrink-0 text-muted" aria-hidden />
                            )}
                          </button>
                        </li>
                      )
                    })
                  )}
                </ul>
              </section>
            )
          })}
        </div>
      </div>

      <p className="text-sm text-muted text-pretty">
        Counted from Chandra in {dasha.enteredAt.name} pada {dasha.enteredAt.pada}. Its lord opens
        the sequence — the first mahadasha begins before birth; only the balance is lived.
      </p>
    </div>
  )
}

function findPath(periods: DashaPeriod[]): DashaPeriod[] {
  const path: DashaPeriod[] = []
  let list: DashaPeriod[] | undefined = periods
  while (list?.length) {
    const current = list.find((p) => p.current)
    if (!current) break
    path.push(current)
    list = expandDashaChildren(current)
  }
  return path
}
