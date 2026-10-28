import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  MessageCircle,
  Minimize2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ChartDiamond } from '@/components/charts/ChartDiamond'
import { ChartEastDiamond } from '@/components/charts/ChartEastDiamond'
import { ChartSouthGrid } from '@/components/charts/ChartSouthGrid'
import { PlanetDetailSheet } from '@/components/charts/PlanetDetailSheet'
import { Button } from '@/components/common/Button'
import { PremiumKundaliAdCard } from '@/components/charts/ChartKundaliDownloads'
import { CelestialBackground } from '@/components/celestial/CelestialBackground'
import { Modal } from '@/components/modals/Modal'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import { useToast } from '@/components/feedback/toast-context'
import { vargaLabel } from '@/components/charts/VargaSelector'
import { buildChartBasicsBundle } from '@/data/chart-basics'
import { vargas } from '@/data/vargas'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { navigateAskFromChart } from '@/utils/ask-from-chart'
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
  onGrahaClick: (graha: GrahaCode) => void
  onClearSelection: () => void
  chartFrameRef: RefObject<HTMLDivElement | null>
  detailUnlocked: boolean
  onGetDetail: () => void
  className?: string
}

/**
 * Chart tab — cosmic lagna stage · house / planet insight · birth facts.
 */
export function ChartWorkspace({
  chart,
  birthDetails,
  profileName,
  varga,
  onVargaChange,
  activeBhava,
  onBhavaClick,
  activeGraha,
  onGrahaClick,
  onClearSelection,
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
  const [fullscreen, setFullscreen] = useState(false)
  const [factsOpen, setFactsOpen] = useState(false)
  const [chartKey, setChartKey] = useState(0)

  useEffect(() => {
    setChartKey((k) => k + 1)
  }, [varga, chartStyle, chart.varga])

  useEffect(() => {
    if (!fullscreen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [fullscreen])

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
      code,
      name: GRAHAS[code].english,
      note: g?.motion === 'retrograde' ? 'R' : null,
    }
  })

  const styleLabel =
    chartStyle === 'north' ? 'North Indian' : chartStyle === 'south' ? 'South Indian' : 'East Indian'

  const railIndex = VARGA_RAIL.includes(varga) ? VARGA_RAIL.indexOf(varga) : 2

  function stepHouse(delta: number) {
    onClearSelection()
    const next = ((((houseNumber - 1 + delta) % 12) + 12) % 12) + 1
    onBhavaClick(next)
  }

  function handleBhavaClick(bhava: number) {
    onClearSelection()
    onBhavaClick(bhava)
  }

  function handleGrahaClick(graha: GrahaCode) {
    onGrahaClick(graha)
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
    navigateAskFromChart(navigate, { q, bhava: houseNumber, returnSection: 'chart' })
  }

  function downloadBasicKundali() {
    triggerBasicKundaliDownload({ chart, profileName, birthDetails, ayanamsa })
    toast.success('Kundali downloaded', {
      description: 'Saved to your device and Download history.',
    })
  }

  const chartNode = (
    <>
      {chartStyle === 'north' && (
        <ChartDiamond
          key={`n-${chartKey}`}
          chart={chart}
          tone="surface"
          animateReveal
          activeBhava={houseNumber}
          activeGraha={activeGraha}
          onBhavaClick={handleBhavaClick}
          onGrahaClick={handleGrahaClick}
          className="mx-auto w-full max-w-[520px] transition-opacity duration-300"
        />
      )}
      {chartStyle === 'south' && (
        <ChartSouthGrid
          key={`s-${chartKey}`}
          chart={chart}
          tone="surface"
          activeBhava={houseNumber}
          onBhavaClick={handleBhavaClick}
          className="mx-auto w-full max-w-[520px] animate-[kundali-fade_500ms_var(--ease-out-soft)_both]"
        />
      )}
      {chartStyle === 'east' && (
        <ChartEastDiamond
          key={`e-${chartKey}`}
          chart={chart}
          tone="surface"
          activeBhava={houseNumber}
          onBhavaClick={handleBhavaClick}
          className="mx-auto w-full max-w-[520px] animate-[kundali-fade_500ms_var(--ease-out-soft)_both]"
        />
      )}
    </>
  )

  const vargaRail = (
    <div
      className="lagna-varga-tabs relative grid w-[9.75rem] grid-cols-3 items-center rounded-full border border-white/10 bg-black/25 p-0.5 backdrop-blur-sm"
      role="tablist"
      aria-label="Divisional chart"
    >
      <span
        aria-hidden
        className="lagna-varga-thumb pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-full bg-surface-raised shadow-[inset_0_0_0_1px_rgba(227,176,138,0.35)] transition-transform duration-300 ease-out-soft"
        style={{ transform: `translateX(${railIndex * 100}%)` }}
      />
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
              'relative z-10 rounded-full py-1.5 font-mono text-xs font-semibold transition-colors',
              active ? 'font-semibold text-text' : 'text-silver-400 hover:text-text',
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
        aria-selected={!VARGA_RAIL.includes(varga)}
        className={cn(
          'relative z-10 rounded-full py-1.5 text-xs font-semibold transition-colors',
          !VARGA_RAIL.includes(varga) ? 'font-semibold text-text' : 'text-silver-400 hover:text-text',
        )}
      >
        All
      </button>
    </div>
  )

  return (
    <div
      className={cn(
        'animate-rise grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-stretch',
        className,
      )}
    >
      <div className="flex flex-col gap-3">
        <CelestialBackground
          tone="midnight"
          motifs={['stars']}
          seed={`kundali-${profileName}`}
          className="lagna-chart-panel overflow-hidden rounded-[1.75rem] border border-border/70 shadow-card"
          contentClassName="relative"
        >
          <div
            aria-hidden
            className="kundali-nebula pointer-events-none absolute -inset-8 opacity-50"
            style={{
              background:
                'radial-gradient(55% 45% at 30% 20%,  rgba(140,47,99,0.32) 0%, transparent 70%), radial-gradient(40% 35% at 80% 70%,  rgba(184,50,122,0.22) 0%, transparent 65%)',
            }}
          />

          <header className="relative flex flex-wrap items-start justify-between gap-3 px-5 pb-2 pt-5 sm:px-6 sm:pt-6">
            <div className="min-w-0">
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
                Lagna chart
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {vargaLabel(varga)} · {vargaMeta?.name ?? 'Rasi'} · {styleLabel}
              </p>
            </div>

            <div className="flex min-w-0 items-center gap-2">
              {vargaRail}
              <button
                type="button"
                className="lagna-expand-btn inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/20 text-muted transition hover:border-white/30 hover:bg-surface-raised hover:text-ink"
                aria-label="Expand chart fullscreen"
                onClick={() => setFullscreen(true)}
              >
                <Maximize2 className="size-3.5" />
              </button>
            </div>
          </header>

          <div
            ref={chartFrameRef}
            className={cn('relative px-4 pb-3 sm:px-6', fullscreen && 'invisible')}
            aria-hidden={fullscreen || undefined}
          >
            {!fullscreen && chartNode}
          </div>

          <footer className="lagna-chart-footer relative flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
            <div className="min-w-0 flex-1">
              <p className="eyebrow font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
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
                        'lagna-style-btn flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition',
                        active
                          ? 'border-blue-light/40 bg-surface-raised text-ink shadow-[inset_0_0_0_1px_rgba(227,176,138,0.35)]'
                          : 'border-white/10 bg-black/20 text-muted hover:border-white/25 hover:text-ink',
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
              <span className="eyebrow font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Ayanamsa
              </span>
              <select
                value={ayanamsa}
                onChange={(e) => setAyanamsa(e.target.value)}
                className="lagna-ayanamsa mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-ink outline-none focus:border-blue-light/50"
              >
                <option>Lahiri</option>
                <option>Raman</option>
                <option>KP</option>
              </select>
            </label>
          </footer>
        </CelestialBackground>

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
        {activeGraha && isDesktop ? (
          <PlanetDetailSheet
            chart={chart}
            graha={activeGraha}
            onClose={onClearSelection}
            className="animate-[kundali-fade_280ms_var(--ease-out-soft)_both]"
          />
        ) : (
          house && (
            <article className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface px-5 py-5 shadow-card sm:px-6">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent"
              />
              <div className="relative flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => stepHouse(-1)}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 text-muted transition hover:bg-navy-soft hover:text-ink"
                  aria-label="Previous house"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <div className="min-w-0 flex-1 text-center">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
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

              <p className="relative mt-3 text-center text-sm text-muted text-pretty">
                {BHAVA_BLURB[houseNumber]}
              </p>

              <dl className="relative mt-5 space-y-3">
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
                  <dd className="mt-2 flex flex-wrap justify-center gap-1.5">
                    {occupants.length === 0 ? (
                      <span className="text-sm font-medium text-ink">None</span>
                    ) : (
                      occupants.map((o) => (
                        <button
                          key={o.code}
                          type="button"
                          onClick={() => handleGrahaClick(o.code)}
                          className={cn(
                            'btn-glass rounded-full px-2.5 py-1 text-xs font-semibold transition',
                            activeGraha === o.code
                              ? 'border-[rgba(243,217,196,0.55)] text-text'
                              : 'text-silver-400 hover:text-text',
                          )}
                        >
                          {o.note ? `${o.name} (${o.note})` : o.name}
                        </button>
                      ))
                    )}
                  </dd>
                </div>
              </dl>

              <Button
                type="button"
                variant="primary"
                size="md"
                fullWidth
                className="relative mt-4 rounded-xl"
                iconLeft={<MessageCircle className="size-3.5" aria-hidden />}
                onClick={askAboutHouse}
              >
                Ask about this house
              </Button>
            </article>
          )
        )}

        <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-surface shadow-card">
          <button
            type="button"
            onClick={() => setFactsOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-navy-soft/40"
            aria-expanded={factsOpen}
          >
            <span>
              <span className="block text-sm font-semibold text-ink">Chart information</span>
              <span className="mt-0.5 block text-xs text-text-secondary">
                Birth facts, avakhada · tap to {factsOpen ? 'hide' : 'expand'}
              </span>
            </span>
            <ChevronDown
              className={cn(
                'size-4 shrink-0 text-muted transition-transform duration-200',
                factsOpen && 'rotate-180 text-blue-light',
              )}
            />
          </button>
          {factsOpen && (
            <div className="animate-[kundali-fade_220ms_var(--ease-out-soft)_both] space-y-3 border-t border-border/50 p-3 sm:p-4">
              <div className="grid gap-3 sm:grid-cols-2">
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
            </div>
          )}
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

      {!isDesktop && activeGraha && (
        <BottomSheet
          isOpen
          onClose={onClearSelection}
          title={GRAHAS[activeGraha].english}
          description={`${GRAHAS[activeGraha].name} · placement in your chart`}
        >
          <PlanetDetailSheet
            chart={chart}
            graha={activeGraha}
            onClose={onClearSelection}
            className="rounded-none border-0 bg-transparent shadow-none"
          />
        </BottomSheet>
      )}

      {fullscreen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Fullscreen lagna chart"
            className="fixed inset-0 z-[80] flex flex-col bg-midnight animate-[kundali-fade_280ms_var(--ease-out-soft)_both]"
          >
            <CelestialBackground
              tone="midnight"
              motifs={['stars']}
              seed={`kundali-full-${profileName}`}
              className="flex min-h-0 flex-1 flex-col"
              contentClassName="relative flex min-h-0 flex-1 flex-col"
            >
              <div
                aria-hidden
                className="kundali-nebula pointer-events-none absolute -inset-10 opacity-70"
                style={{
                  background:
                    'radial-gradient(50% 40% at 40% 30%,  rgba(46,22,35,0.45) 0%, transparent 70%), radial-gradient(35% 30% at 70% 75%,  rgba(200,86,46,0.35) 0%, transparent 65%)',
                }}
              />
              <header className="relative flex items-center justify-between gap-3 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
                <div className="min-w-0">
                  <h2 className="font-serif text-xl font-semibold text-ink sm:text-2xl">
                    Lagna chart
                  </h2>
                  <p className="text-xs text-muted sm:text-sm">
                    {vargaLabel(varga)} · {styleLabel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {vargaRail}
                  <button
                    type="button"
                    onClick={() => setFullscreen(false)}
                    className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-ink transition hover:border-white/30 hover:bg-surface-raised"
                    aria-label="Close fullscreen"
                  >
                    <X className="size-4 sm:hidden" />
                    <Minimize2 className="hidden size-4 sm:block" />
                  </button>
                </div>
              </header>
              <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">
                <div className="w-full max-w-[min(92vw,640px)]">{chartNode}</div>
              </div>
            </CelestialBackground>
          </div>,
          document.body,
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
                  ? 'border-blue-light/40 bg-info-soft'
                  : 'border-border bg-surface hover:border-border-strong hover:bg-navy-soft',
              )}
            >
              <span className="flex w-full items-start justify-between gap-2">
                <span className="font-mono text-sm font-semibold text-ink">
                  {item.code} · {item.name}
                </span>
                {active && (
                  <span className="shrink-0 font-mono text-[10px] uppercase text-blue-light">On</span>
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
    <article className="overflow-hidden rounded-[1.25rem] border border-border/60 bg-surface-sunken/30">
      <header className="border-b border-border/40 px-3.5 py-2.5">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </header>
      <dl className="divide-y divide-border/30 px-3.5 py-1">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-3 py-2">
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
    <article className="overflow-hidden rounded-[1.25rem] border border-border/60 bg-surface-sunken/30">
      <header className="border-b border-border/40 px-3.5 py-2.5">
        <h3 className="text-sm font-semibold text-ink">Avakhada</h3>
      </header>
      <ul className="flex flex-wrap gap-2 p-3.5">
        {rows.map(([label, value]) => (
          <li
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface/50 px-3 py-1.5 text-xs"
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
  if (!sunrise || sunrise === '—') return '—'
  return '7:07 PM'
}
