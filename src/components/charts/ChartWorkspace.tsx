import { ChevronLeft, ChevronRight, Download, Maximize2, MessageCircle } from 'lucide-react'
import { useMemo, useState, type RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChartDiamond } from '@/components/charts/ChartDiamond'
import { ChartEastDiamond } from '@/components/charts/ChartEastDiamond'
import { ChartSouthGrid } from '@/components/charts/ChartSouthGrid'
import { Button } from '@/components/common/Button'
import { PremiumKundaliAdCard } from '@/components/charts/ChartKundaliDownloads'
import { Modal } from '@/components/modals/Modal'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import { useToast } from '@/components/feedback/toast-context'
import { vargaLabel } from '@/components/charts/VargaSelector'
import { buildChartBasicsBundle } from '@/data/chart-basics'
import { vargas } from '@/data/vargas'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { paths } from '@/routes/paths'
import type { Chart, ChartStyle, GrahaCode, VargaCode } from '@/types/astrology'
import type { BirthDetails } from '@/types/user'
import { GRAHAS, RASHIS, rashiIndex } from '@/utils/astro'
import { triggerBasicKundaliDownload } from '@/utils/chart-kundali-download'
import { cn } from '@/utils/cn'

/** Quick rail — D1 / D2 only; full list opens from All. */
const VARGA_RAIL: VargaCode[] = ['D1', 'D2']

const SORTED_VARGAS = [...vargas].sort(
  (a, b) => Number(a.code.slice(1)) - Number(b.code.slice(1)),
)

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
  profileName: string
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
  profileName,
  varga,
  onVargaChange,
  activeBhava,
  onBhavaClick,
  chartFrameRef,
  detailUnlocked,
  onGetDetail,
  className,
}: ChartWorkspaceProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const vargaPicker = useDisclosure()
  const isDesktop = useIsDesktop()
  const vargaMeta = vargas.find((v) => v.code === varga)
  const { birth, avakhada } = buildChartBasicsBundle(chart, birthDetails)
  const [chartStyle, setChartStyle] = useState<ChartStyle>('north')
  const [ayanamsa, setAyanamsa] = useState('Lahiri')

  function chooseVarga(code: VargaCode) {
    onVargaChange(code)
    vargaPicker.close()
  }

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
        ? 'No planets in this house.'
        : `Planets here: ${occupants.map((o) => (o.note ? `${o.name} (${o.note})` : o.name)).join(', ')}.`
    const q = [
      `What does my ${houseNumber}${ordinal(houseNumber)} house (${BHAVA_SANSKRIT[houseNumber]} · ${rashiEnglish}) mean?`,
      `Lord is ${lordEnglish} in the ${house.lordSitsIn}${ordinal(house.lordSitsIn)} (${lordRashiEnglish}).`,
      planetLine,
    ].join(' ')
    navigate(`${paths.ask}?q=${encodeURIComponent(q)}&from=chart&bhava=${houseNumber}`)
  }

  function downloadBasicKundali() {
    triggerBasicKundaliDownload({ chart, profileName, birthDetails, ayanamsa })
    toast.success('Kundali downloaded', {
      description: 'Basic chart summary saved to your device.',
    })
  }

  return (
    <div
      className={cn(
        'animate-rise grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-stretch',
        className,
      )}
    >
      {/* Lagna chart column */}
      <div className="flex flex-col gap-3">
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

          <div className="flex min-w-0 items-center gap-2">
            <div
              className="inline-flex max-w-[min(100%,22rem)] items-center gap-0.5 overflow-x-auto rounded-full border border-border/70 bg-surface-sunken/40 p-0.5 scrollbar-none sm:max-w-none"
              role="tablist"
              aria-label="Divisional chart"
            >
              {VARGA_RAIL.map((code) => {
                const active = varga === code
                return (
                  <button
                    key={code}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => onVargaChange(code)}
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-1.5 font-mono text-xs font-semibold transition',
                      active
                        ? 'bg-copper text-white shadow-sm'
                        : 'text-muted hover:text-ink',
                    )}
                  >
                    {code}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={vargaPicker.open}
                aria-haspopup="dialog"
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-1.5 text-xs font-semibold transition',
                  !VARGA_RAIL.includes(varga)
                    ? 'bg-copper text-white shadow-sm'
                    : 'text-muted hover:bg-copper/15 hover:text-copper',
                )}
              >
                All
              </button>
            </div>
            <button
              type="button"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 text-muted transition hover:bg-navy-soft hover:text-ink"
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

      <Button
        variant="secondary"
        size="md"
        className="w-full rounded-2xl"
        iconLeft={<Download className="size-4" />}
        onClick={downloadBasicKundali}
      >
        Download Kundali
      </Button>
      </div>

      {/* Right column */}
      <div className="flex h-full flex-col gap-4">
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
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-copper/90 px-3 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_-14px_rgba(124,77,255,0.65)] transition hover:bg-copper"
            >
              <MessageCircle className="size-3.5" aria-hidden />
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

        <div className="mt-auto">
          <PremiumKundaliAdCard
            context={{
              chart,
              profileName,
              birthDetails,
              detailUnlocked,
              onGetDetail,
              ayanamsa,
            }}
          />
        </div>

        <p className="px-1 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
          Lagna {chart.lagna.rashi} · sign {rashiIndex(chart.lagna.rashi)}
        </p>
      </div>

      {isDesktop ? (
        <Modal
          isOpen={vargaPicker.isOpen}
          onClose={vargaPicker.close}
          title="All divisional charts"
          description="Pick any of the sixteen Vargas — D1 first, then the finer divisions."
          size="lg"
          className="max-w-3xl"
        >
          <VargaPickerGrid value={varga} onSelect={chooseVarga} />
        </Modal>
      ) : (
        <BottomSheet
          isOpen={vargaPicker.isOpen}
          onClose={vargaPicker.close}
          title="All divisional charts"
          description="Pick any of the sixteen Vargas — D1 first, then the finer divisions."
        >
          <VargaPickerGrid value={varga} onSelect={chooseVarga} />
        </BottomSheet>
      )}
    </div>
  )
}

function VargaPickerGrid({
  value,
  onSelect,
}: {
  value: VargaCode
  onSelect: (code: VargaCode) => void
}) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5" aria-label="Divisional charts">
      {SORTED_VARGAS.map((item) => {
        const active = item.code === value
        return (
          <li key={item.code}>
            <button
              type="button"
              onClick={() => onSelect(item.code)}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'flex h-full min-h-[4.75rem] w-full flex-col items-start gap-1 rounded-2xl border p-3 text-left',
                'transition-[border-color,background-color,transform] duration-150 ease-out-soft',
                'active:scale-[0.99]',
                active
                  ? 'border-copper/55 bg-copper/12'
                  : 'border-border bg-surface hover:border-border-strong hover:bg-navy-soft',
              )}
            >
              <span className="flex w-full items-start justify-between gap-2">
                <span className="font-mono text-sm font-semibold text-ink">
                  {item.code} · {item.name}
                </span>
                {active && (
                  <span className="shrink-0 font-mono text-[10px] uppercase text-copper">On</span>
                )}
              </span>
              <span className="line-clamp-2 text-xs leading-snug text-muted text-pretty">
                {item.signifies}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
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
