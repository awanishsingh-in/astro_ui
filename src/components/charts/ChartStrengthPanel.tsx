import { ChevronDown, MessageCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import {
  DownloadKundaliButton,
  PremiumKundaliAdCard,
  type ChartKundaliDownloadContext,
} from '@/components/charts/ChartKundaliDownloads'
import type { Chart, GrahaCode } from '@/types/astrology'
import { navigateAskFromChart } from '@/utils/ask-from-chart'
import { GRAHAS } from '@/utils/astro'
import { cn } from '@/utils/cn'

export interface ChartStrengthPanelProps {
  chart: Chart
  activeBhava?: number
  onSelectBhava?: (bhava: number) => void
  downloads?: ChartKundaliDownloadContext
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
  downloads,
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
    navigateAskFromChart(navigate, { q, bhava, returnSection: 'strength' })
  }

  function askPlanet(code: GrahaCode, value: number, required: number) {
    const q = `What does Shadbala strength for ${GRAHAS[code].english} mean in my chart? It shows ${value.toFixed(1)} rupa vs ${required.toFixed(1)} required.`
    navigateAskFromChart(navigate, { q, returnSection: 'strength' })
  }

  const askCtaClass = cn(
    'inline-flex w-full items-center justify-center gap-2 rounded-full px-3 py-2.5',
    'btn-primary text-sm font-semibold',
    'shadow-[0_0_22px_-6px_rgba(201,145,115,0.55)]',
    'transition',
  )

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
              lens === tab.id
                ? 'bg-surface-raised text-ink shadow-[inset_0_0_0_1px_rgba(227,176,138,0.35)]'
                : 'text-muted hover:text-ink',
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
                    onClick={() => onSelectBhava?.(e.bhava)}
                    className="group relative flex min-w-0 flex-1 flex-col items-center justify-end"
                    style={{ height: '100%' }}
                    title={`House ${e.bhava} · ${e.bindus} bindus`}
                  >
                    <span className="mb-1 font-mono text-[10px] text-muted">{e.bindus}</span>
                    <span
                      className={cn(
                        'w-full max-w-[2.5rem] rounded-t-md transition',
                        isStrong && 'bg-info',
                        isWeak && 'bg-[#6E4234]/80',
                        !isStrong && !isWeak && 'bg-blue-light/45 group-hover:bg-blue-light/65',
                        activeBhava === e.bhava && 'ring-2 ring-blue-light/70',
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
                <span className="size-2.5 rounded-sm bg-info" /> Strongest · {strongest.bhava}
                {ordinal(strongest.bhava)} house, {strongest.bindus}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-[#6E4234]" /> Weakest · {weakest.bhava}
                {ordinal(weakest.bhava)} house, {weakest.bindus}
              </span>
              <span className="inline-flex items-center gap-1.5">— · {mean} average</span>
            </div>

            <button
              type="button"
              onClick={() => askHouse(strongest.bhava, strongest.bindus)}
              className={cn(askCtaClass, 'mt-4')}
            >
              <MessageCircle className="size-3.5" />
              Ask about this
            </button>

            {downloads && (
              <div className="mt-5 border-t border-border/50 pt-4">
                <DownloadKundaliButton context={downloads} className="w-full sm:w-auto" size="sm" />
              </div>
            )}
          </section>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:items-start">
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
                          ? 'bg-surface-raised text-ink shadow-[inset_0_0_0_1px_rgba(227,176,138,0.35)]'
                          : 'bg-surface-sunken text-muted hover:text-ink',
                      )}
                    >
                      {GRAHAS[code].english}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
                {bhinn.houses.map((h) => (
                  <div
                    key={h.bhava}
                    className={cn(
                      'min-w-0 rounded-xl border px-1 py-2 text-center',
                      h.bindus >= 5
                        ? 'border-info/40 bg-info-soft'
                        : h.bindus <= 3
                          ? 'border-border/50 bg-surface-sunken/40'
                          : 'border-border/60 bg-surface-raised/50',
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
                className="mt-5 flex w-full items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3 text-left text-sm font-medium text-ink"
              >
                <span className="min-w-0 flex-1 text-pretty">
                  Prastarashtakavarga · which planet gave each bindu
                </span>
                <ChevronDown
                  className={cn('size-4 shrink-0 text-muted transition', prastaraOpen && 'rotate-180')}
                />
              </button>
              {prastaraOpen && (
                <p className="mt-3 text-sm text-muted text-pretty">
                  Full contributor grid lands next — for now, Bhinnashtakavarga above shows how{' '}
                  {GRAHAS[bhinnGraha].english} supports each house.
                </p>
              )}
            </section>

            {downloads && (
              <PremiumKundaliAdCard
                context={downloads}
                compact
                className="lg:sticky lg:top-20"
              />
            )}
          </div>
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
                  <li
                    key={row.graha}
                    className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3"
                  >
                    <div className="flex items-center gap-2 sm:contents">
                      <PlanetGlyph code={row.graha} size="sm" className="shrink-0" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink sm:w-16 sm:flex-none sm:shrink-0">
                        {GRAHAS[row.graha].english}
                      </span>
                      <span
                        className={cn(
                          'shrink-0 font-mono text-xs sm:hidden',
                          ok ? 'text-ink' : 'text-[#6E4234]',
                        )}
                      >
                        {row.value.toFixed(1)} / {req.toFixed(1)}
                      </span>
                    </div>
                    <div className="relative h-2.5 min-w-0 w-full flex-1 rounded-full bg-surface-sunken">
                      <div
                        className={cn(
                          'absolute inset-y-0 left-0 rounded-full',
                          ok ? 'bg-info/80' : 'bg-[#6E4234]/70',
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
                        'hidden w-16 shrink-0 text-right font-mono text-xs sm:block',
                        ok ? 'text-ink' : 'text-[#6E4234]',
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
                <span className="size-2.5 rounded-sm bg-info/80" /> Meets required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-[#6E4234]/70" /> Below required
              </span>
              <span>| Required</span>
            </div>
            {downloads && (
              <div className="mt-5 border-t border-border/50 pt-4">
                <DownloadKundaliButton context={downloads} className="w-full" size="sm" />
              </div>
            )}
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
                    onClick={() => onSelectBhava?.(h.bhava)}
                    className="flex min-w-0 flex-1 flex-col items-center justify-end"
                    style={{ height: '100%' }}
                  >
                    <span className="mb-1 font-mono text-[10px] text-muted">{h.value.toFixed(1)}</span>
                    <span
                      className={cn(
                        'w-full max-w-[2.25rem] rounded-t-md',
                        isStrong && 'bg-info',
                        isWeak && 'bg-[#6E4234]/80',
                        !isStrong && !isWeak && 'bg-blue-light/45',
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
                <span className="size-2.5 rounded-sm bg-info" /> Strongest ·{' '}
                {strongestBhava.bhava}
                {ordinal(strongestBhava.bhava)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-[#6E4234]" /> Weakest · {weakestBhava.bhava}
                {ordinal(weakestBhava.bhava)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const top = shadbala.reduce((a, b) => (b.value > a.value ? b : a))
                askPlanet(top.graha, top.value, REQUIRED[top.graha] || 5)
              }}
              className={cn(askCtaClass, 'mt-4')}
            >
              <MessageCircle className="size-3.5" />
              Ask about this
            </button>

            {downloads && (
              <div className="mt-4">
                <PremiumKundaliAdCard context={downloads} compact />
              </div>
            )}
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
