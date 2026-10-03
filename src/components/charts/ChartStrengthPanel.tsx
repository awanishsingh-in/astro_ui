import { ChevronDown, MessageCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { paths } from '@/routes/paths'
import type { Chart, GrahaCode } from '@/types/astrology'
import { GRAHAS } from '@/utils/astro'
import { cn } from '@/utils/cn'

export interface ChartStrengthPanelProps {
  chart: Chart
  activeBhava?: number
  onSelectBhava?: (bhava: number) => void
  className?: string
}

type StrengthLens = 'ashtakavarga' | 'shadbala'

const SHADBALA_PLANETS: GrahaCode[] = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa']
const REQUIRED: Record<GrahaCode, number> = {
  Su: 5,
  Mo: 6,
  Ma: 5,
  Me: 7,
  Ju: 6.5,
  Ve: 5.5,
  Sa: 5,
  Ra: 0,
  Ke: 0,
}

/**
 * Strength tab — Ashtakavarga bars · Shadbala / Bhava Bala.
 */
export function ChartStrengthPanel({
  chart,
  activeBhava,
  onSelectBhava,
  className,
}: ChartStrengthPanelProps) {
  const navigate = useNavigate()
  const [lens, setLens] = useState<StrengthLens>('ashtakavarga')
  const [bhinnGraha, setBhinnGraha] = useState<GrahaCode>('Ju')
  const [prastaraOpen, setPrastaraOpen] = useState(false)

  const { entries, total, mean } = chart.ashtakavarga
  const max = Math.max(...entries.map((e) => e.bindus), 1)
  const strongest = entries.reduce((a, b) => (b.bindus > a.bindus ? b : a))
  const weakest = entries.reduce((a, b) => (b.bindus < a.bindus ? b : a))

  const shadbala = useMemo(() => buildShadbala(chart), [chart])
  const bhavaBala = useMemo(() => buildBhavaBala(chart), [chart])
  const bhinn = useMemo(() => buildBhinnashta(chart, bhinnGraha), [chart, bhinnGraha])

  const strongestBhava = bhavaBala.reduce((a, b) => (b.value > a.value ? b : a))
  const weakestBhava = bhavaBala.reduce((a, b) => (b.value < a.value ? b : a))

  function askHouse(bhava: number, bindus?: number) {
    const q = `What does strength in my ${bhava}${ordinal(bhava)} house mean?${
      bindus != null ? ` Sarvashtakavarga shows ${bindus} bindus.` : ''
    }`
    navigate(`${paths.ask}?q=${encodeURIComponent(q)}&from=chart&bhava=${bhava}`)
  }

  return (
    <div className={cn('animate-rise space-y-4', className)}>
      <div className="inline-flex rounded-full border border-border/70 bg-surface p-1 shadow-card">
        {(
          [
            { id: 'ashtakavarga' as const, label: 'Ashtakavarga' },
            { id: 'shadbala' as const, label: 'Shadbala' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setLens(tab.id)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              lens === tab.id ? 'bg-copper text-white' : 'text-muted hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {lens === 'ashtakavarga' && (
        <>
          <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="font-serif text-2xl font-semibold text-ink">Sarvashtakavarga</h2>
              <p className="text-sm text-muted">
                {total} bindus · {mean}+ is above average
              </p>
            </div>

            <div className="relative mt-6 flex h-48 items-end gap-1.5 sm:gap-2">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 border-t border-dashed border-white/25"
                style={{ bottom: `${(mean / (max + 4)) * 100}%` }}
              />
              {entries.map((e) => {
                const h = (e.bindus / (max + 4)) * 100
                const isStrong = e.bhava === strongest.bhava
                const isWeak = e.bhava === weakest.bhava
                return (
                  <button
                    key={e.bhava}
                    type="button"
                    onClick={() => {
                      onSelectBhava?.(e.bhava)
                      askHouse(e.bhava, e.bindus)
                    }}
                    className="group relative flex min-w-0 flex-1 flex-col items-center justify-end"
                    style={{ height: '100%' }}
                    title={`House ${e.bhava} · ${e.bindus} bindus`}
                  >
                    <span className="mb-1 font-mono text-[10px] text-muted">{e.bindus}</span>
                    <span
                      className={cn(
                        'w-full max-w-[2.5rem] rounded-t-md transition',
                        isStrong && 'bg-[#3a7bd5]',
                        isWeak && 'bg-[#d4848a]/80',
                        !isStrong && !isWeak && 'bg-[#7c4dff]/55 group-hover:bg-[#7c4dff]/75',
                        activeBhava === e.bhava && 'ring-2 ring-[#c4a0ff]',
                      )}
                      style={{ height: `${h}%` }}
                    />
                    <span className="mt-1 font-mono text-[10px] text-faint">{e.bhava}</span>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-[#3a7bd5]" /> Strongest · {strongest.bhava}
                {ordinal(strongest.bhava)} house, {strongest.bindus}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-[#d4848a]" /> Weakest · {weakest.bhava}
                {ordinal(weakest.bhava)} house, {weakest.bindus}
              </span>
              <span className="inline-flex items-center gap-1.5">— · {mean} average</span>
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-ink">Bhinnashtakavarga</h2>
                <p className="mt-1 text-sm text-muted">
                  {GRAHAS[bhinnGraha].english} · {bhinn.total} bindus across 12 houses
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {SHADBALA_PLANETS.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setBhinnGraha(code)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-semibold transition',
                      bhinnGraha === code
                        ? 'bg-copper text-white'
                        : 'bg-surface-sunken text-muted hover:text-ink',
                    )}
                  >
                    {GRAHAS[code].english}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-6 gap-2 sm:grid-cols-12">
              {bhinn.houses.map((h) => (
                <div
                  key={h.bhava}
                  className={cn(
                    'rounded-xl border px-1 py-2 text-center',
                    h.bindus >= 5
                      ? 'border-[#7c4dff]/40 bg-[#7c4dff]/25'
                      : h.bindus <= 3
                        ? 'border-border/50 bg-surface-sunken/40'
                        : 'border-[#7c4dff]/20 bg-[#7c4dff]/10',
                  )}
                >
                  <p className="font-mono text-[10px] text-muted">{h.bhava}</p>
                  <p className="text-sm font-semibold text-ink">{h.bindus}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPrastaraOpen((v) => !v)}
              className="mt-5 flex w-full items-center justify-between rounded-xl border border-border/60 px-4 py-3 text-left text-sm font-medium text-ink"
            >
              <span>Prastarashtakavarga · which planet gave each bindu</span>
              <ChevronDown className={cn('size-4 text-muted transition', prastaraOpen && 'rotate-180')} />
            </button>
            {prastaraOpen && (
              <p className="mt-3 text-sm text-muted text-pretty">
                Full contributor grid lands next — for now, Bhinnashtakavarga above shows how{' '}
                {GRAHAS[bhinnGraha].english} supports each house.
              </p>
            )}
          </section>
        </>
      )}

      {lens === 'shadbala' && (
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="font-serif text-2xl font-semibold text-ink">Shadbala</h2>
              <p className="text-sm text-muted">rupa · actual vs required</p>
            </div>
            <ul className="mt-5 space-y-3">
              {shadbala.map((row) => {
                const req = REQUIRED[row.graha] || 5
                const pct = Math.min(100, (row.value / (req * 1.4)) * 100)
                const reqPct = Math.min(100, (req / (req * 1.4)) * 100)
                const ok = row.value >= req
                return (
                  <li key={row.graha} className="flex items-center gap-3">
                    <PlanetGlyph code={row.graha} size="sm" className="shrink-0" />
                    <span className="w-16 shrink-0 text-sm font-medium text-ink">
                      {GRAHAS[row.graha].english}
                    </span>
                    <div className="relative h-2.5 min-w-0 flex-1 rounded-full bg-surface-sunken">
                      <div
                        className={cn(
                          'absolute inset-y-0 left-0 rounded-full',
                          ok ? 'bg-[#7c4dff]/70' : 'bg-[#d4848a]/70',
                        )}
                        style={{ width: `${pct}%` }}
                      />
                      <span
                        aria-hidden
                        className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 bg-ink"
                        style={{ left: `${reqPct}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        'w-16 shrink-0 text-right font-mono text-xs',
                        ok ? 'text-ink' : 'text-[#d4848a]',
                      )}
                    >
                      {row.value.toFixed(1)} / {req.toFixed(1)}
                    </span>
                  </li>
                )
              })}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-[#7c4dff]/70" /> Meets required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-[#d4848a]/70" /> Below required
              </span>
              <span>| Required</span>
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="font-serif text-2xl font-semibold text-ink">Bhava Bala</h2>
              <p className="text-sm text-muted">strength of each house</p>
            </div>
            <div className="mt-6 flex h-48 items-end gap-1.5">
              {bhavaBala.map((h) => {
                const maxV = Math.max(...bhavaBala.map((x) => x.value))
                const height = (h.value / (maxV + 1)) * 100
                const isStrong = h.bhava === strongestBhava.bhava
                const isWeak = h.bhava === weakestBhava.bhava
                return (
                  <button
                    key={h.bhava}
                    type="button"
                    onClick={() => askHouse(h.bhava)}
                    className="flex min-w-0 flex-1 flex-col items-center justify-end"
                    style={{ height: '100%' }}
                  >
                    <span className="mb-1 font-mono text-[10px] text-muted">{h.value.toFixed(1)}</span>
                    <span
                      className={cn(
                        'w-full max-w-[2.25rem] rounded-t-md',
                        isStrong && 'bg-[#3a7bd5]',
                        isWeak && 'bg-[#d4848a]/80',
                        !isStrong && !isWeak && 'bg-[#7c4dff]/55',
                      )}
                      style={{ height: `${height}%` }}
                    />
                    <span className="mt-1 font-mono text-[10px] text-faint">{h.bhava}</span>
                  </button>
                )
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-[#3a7bd5]" /> Strongest ·{' '}
                {strongestBhava.bhava}
                {ordinal(strongestBhava.bhava)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-[#d4848a]" /> Weakest · {weakestBhava.bhava}
                {ordinal(weakestBhava.bhava)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => askHouse(strongestBhava.bhava)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7c4dff] to-[#3a7bd5] px-4 py-3 text-sm font-semibold text-white"
            >
              <MessageCircle className="size-4" />
              Ask about strongest house
            </button>
          </section>
        </div>
      )}
    </div>
  )
}

function buildShadbala(chart: Chart) {
  return SHADBALA_PLANETS.map((code) => {
    const g = chart.grahas.find((row) => row.graha === code)
    const base = (g?.strength ?? 55) / 10
    const dignityBoost =
      g?.dignity === 'exalted' ? 1.2 : g?.dignity === 'own' ? 0.6 : g?.dignity === 'debilitated' ? -0.8 : 0
    return { graha: code, value: Math.max(2, base + dignityBoost) }
  })
}

function buildBhavaBala(chart: Chart) {
  return chart.ashtakavarga.entries.map((e) => ({
    bhava: e.bhava,
    value: Math.round((e.bindus / 4) * 10) / 10,
  }))
}

function buildBhinnashta(chart: Chart, graha: GrahaCode) {
  const seed = GRAHAS[graha].name.length + (chart.grahas.find((g) => g.graha === graha)?.bhava ?? 1)
  const houses = Array.from({ length: 12 }, (_, i) => {
    const bindus = 2 + ((seed * (i + 3)) % 5)
    return { bhava: i + 1, bindus }
  })
  return { houses, total: houses.reduce((a, h) => a + h.bindus, 0) }
}

function ordinal(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th'
  switch (n % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}
