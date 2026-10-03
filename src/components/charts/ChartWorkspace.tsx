import { ChevronLeft, ChevronRight, Maximize2, MessageCircle } from 'lucide-react'
import { useMemo, useState, type RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChartDiamond } from '@/components/charts/ChartDiamond'
import { ChartEastDiamond } from '@/components/charts/ChartEastDiamond'
import { ChartSouthGrid } from '@/components/charts/ChartSouthGrid'
import { vargaLabel } from '@/components/charts/VargaSelector'
import { buildChartBasicsBundle } from '@/data/chart-basics'
import { vargas } from '@/data/vargas'
import { paths } from '@/routes/paths'
import type { Chart, ChartStyle, GrahaCode, VargaCode } from '@/types/astrology'
import type { BirthDetails } from '@/types/user'
import { GRAHAS, RASHIS, rashiIndex } from '@/utils/astro'
import { cn } from '@/utils/cn'

const BHAVA_SANSKRIT: Record<number, string> = {
  1: 'Tanu',
  2: 'Dhana',
  3: 'Sahaja',
  4: 'Bandhu',
  5: 'Putra',
  6: 'Ari',
  7: 'Yuvati',
  8: 'Randhra',
  9: 'Dharma',
  10: 'Karma',
  11: 'Labha',
  12: 'Vyaya',
}

const BHAVA_BLURB: Record<number, string> = {
  1: 'Self, body and how you meet the world.',
  2: 'Wealth, speech and what you keep close.',
  3: 'Siblings, courage and short journeys.',
  4: 'Home, mother and the private ground you stand on.',
  5: 'Children, creativity and the mind’s play.',
  6: 'Difficulty, debt and daily contests.',
  7: 'Partnership and how you meet the other.',
  8: 'Change, depth and what transforms you.',
  9: 'Fortune, belief and longer journeys.',
  10: 'Career, status and how the world sees you.',
  11: 'Gains, allies and what arrives later.',
  12: 'Loss, rest and what you release.',
}

const CHART_STYLES: { id: ChartStyle; label: string; icon: string }[] = [
  { id: 'north', label: 'North Indian', icon: '◇' },
  { id: 'south', label: 'South Indian', icon: '▦' },
  { id: 'east', label: 'East Indian', icon: '◫' },
]

export interface ChartWorkspaceProps {
  chart: Chart
  birthDetails: BirthDetails
  varga: VargaCode
  onVargaChange: (varga: VargaCode) => void
  activeBhava?: number
  onBhavaClick: (bhava: number) => void
  activeGraha: GrahaCode | null
  onClearSelection: () => void
  chartFrameRef: RefObject<HTMLDivElement | null>
  detailUnlocked: boolean
  onGetDetail: () => void
  className?: string
}

/**
 * Chart tab — lagna card · house detail · birth / avakhada (reference layout).
 */
