import { ArrowUpRight, ChevronRight, MessageCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DownloadKundaliButton,
  PremiumKundaliAdCard,
  type ChartKundaliDownloadContext,
} from '@/components/charts/ChartKundaliDownloads'
import {
  buildYogaDoshaBundle,
  type ChartDoshaCard,
  type ChartYogaItem,
  type DoshaSeverity,
} from '@/data/yoga-dosha-mock'
import { paths } from '@/routes/paths'
import type { Chart } from '@/types/astrology'
import { cn } from '@/utils/cn'

export interface ChartYogaDoshaPanelProps {
  chart: Chart
  downloads?: ChartKundaliDownloadContext
  className?: string
}

/**
 * Yoga & Dosha tab — dosha check strip + yoga list / detail (reference layout).
 */
export function ChartYogaDoshaPanel({ chart, downloads, className }: ChartYogaDoshaPanelProps) {
  const navigate = useNavigate()
  const bundle = useMemo(() => buildYogaDoshaBundle(chart), [chart])
  const [selectedYogaId, setSelectedYogaId] = useState(bundle.yogas[0]?.id ?? '')
  const [severityOverrides, setSeverityOverrides] = useState<Record<string, DoshaSeverity>>({})

  useEffect(() => {
    setSelectedYogaId(bundle.yogas[0]?.id ?? '')
    setSeverityOverrides({})
  }, [bundle])

  const selected =
    bundle.yogas.find((y) => y.id === selectedYogaId) ?? bundle.yogas[0] ?? null

  function askYoga(yoga: ChartYogaItem) {
    navigate(`${paths.ask}?q=${encodeURIComponent(yoga.askPrompt)}&from=chart`)
  }

  function askDosha(dosha: ChartDoshaCard) {
    navigate(`${paths.ask}?q=${encodeURIComponent(dosha.askPrompt)}&from=chart`)
  }

  return (
    <div className={cn('animate-rise space-y-8', className)}>
      {/* Dosha check */}
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
            Dosha check
          </h2>
          <p className="text-sm text-muted">
            {bundle.doshaPresent} present · {bundle.doshaAbsent} not present
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {bundle.doshas.map((dosha) => {
            const severity = severityOverrides[dosha.id] ?? dosha.severity
            return (
              <article
                key={dosha.id}
                className="flex flex-col rounded-[1.35rem] border border-border/70 bg-surface p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-lg font-semibold text-ink">{dosha.title}</h3>
                  <StatusBadge status={dosha.status} label={dosha.statusLabel} />
                </div>

                <div className="mt-3 inline-flex rounded-full border border-border/60 bg-surface-sunken/40 p-0.5">
                  {dosha.severities.map((opt) => {
                    const active = severity === opt
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setSeverityOverrides((prev) => ({ ...prev, [dosha.id]: opt }))
                        }
                        className={cn(
                          'rounded-full px-2.5 py-1 text-[11px] font-semibold transition',
                          active
                            ? 'bg-copper text-white shadow-sm'
                            : 'text-muted hover:text-ink',
                        )}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>

                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted text-pretty">
                  {dosha.rule}
                </p>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => askDosha(dosha)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-copper hover:underline"
                  >
                    {dosha.remediesHint}
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Yogas */}
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
            Yogas in your chart
          </h2>
          <p className="text-sm text-muted">{bundle.yogas.length} found</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)] lg:items-start">
          <div className="flex flex-col gap-3">
            <ul className="flex flex-col gap-2">
              {bundle.yogas.map((yoga) => {
                const active = selected?.id === yoga.id
                return (
                  <li key={yoga.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedYogaId(yoga.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition',
                        active
                          ? 'border-copper bg-copper text-white shadow-[0_12px_28px_-16px_rgba(124,77,255,0.65)]'
                          : 'border-border/70 bg-surface text-ink hover:border-copper/40 hover:bg-copper/5',
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-serif text-lg font-semibold">{yoga.name}</span>
                        <span
                          className={cn(
                            'mt-0.5 block text-sm',
                            active ? 'text-white/75' : 'text-muted',
                          )}
                        >
                          {yoga.subtitle}
                        </span>
                      </span>
                      <ChevronRight
                        className={cn('size-4 shrink-0', active ? 'text-white/80' : 'text-muted')}
                        aria-hidden
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
            {downloads && (
              <DownloadKundaliButton context={downloads} className="w-full" size="sm" />
            )}
          </div>

          {selected && (
            <div className="space-y-3">
              <article className="rounded-[1.75rem] border border-border/70 bg-surface p-5 shadow-card sm:p-6">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-copper">
                  {selected.family}
                </p>
                <h3 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink">
                  {selected.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted text-pretty sm:text-body">
                  {selected.description}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-surface-sunken/35 px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                      {selected.fromLabel}
                    </p>
                    <p className="text-sm font-semibold text-ink">{selected.fromDetail}</p>
                  </div>
                  <span aria-hidden className="px-2 text-muted">
                    →
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                      {selected.toLabel}
                    </p>
                    <p className="text-sm font-semibold text-ink">{selected.toDetail}</p>
                  </div>
                </div>

                <p className="mt-4 text-xs text-faint">{selected.source}</p>

                <button
                  type="button"
                  onClick={() => askYoga(selected)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7c4dff] to-[#3a7bd5] px-3 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_-14px_rgba(124,77,255,0.65)] transition hover:from-[#8b5cff] hover:to-[#4a8be5]"
                >
                  <MessageCircle className="size-3.5" aria-hidden />
                  Ask about this yoga
                </button>
              </article>
              {downloads && (
                <PremiumKundaliAdCard context={downloads} compact className="lg:sticky lg:top-20" />
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function StatusBadge({
  status,
  label,
}: {
  status: ChartDoshaCard['status']
  label: string
}) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        status === 'present' && 'bg-[#7c4dff]/20 text-[#c4a0ff]',
        status === 'cancelled' && 'bg-positive/15 text-positive',
        status === 'absent' && 'bg-surface-sunken text-muted',
      )}
    >
      {label}
    </span>
  )
}
