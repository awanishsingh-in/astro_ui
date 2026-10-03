import { ArrowLeft, Bell, ChevronRight, MessageCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { expandDashaChildren, type DashaSummary } from '@/data/dasha-mock'
import { paths } from '@/routes/paths'
import type { DashaLevel, DashaPeriod } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { formatDateShort } from '@/utils/format'

export interface ChartDashaPanelProps {
  dasha: DashaSummary
  className?: string
}

const DETAIL_TABS: { level: DashaLevel; label: string }[] = [
  { level: 'antar', label: 'Antar' },
  { level: 'pratyantar', label: 'Pratyantar' },
  { level: 'sookshma', label: 'Sookshma' },
  { level: 'prana', label: 'Prana' },
]

/**
 * Dasha tab — Vimshottari timeline · mahadasha list · nested period detail.
 */
export function ChartDashaPanel({ dasha, className }: ChartDashaPanelProps) {
  const navigate = useNavigate()
  const currentPath = useMemo(() => findPath(dasha.periods), [dasha.periods])
  const [selectedMaha, setSelectedMaha] = useState<DashaPeriod | null>(
    currentPath[0] ?? dasha.periods[0] ?? null,
  )
  const [detailLevel, setDetailLevel] = useState<DashaLevel>('antar')
  const [drill, setDrill] = useState<DashaPeriod[]>([])
  const [alertOn, setAlertOn] = useState(false)

  useEffect(() => {
    setSelectedMaha(currentPath[0] ?? dasha.periods[0] ?? null)
    setDrill([])
    setDetailLevel('antar')
  }, [currentPath, dasha.periods])

  const maha = selectedMaha ?? dasha.periods[0]
  const pathUnderMaha = useMemo(() => {
    if (!maha) return [] as DashaPeriod[]
    if (currentPath[0] && samePeriod(currentPath[0], maha)) return currentPath.slice(1)
    // Expand default chain under a non-current mahadasha
    const path: DashaPeriod[] = []
    let cursor: DashaPeriod | undefined = maha
    while (cursor) {
      const kids = expandDashaChildren(cursor)
      const next = kids.find((k) => k.current) ?? kids[0]
      if (!next) break
      path.push(next)
      cursor = next
    }
    return path
  }, [maha, currentPath])

  const detailList = useMemo(() => {
    if (!maha) return [] as DashaPeriod[]
    const levelIndex = DETAIL_TABS.findIndex((t) => t.level === detailLevel)
    if (levelIndex < 0) return []

    // Parent for this level = maha for antar, else drill/path ancestor
    let parent: DashaPeriod = maha
    for (let i = 0; i < levelIndex; i++) {
      const fromDrill = drill[i]
      const fromPath = pathUnderMaha[i]
      parent = fromDrill ?? fromPath ?? parent
      // If we only have maha, expand first child chain
      if (!fromDrill && !fromPath) {
        const kids = expandDashaChildren(parent)
        parent = kids.find((k) => k.current) ?? kids[0] ?? parent
      }
    }
    return expandDashaChildren(parent)
  }, [maha, detailLevel, drill, pathUnderMaha])

  const activeDetail =
    detailList.find((p) => p.current) ??
    drill[DETAIL_TABS.findIndex((t) => t.level === detailLevel)] ??
    detailList[0]

  const breadcrumb = useMemo(() => {
    const parts = [maha?.name].filter(Boolean) as string[]
    const levelIndex = DETAIL_TABS.findIndex((t) => t.level === detailLevel)
    for (let i = 0; i < levelIndex; i++) {
      const p = drill[i] ?? pathUnderMaha[i]
      if (p) parts.push(p.name)
    }
    if (activeDetail && levelIndex >= 0) {
      // show selected leaf in title as "Venus · Antardasha" style
    }
    return parts
  }, [maha, detailLevel, drill, pathUnderMaha, activeDetail])

  const yearMarks = useMemo(() => timelineYears(dasha.periods), [dasha.periods])

  function selectMaha(period: DashaPeriod) {
    setSelectedMaha(period)
    setDrill([])
    setDetailLevel('antar')
  }

  function selectDetail(period: DashaPeriod) {
    const levelIndex = DETAIL_TABS.findIndex((t) => t.level === detailLevel)
    setDrill((prev) => {
      const next = prev.slice(0, levelIndex)
      next[levelIndex] = period
      return next
    })
    // Auto-advance to next tab when drilling deeper (except last)
    if (levelIndex < DETAIL_TABS.length - 1) {
      setDetailLevel(DETAIL_TABS[levelIndex + 1]!.level)
    }
  }

  function askAboutPeriod() {
    if (!maha) return
    const leaf = activeDetail ?? maha
    const q = `What does my ${maha.name} mahadasha${
      activeDetail && activeDetail.level !== 'maha' ? ` / ${breadcrumb.slice(1).concat(leaf.name).join(' / ')}` : ''
    } mean in my chart? Period ${formatDateShort(leaf.start)} – ${formatDateShort(leaf.end)}.`
    navigate(`${paths.ask}?q=${encodeURIComponent(q)}&from=chart`)
  }

  if (!maha) {
    return (
      <p className="rounded-3xl border border-border/70 bg-surface p-8 text-center text-muted">
        No dasha periods on this chart yet.
      </p>
    )
  }

  const detailTitle =
    detailLevel === 'antar'
      ? `${maha.name} · Antardasha`
      : `${breadcrumb.join(' › ')} · ${DETAIL_TABS.find((t) => t.level === detailLevel)?.label}`

  return (
    <div className={cn('animate-rise space-y-4', className)}>
      {/* Timeline card */}
      <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">
              Your Vimshottari timeline
            </h2>
            <p className="mt-1 text-sm text-muted">
              Nine Mahadashas from birth · click one to open it
            </p>
          </div>

          <label className="inline-flex max-w-xs cursor-pointer items-start gap-2.5 text-left">
            <span className="relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={alertOn}
                onChange={(e) => setAlertOn(e.target.checked)}
              />
              <span className="absolute inset-0 rounded-full bg-surface-sunken peer-checked:bg-[#7c4dff]/45" />
              <span className="absolute left-0.5 size-4 rounded-full bg-muted transition peer-checked:translate-x-4 peer-checked:bg-[#7c4dff]" />
            </span>
            <span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
                <Bell className="size-3.5 text-muted" aria-hidden />
                Alert me when a period changes
              </span>
              <span className="mt-0.5 block text-xs text-muted">
                {alertOn ? 'On' : 'Off'} · a quiet nudge, never a nag
              </span>
            </span>
          </label>
        </div>

        <div className="relative mt-6">
          {/* Today marker */}
          {(() => {
            const current = dasha.periods.find((p) => p.current)
            if (!current) return null
            const left = periodCenterPercent(dasha.periods, current)
            return (
              <div
                className="pointer-events-none absolute -top-5 z-10 -translate-x-1/2"
                style={{ left: `${left}%` }}
              >
                <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-canvas">
                  Today
                </span>
              </div>
            )
          })()}

          <div className="flex h-14 overflow-hidden rounded-xl border border-border/60">
            {dasha.periods.map((period) => {
              const selected = samePeriod(period, maha)
              const width = periodWidthPercent(dasha.periods, period)
              return (
                <button
                  key={`${period.name}-${period.start}`}
                  type="button"
                  title={`${period.name} · ${formatDateShort(period.start)} – ${formatDateShort(period.end)}`}
                  onClick={() => selectMaha(period)}
                  style={{ width: `${width}%` }}
                  className={cn(
                    'relative flex min-w-0 items-center justify-center border-r border-border/50 px-1 text-[11px] font-semibold transition last:border-r-0',
                    selected
                      ? 'bg-[#7c4dff]/35 text-ink ring-2 ring-inset ring-[#7c4dff]'
                      : period.current
                        ? 'bg-[#7c4dff]/18 text-ink'
                        : 'bg-[#7c4dff]/08 text-muted hover:bg-[#7c4dff]/14 hover:text-ink',
                  )}
                >
                  <span className="truncate">{period.name}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-faint">
            {yearMarks.map((y) => (
              <span key={y}>{y}</span>
            ))}
          </div>
        </div>
      </section>

      {/* List + detail */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] lg:items-start">
        <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface shadow-card">
          <header className="border-b border-border/50 px-4 py-3">
            <h3 className="text-sm font-semibold text-ink">Mahadasha</h3>
          </header>
          <ul className="divide-y divide-border/40">
            {dasha.periods.map((period) => {
              const selected = samePeriod(period, maha)
              return (
                <li key={`${period.name}-${period.start}`}>
                  <button
                    type="button"
                    onClick={() => selectMaha(period)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3.5 text-left transition',
                      selected ? 'bg-[#7c4dff]/12' : 'hover:bg-navy-soft/40',
                    )}
                  >
                    <PlanetGlyph code={period.graha} size="sm" className="shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-ink">{period.name}</span>
                        {period.current && <NowBadge />}
                      </span>
                      <span className="mt-0.5 block font-mono text-[11px] text-muted">
                        {formatDateShort(period.start)} – {formatDateShort(period.end)}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface shadow-card">
          <header className="flex items-start gap-2 border-b border-border/50 px-4 py-3 sm:px-5">
            {detailLevel !== 'antar' && (
              <button
                type="button"
                aria-label="Back a level"
                onClick={() => {
                  const idx = DETAIL_TABS.findIndex((t) => t.level === detailLevel)
                  if (idx > 0) {
                    setDetailLevel(DETAIL_TABS[idx - 1]!.level)
                    setDrill((prev) => prev.slice(0, idx - 1))
                  }
                }}
                className="mt-0.5 inline-flex size-8 items-center justify-center rounded-full border border-border/70 text-muted hover:bg-navy-soft hover:text-ink"
              >
                <ArrowLeft className="size-3.5" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-xl font-semibold text-ink">{detailTitle}</h3>
              {activeDetail && (
                <p className="mt-0.5 font-mono text-[11px] text-muted">
                  {formatDateShort(activeDetail.start)} – {formatDateShort(activeDetail.end)}
                </p>
              )}
            </div>
          </header>

          <div
            role="tablist"
            aria-label="Dasha level"
            className="flex gap-1 overflow-x-auto border-b border-border/50 px-3 pt-2 sm:px-4"
          >
            {DETAIL_TABS.map((tab) => {
              const active = tab.level === detailLevel
              return (
                <button
                  key={tab.level}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setDetailLevel(tab.level)}
                  className={cn(
                    'shrink-0 px-3 py-2 text-sm font-medium transition',
                    active
                      ? 'border-b-2 border-ink text-ink'
                      : 'border-b-2 border-transparent text-muted hover:text-ink',
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          <ul className="max-h-[22rem] divide-y divide-border/40 overflow-y-auto">
            {detailList.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted">No sub-periods here</li>
            ) : (
              detailList.map((period) => {
                const active = activeDetail ? samePeriod(period, activeDetail) : false
                return (
                  <li key={`${period.name}-${period.start}-${period.level}`}>
                    <button
                      type="button"
                      onClick={() => selectDetail(period)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-3.5 text-left transition sm:px-5',
                        active ? 'bg-[#7c4dff]/14' : 'hover:bg-navy-soft/40',
                      )}
                    >
                      <PlanetGlyph code={period.graha} size="sm" className="shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-ink">{period.name}</span>
                          {period.current && <NowBadge />}
                        </span>
                        <span className="mt-0.5 block font-mono text-[11px] text-muted">
                          {formatDateShort(period.start)} – {formatDateShort(period.end)}
                        </span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                    </button>
                  </li>
                )
              })
            )}
          </ul>

          <div className="border-t border-border/50 p-4 sm:px-5">
            <button
              type="button"
              onClick={askAboutPeriod}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7c4dff] to-[#3a7bd5] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(124,77,255,0.7)] transition hover:from-[#8b5cff] hover:to-[#4a8be5]"
            >
              <MessageCircle className="size-4" aria-hidden />
              Ask about this period
            </button>
          </div>
        </section>
      </div>

      <p className="px-1 text-sm text-muted text-pretty">
        Counted from Chandra in {dasha.enteredAt.name} pada {dasha.enteredAt.pada}. Its lord opens
        the sequence — the first mahadasha begins before birth; only the balance is lived.
      </p>
    </div>
  )
}

function NowBadge() {
  return (
    <span className="rounded-full bg-[#7c4dff] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
      Now
    </span>
  )
}

function samePeriod(a: DashaPeriod, b: DashaPeriod) {
  return a.name === b.name && a.start === b.start && a.level === b.level
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

function periodWidthPercent(periods: DashaPeriod[], period: DashaPeriod): number {
  const spans = periods.map((p) => Math.max(1, Date.parse(p.end) - Date.parse(p.start)))
  const total = spans.reduce((a, b) => a + b, 0) || 1
  const idx = periods.findIndex((p) => samePeriod(p, period))
  return ((spans[idx] ?? 1) / total) * 100
}

function periodCenterPercent(periods: DashaPeriod[], period: DashaPeriod): number {
  let before = 0
  const spans = periods.map((p) => Math.max(1, Date.parse(p.end) - Date.parse(p.start)))
  const total = spans.reduce((a, b) => a + b, 0) || 1
  for (let i = 0; i < periods.length; i++) {
    const p = periods[i]!
    const w = spans[i]!
    if (samePeriod(p, period)) {
      // Place "Today" near the end of the current block (demo)
      return ((before + w * 0.85) / total) * 100
    }
    before += w
  }
  return 50
}

function timelineYears(periods: DashaPeriod[]): number[] {
  if (periods.length === 0) return []
  const start = new Date(periods[0]!.start).getFullYear()
  const end = new Date(periods[periods.length - 1]!.end).getFullYear()
  const marks = [start]
  const mid = [0.25, 0.5, 0.75].map((t) => Math.round(start + (end - start) * t))
  for (const y of mid) {
    if (y > start && y < end && !marks.includes(y)) marks.push(y)
  }
  marks.push(end)
  return marks
}