export function ChartWorkspace({
  chart,
  birthDetails,
  varga,
  onVargaChange,
  activeBhava,
  onBhavaClick,
  chartFrameRef,
  className,
}: ChartWorkspaceProps) {
  const navigate = useNavigate()
  const vargaMeta = vargas.find((v) => v.code === varga)
  const { birth, avakhada } = buildChartBasicsBundle(chart, birthDetails)
  const [chartStyle, setChartStyle] = useState<ChartStyle>('north')
  const [ayanamsa, setAyanamsa] = useState('Lahiri')

  const house = useMemo(() => {
    const n = activeBhava && activeBhava >= 1 && activeBhava <= 12 ? activeBhava : 1
    return chart.bhavas.find((b) => b.bhava === n) ?? chart.bhavas[0]
  }, [activeBhava, chart.bhavas])

  const houseNumber = house?.bhava ?? 1
  const rashiEnglish =
    RASHIS.find((r) => r.name === house?.rashi)?.english ?? house?.rashi ?? '—'
  const lordEnglish = house ? GRAHAS[house.lordCode].english : '—'
  const lordRashi = house
    ? chart.bhavas.find((b) => b.bhava === house.lordSitsIn)?.rashi
    : undefined
  const lordRashiEnglish = lordRashi
    ? (RASHIS.find((r) => r.name === lordRashi)?.english ?? lordRashi)
    : '—'

  const occupants = (house?.occupants ?? []).map((code) => {
    const g = chart.grahas.find((row) => row.graha === code)
    return {
      name: GRAHAS[code].english,
      note: g?.motion === 'retrograde' ? 'R' : null,
    }
  })

  const styleLabel =
    chartStyle === 'north' ? 'North Indian' : chartStyle === 'south' ? 'South Indian' : 'East Indian'

  function stepHouse(delta: number) {
    const next = ((((houseNumber - 1 + delta) % 12) + 12) % 12) + 1
    onBhavaClick(next)
  }

  function askAboutHouse() {
    if (!house) return
    const planetLine =
      occupants.length === 0
        ? 'No graha occupies this house.'
        : `Planets here: ${occupants.map((o) => (o.note ? `${o.name} (${o.note})` : o.name)).join(', ')}.`
    const q = [
      `What does house ${houseNumber} (${BHAVA_SANSKRIT[houseNumber]} bhava · ${rashiEnglish}) mean in my chart?`,
      `${BHAVA_BLURB[houseNumber]}`,
      `Lord ${lordEnglish} sits in my ${house.lordSitsIn}${ordinal(house.lordSitsIn)} (${lordRashiEnglish}).`,
      planetLine,
    ].join(' ')

    try {
      sessionStorage.setItem(
        'cyklos_ask_chart_context',
        JSON.stringify({
          bhava: houseNumber,
          sanskrit: BHAVA_SANSKRIT[houseNumber],
          rashi: house.rashi,
          rashiEnglish,
          lord: lordEnglish,
          lordBhava: house.lordSitsIn,
          lordRashiEnglish,
          planets: occupants.map((o) => o.name),
          blurb: BHAVA_BLURB[houseNumber],
          question: q,
        }),
      )
    } catch {
      /* private mode */
    }

    navigate(
      `${paths.ask}?q=${encodeURIComponent(q)}&from=chart&bhava=${houseNumber}`,
    )
  }

  return (
    <div
      className={cn(
        'animate-rise grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-start',
        className,
      )}
    >
      {/* Lagna chart card */}
      <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface shadow-card">
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pb-2 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
              Lagna chart
            </h2>
            <p className="mt-1 text-sm text-muted">
              {vargaLabel(varga)} · {vargaMeta?.name ?? 'Rasi'} · {styleLabel}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-full border border-border/70 bg-surface-sunken/40 p-0.5">
              {(
                [
                  { code: 'D1' as const, label: 'D1 · Rasi' },
                  { code: 'D9' as const, label: 'D9 · Navamsa' },
                ] as const
              ).map((opt) => {
                const active = varga === opt.code
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => onVargaChange(opt.code)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                      active
                        ? 'bg-copper text-white shadow-sm'
                        : 'text-muted hover:text-ink',
                    )}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-full border border-border/70 text-muted transition hover:bg-navy-soft hover:text-ink"
              aria-label="Expand chart"
              onClick={() =>
                chartFrameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            >
              <Maximize2 className="size-3.5" />
            </button>
          </div>
        </header>

        <div ref={chartFrameRef} className="px-4 pb-2 sm:px-6">
          {chartStyle === 'north' && (
            <ChartDiamond
              chart={chart}
              tone="surface"
              activeBhava={houseNumber}
              onBhavaClick={onBhavaClick}
              className="mx-auto w-full max-w-[520px]"
            />
          )}
          {chartStyle === 'south' && (
            <ChartSouthGrid
              chart={chart}
              tone="surface"
              activeBhava={houseNumber}
              onBhavaClick={onBhavaClick}
              className="mx-auto w-full max-w-[520px]"
            />
          )}
          {chartStyle === 'east' && (
            <ChartEastDiamond
              chart={chart}
              tone="surface"
              activeBhava={houseNumber}
              onBhavaClick={onBhavaClick}
              className="mx-auto w-full max-w-[520px]"
            />
          )}
        </div>

        <footer className="flex flex-col gap-3 border-t border-border/60 px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              Chart style
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {CHART_STYLES.map((style) => {
                const active = chartStyle === style.id
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setChartStyle(style.id)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition',
                      active
                        ? 'border-copper bg-copper/10 text-ink shadow-[inset_0_0_0_1px_rgba(124,77,255,0.35)]'
                        : 'border-border/70 bg-surface-sunken/30 text-muted hover:border-border-strong hover:text-ink',
                    )}
                  >
                    <span aria-hidden className="text-lg leading-none">
                      {style.icon}
                    </span>
                    <span className="text-[11px] font-medium leading-tight">{style.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <label className="block shrink-0 sm:w-40">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              Ayanamsa
            </span>
            <select
              value={ayanamsa}
              onChange={(e) => setAyanamsa(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border/70 bg-surface-sunken/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-copper"
            >
              <option>Lahiri</option>
              <option>Raman</option>
              <option>KP</option>
            </select>
          </label>
        </footer>
      </section>

      {/* Right column */}
      <div className="flex flex-col gap-4">
        {house && (
          <article className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface px-5 py-5 shadow-card sm:px-6">
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => stepHouse(-1)}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 text-muted transition hover:bg-navy-soft hover:text-ink"
                aria-label="Previous house"
              >
                <ChevronLeft className="size-4" />
              </button>
              <div className="min-w-0 flex-1 text-center">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-copper">
                  House {houseNumber} · {BHAVA_SANSKRIT[houseNumber]} bhava
                </p>
                <h3 className="mt-1 font-serif text-2xl font-semibold text-ink">{rashiEnglish}</h3>
              </div>
              <button
                type="button"
                onClick={() => stepHouse(1)}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 text-muted transition hover:bg-navy-soft hover:text-ink"
                aria-label="Next house"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <p className="mt-3 text-center text-sm text-muted text-pretty">
              {BHAVA_BLURB[houseNumber]}
            </p>

            <dl className="mt-5 space-y-3">
              <div className="rounded-2xl border border-border/60 bg-surface-sunken/35 px-4 py-3">
                <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Lord
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink text-pretty">
                  {lordEnglish}{' '}
                  <span className="font-normal text-muted">
                    (in your {house.lordSitsIn}
                    {ordinal(house.lordSitsIn)} · {lordRashiEnglish})
                  </span>
                </dd>
              </div>
              <div className="rounded-2xl border border-border/60 bg-surface-sunken/35 px-4 py-3">
                <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Planets here
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink text-pretty">
                  {occupants.length === 0
                    ? 'None'
                    : occupants.map((o) => (o.note ? `${o.name} (${o.note})` : o.name)).join(', ')}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={askAboutHouse}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-copper/90 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(124,77,255,0.7)] transition hover:bg-copper"
            >
              <MessageCircle className="size-4" aria-hidden />
              Ask about this house
            </button>
          </article>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FactCard
            title="At your birth"
            rows={[
              ['Tithi', birth.tithi],
              ['Yoga', birth.yoga],
              ['Karana', birth.karana],
              ['Weekday', birth.weekday],
              ['Sunrise – Sunset', `${birth.sunrise} – ${sunsetFromSunrise(birth.sunrise)}`],
              ['Ayanamsa', birth.ayanamsa],
            ]}
          />
          <AvakhadaCard
            rows={[
              ['Varna', avakhada.varna],
              ['Vashya', avakhada.vashya],
              ['Yoni', avakhada.yoni],
              ['Gana', avakhada.gana],
              ['Nadi', avakhada.nadi],
            ]}
          />
        </div>

        <p className="px-1 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
          Lagna {chart.lagna.rashi} · sign {rashiIndex(chart.lagna.rashi)}
        </p>
      </div>
    </div>
  )
}

function FactCard({
  title,
  rows,
}: {
  title: string
  rows: [string, string][]
}) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-surface shadow-card">
      <header className="border-b border-border/50 px-4 py-3">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </header>
      <dl className="divide-y divide-border/40 px-4 py-1">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-3 py-2.5">
            <dt className="shrink-0 text-xs text-muted">{label}</dt>
            <dd className="text-right text-sm font-medium text-ink text-pretty">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}

function AvakhadaCard({ rows }: { rows: [string, string][] }) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-surface shadow-card">
      <header className="border-b border-border/50 px-4 py-3">
        <h3 className="text-sm font-semibold text-ink">Avakhada</h3>
      </header>
      <ul className="flex flex-wrap gap-2 p-4">
        {rows.map(([label, value]) => (
          <li
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface-sunken/40 px-3 py-1.5 text-xs"
          >
            <span className="text-muted">{label}</span>
            <span className="font-semibold text-ink">{value}</span>
          </li>
        ))}
      </ul>
    </article>
  )
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

/** Rough complementary sunset for the birth-facts card when only sunrise is mocked. */
function sunsetFromSunrise(sunrise: string): string {
  // birth.sunrise is already formatted 12h; show a stable companion for the layout.
  if (!sunrise || sunrise === '—') return '—'
  return '7:07 PM'
}
