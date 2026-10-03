import { useEffect, useMemo, useRef, useState } from 'react'
import { ChartDiamond } from '@/components/charts/ChartDiamond'
import { ChartEastDiamond } from '@/components/charts/ChartEastDiamond'
import { ChartSouthGrid } from '@/components/charts/ChartSouthGrid'
import { LoadingState } from '@/components/common/LoadingState'
import { vargas } from '@/data/vargas'
import { useAsync } from '@/hooks/useAsync'
import { getChart } from '@/services/chart.service'
import type { ChartStyle, GrahaCode, VargaCode } from '@/types/astrology'
import { GRAHAS, GRAHA_ORDER, RASHIS } from '@/utils/astro'
import { cn } from '@/utils/cn'

export interface ChartVargasPanelProps {
  seed: string
  varga: VargaCode
  onVargaChange: (varga: VargaCode) => void
  className?: string
}

/**
 * Vargas tab — 16 divisional list · selected chart · placements / vargottama.
 */
export function ChartVargasPanel({
  seed,
  varga,
  onVargaChange,
  className,
}: ChartVargasPanelProps) {
  const [style, setStyle] = useState<ChartStyle>('north')
  const d1State = useAsync((signal) => getChart(seed, 'D1', signal), [seed])
  const vargaState = useAsync((signal) => getChart(seed, varga, signal), [seed, varga])

  // Reference layout opens on Navamsa once; user can still pick D1 after.
  const didDefaultRef = useRef(false)
  useEffect(() => {
    if (didDefaultRef.current) return
    didDefaultRef.current = true
    if (varga === 'D1') onVargaChange('D9')
  }, [varga, onVargaChange])

  const meta = vargas.find((v) => v.code === varga)
  const d1 = d1State.data
  const chart = vargaState.data

  const vargottama = useMemo(() => {
    if (!d1 || !chart || varga === 'D1') return [] as { graha: GrahaCode; rashi: string }[]
    const hits: { graha: GrahaCode; rashi: string }[] = []
    for (const code of GRAHA_ORDER) {
      const a = d1.grahas.find((g) => g.graha === code)
      const b = chart.grahas.find((g) => g.graha === code)
      if (a && b && a.rashi === b.rashi) {
        hits.push({ graha: code, rashi: a.rashi })
      }
    }
    return hits
  }, [d1, chart, varga])

  const placements = useMemo(() => {
    if (!chart) return [] as { label: string; sign: string; highlight?: boolean }[]
    const lagna = {
      label: 'Lagna',
      sign: english(chart.lagna.rashi),
      highlight: false,
    }
    const grahas = GRAHA_ORDER.map((code) => {
      const g = chart.grahas.find((row) => row.graha === code)
      if (!g) return null
      return {
        label: GRAHAS[code].english,
        sign: english(g.rashi),
        highlight: vargottama.some((v) => v.graha === code),
      }
    }).filter(Boolean) as { label: string; sign: string; highlight?: boolean }[]
    return [lagna, ...grahas]
  }, [chart, vargottama])

  return (
    <div
      className={cn(
        'animate-rise grid gap-4 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)] lg:items-start',
        className,
      )}
    >
      <nav
        aria-label="16 divisional charts"
        className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-surface shadow-card"
      >
        <p className="border-b border-border/50 px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          16 divisional charts
        </p>
        <ul className="max-h-[36rem] overflow-y-auto p-1.5">
          {vargas.map((item) => {
            const active = item.code === varga
            return (
              <li key={item.code}>
                <button
                  type="button"
                  onClick={() => onVargaChange(item.code)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-sm transition',
                    active
                      ? 'bg-copper font-semibold text-white'
                      : 'text-ink hover:bg-navy-soft/50',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex min-w-[2.25rem] justify-center rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold',
                      active ? 'bg-white/20 text-white' : 'bg-surface-sunken text-muted',
                    )}
                  >
                    {item.code}
                  </span>
                  <span className="truncate">{item.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface p-4 shadow-card sm:p-6">
        {vargaState.status === 'loading' || vargaState.status === 'idle' || !chart ? (
          <LoadingState label="Drawing the varga…" lines={5} />
        ) : (
          <>
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-copper">
                  {varga}
                </p>
                <h2 className="mt-1 font-serif text-3xl font-semibold text-ink">
                  {meta?.name ?? varga}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Governs {meta?.signifies ?? 'this division of the chart'}.
                </p>
              </div>
              <div className="inline-flex rounded-full border border-border/70 bg-surface-sunken/40 p-0.5">
                {(
                  [
                    { id: 'north' as const, label: 'North' },
                    { id: 'south' as const, label: 'South' },
                    { id: 'east' as const, label: 'East' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStyle(opt.id)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                      style === opt.id
                        ? 'bg-copper text-white'
                        : 'text-muted hover:text-ink',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </header>

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
              <div>
                {style === 'north' && (
                  <ChartDiamond chart={chart} tone="surface" className="mx-auto w-full max-w-[420px]" />
                )}
                {style === 'south' && (
                  <ChartSouthGrid chart={chart} tone="surface" className="mx-auto w-full max-w-[420px]" />
                )}
                {style === 'east' && (
                  <ChartEastDiamond chart={chart} tone="surface" className="mx-auto w-full max-w-[420px]" />
                )}
              </div>

              <div className="space-y-3">
                {vargottama.length > 0 && (
                  <div className="rounded-2xl border border-[#7c4dff]/35 bg-[#7c4dff]/12 px-4 py-3 text-sm text-ink">
                    <span className="mr-2 inline-block size-2 rounded-full bg-[#7c4dff]" aria-hidden />
                    Vargottama — same sign in D1 and this chart. Yours:{' '}
                    <strong>
                      {vargottama
                        .map((v) => `${GRAHAS[v.graha].english} in ${english(v.rashi)}`)
                        .join(', ')}
                      .
                    </strong>
                  </div>
                )}

                <div className="rounded-2xl border border-border/60 bg-surface-sunken/30 p-4">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Placements in {varga}
                  </p>
                  <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                    {placements.map((p) => (
                      <li key={p.label} className="flex justify-between gap-2 text-sm">
                        <span className="text-muted">{p.label}</span>
                        <span
                          className={cn(
                            'font-semibold',
                            p.highlight ? 'text-copper' : 'text-ink',
                          )}
                        >
                          {p.sign}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function english(name: string) {
  return RASHIS.find((r) => r.name === name)?.english ?? name
}
