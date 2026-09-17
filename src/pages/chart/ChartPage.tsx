import { Crown, Download, Info } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { Skeleton } from '@/components/common/Skeleton'
import { Button } from '@/components/common/Button'
import { TabPanel, Tabs, useTabs } from '@/components/common/Tabs'
import { AshtakavargaGrid } from '@/components/astrology/AshtakavargaGrid'
import { BhavaTable } from '@/components/astrology/BhavaTable'
import { CalculationBasis } from '@/components/astrology/CalculationBasis'
import { DashaTimeline } from '@/components/astrology/DashaTimeline'
import { DrishtiPanel } from '@/components/astrology/DrishtiPanel'
import { GrahaTable } from '@/components/astrology/GrahaTable'
import { ReadingNotes } from '@/components/astrology/ReadingNotes'
import { ChatPaywall } from '@/components/ask/ChatPaywall'
import { ChartProfilePicker } from '@/components/charts/ChartProfilePicker'
import { ChartDiamond } from '@/components/charts/ChartDiamond'
import { VargaSelector, vargaLabel } from '@/components/charts/VargaSelector'
import { useToast } from '@/components/feedback/toast-context'
import { useAuth } from '@/auth/auth-context'
import { chartSeedFor, type ChartProfile } from '@/data/profiles'
import { useProfiles } from '@/profiles/profiles-context'
import { vargas } from '@/data/vargas'
import { useAsync } from '@/hooks/useAsync'
import { PageContainer } from '@/layouts/PageContainer'
import { hasActivePlan, unlockPlan } from '@/onboarding/past-intro'
import { describeBirth, getCalculationBasis, getChart, getDasha } from '@/services/chart.service'
import type { GrahaCode, VargaCode } from '@/types/astrology'
import { cn } from '@/utils/cn'

const SECTIONS = [
  { id: 'grahas', label: 'Grahas' },
  { id: 'bhavas', label: 'Bhavas' },
  { id: 'drishti', label: 'Drishti' },
  { id: 'dasha', label: 'Dasha' },
  { id: 'sav', label: 'Ashtakavarga' },
  { id: 'basis', label: 'Calculation basis' },
]

/**
 * E2 / E4 — My Chart.
 *
 * One dashboard, not seven screens. The profile, the divisional chart and the
 * section are all state on this page; the pickers are overlays. Nothing here
 * navigates away, which is the product's stated principle for this screen.
 */
export default function ChartPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const chartFrameRef = useRef<HTMLDivElement>(null)

  // `?section=` deep-links from Everything open straight on that tab.
  const requested = params.get('section')
  const tabs = useTabs(requested && SECTIONS.some((s) => s.id === requested) ? requested : 'grahas')

  /*
    Clear the param once it has been applied, so a later tab change is not
    contradicted by a stale URL and Back does not re-force the old section.
  */
  const { setValue: setTab } = tabs
  useEffect(() => {
    if (!requested) return
    if (SECTIONS.some((s) => s.id === requested)) setTab(requested)
    setParams({}, { replace: true })
  }, [requested, setTab, setParams])

  // The selected chart is shared with Matching, Compatibility and horoscopes,
  // so switching here follows you to those screens.
  const { profiles, selectedId: profileId, selected: profile, select: setProfileId } = useProfiles()
  const [varga, setVarga] = useState<VargaCode>('D1')
  const [activeGraha, setActiveGraha] = useState<GrahaCode | null>(null)
  const [activeBhava, setActiveBhava] = useState<number | undefined>(undefined)
  const [planUnlocked, setPlanUnlocked] = useState(() =>
    user ? hasActivePlan(user.id) : false,
  )
  const [paywallOpen, setPaywallOpen] = useState(false)

  // Seeded on the birth details, so an edit in Account recalculates this.
  const seed = chartSeedFor(profile)
  const chartState = useAsync((signal) => getChart(seed, varga, signal), [seed, varga])
  const dashaState = useAsync(
    (signal) => getDasha(seed, profile.birthDetails.date, signal),
    [seed, profile.birthDetails.date],
  )
  const basisState = useAsync(
    (signal) => getCalculationBasis(profile.birthDetails, signal),
    [profile.birthDetails],
  )

  /** Selecting anywhere clears the other selection — one focus at a time. */
  const selectGraha = useCallback((graha: GrahaCode) => {
    setActiveBhava(undefined)
    setActiveGraha((current) => (current === graha ? null : graha))
  }, [])

  const selectBhava = useCallback((bhava: number) => {
    setActiveGraha(null)
    setActiveBhava((current) => (current === bhava ? undefined : bhava))
  }, [])

  const changeProfile = useCallback(
    (next: ChartProfile) => {
      setProfileId(next.id)
      setActiveGraha(null)
      setActiveBhava(undefined)
    },
    [setProfileId],
  )

  const changeVarga = useCallback((next: VargaCode) => {
    setVarga(next)
    setActiveGraha(null)
    setActiveBhava(undefined)
  }, [])

  const exportChartSvg = useCallback(() => {
    const svg = chartFrameRef.current?.querySelector('svg')
    if (!svg) {
      toast.error('Chart not ready', { description: 'Wait for the kundli to finish drawing.' })
      return
    }

    const clone = svg.cloneNode(true) as SVGElement
    if (!clone.getAttribute('xmlns')) {
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    }
    const payload = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`
    const blob = new Blob([payload], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const safeName = profile.name.replace(/[^\w\-]+/g, '-').replace(/^-|-$/g, '') || 'chart'
    link.href = url
    link.download = `cyklos-${safeName}-${vargaLabel(varga)}.svg`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Chart downloaded', {
      description: `${vargaLabel(varga)} kundli saved as SVG.`,
    })
  }, [profile.name, toast, varga])

  const downloadChart = useCallback(() => {
    if (!planUnlocked) {
      setPaywallOpen(true)
      return
    }
    exportChartSvg()
  }, [planUnlocked, exportChartSvg])

  const chart = chartState.data
  const vargaMeta = vargas.find((v) => v.code === varga)

  const occupantsByBhava = useMemo(() => {
    const map: Record<number, GrahaCode[]> = {}
    for (const g of chart?.grahas ?? []) {
      map[g.bhava] = [...(map[g.bhava] ?? []), g.graha]
    }
    return map
  }, [chart])

  if (!user) return null

  return (
    <>
      <PageContainer width="wide">
        {chartState.status === 'error' ? (
          <ErrorState
            error={chartState.error}
            onRetry={chartState.retry}
            title="This chart did not load"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,16.5rem)_minmax(0,1fr)] lg:gap-7 xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_minmax(0,20rem)] xl:gap-8">
            {/* ── Left: whose chart, and which one ── */}
            <div className="lg:col-start-1">
              <div className="lg:sticky lg:top-8 lg:space-y-5">
                <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
                  <p className="font-mono text-label uppercase text-muted">Charts</p>
                  <ChartProfilePicker
                    profiles={profiles}
                    selectedId={profileId}
                    onSelect={changeProfile}
                  />
                </div>
                <div className="hidden lg:block">
                  <ChartProfilePicker
                    profiles={profiles}
                    selectedId={profileId}
                    onSelect={changeProfile}
                    variant="list"
                  />
                </div>
              </div>
            </div>

            {/* ── Centre: the chart and the active section ── */}
            <div className="min-w-0 lg:col-start-2">
              <header className="space-y-2 rounded-panel border border-border/70 bg-surface/60 px-4 py-4 sm:px-5">
                <p className="font-mono text-label uppercase tracking-[0.14em] text-gold-deep">
                  Kundli
                  {profile.relation !== 'self' ? ` · ${profile.relation}` : ''}
                </p>
                <h1 className="font-serif text-title font-normal text-ink lg:text-title-lg">
                  {profile.id === 'self' ? 'My chart' : profile.name}
                </h1>
                <p className="font-mono text-data text-muted">
                  {describeBirth(profile.birthDetails)}
                </p>
                {chart && (
                  <p className="font-mono text-label uppercase text-copper">
                    Lagna {chart.lagna.rashi} ·{' '}
                    {(() => {
                      const moon = chart.grahas.find((g) => g.graha === 'Mo')
                      return moon
                        ? `Chandra ${moon.rashi} · ${moon.nakshatra.name} pada ${moon.nakshatra.pada}`
                        : ''
                    })()}
                  </p>
                )}
              </header>

              <VargaSelector value={varga} onChange={changeVarga} className="mt-5" />

              <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] md:items-start xl:grid-cols-1">
                <div className="overflow-hidden rounded-panel border border-border bg-surface shadow-card">
                  <div className="flex items-center justify-between gap-3 border-b border-border/80 bg-surface-sunken/40 px-4 py-2.5 sm:px-5">
                    <p className="font-mono text-label uppercase tracking-[0.12em] text-gold-deep">
                      {vargaLabel(varga)}
                      {vargaMeta ? ` · ${vargaMeta.name}` : ''}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={!chart}
                      onClick={downloadChart}
                      iconLeft={
                        planUnlocked ? (
                          <Download className="size-3.5" strokeWidth={2} />
                        ) : (
                          <Crown className="size-3.5" strokeWidth={2} />
                        )
                      }
                      className="rounded-full"
                    >
                      Download
                      {!planUnlocked && (
                        <span className="ml-1 font-mono text-[9px] uppercase tracking-[0.12em] text-gold-deep">
                          Plus
                        </span>
                      )}
                    </Button>
                  </div>
                  <div ref={chartFrameRef} className="p-4 xl:p-6">
                    {chart ? (
                      <ChartDiamond
                        chart={chart}
                        tone="surface"
                        activeBhava={activeBhava}
                        onBhavaClick={selectBhava}
                        className="mx-auto max-w-[440px]"
                      />
                    ) : (
                      <div className="space-y-3">
                        <Skeleton
                          shape="block"
                          className="mx-auto aspect-square w-full max-w-[440px]"
                        />
                        <p className="text-center font-mono text-label uppercase text-muted">
                          Calculating {vargaLabel(varga)}…
                        </p>
                      </div>
                    )}
                    {vargaMeta && (
                      <p className="mt-4 border-t border-border pt-3 text-sm text-muted text-pretty">
                        {vargaMeta.signifies}.
                      </p>
                    )}
                  </div>
                </div>

                {chart && (
                  <ReadingNotes
                    chart={chart}
                    activeGraha={activeGraha}
                    activeBhava={activeBhava}
                    className="xl:hidden"
                  />
                )}
              </div>

              <div className="mt-8 overflow-hidden rounded-panel border border-border bg-surface/80 shadow-card">
                <div className="border-b border-border px-3 pt-3 sm:px-4">
                  <Tabs items={SECTIONS} controller={tabs} label="Chart sections" />
                </div>

                <div className="p-4 sm:p-5">
                  {chartState.status === 'loading' || !chart ? (
                    <LoadingState label="Reading your chart…" lines={6} />
                  ) : (
                    <>
                      <TabPanel controller={tabs} id="grahas">
                        <GrahaTable
                          grahas={chart.grahas}
                          activeGraha={activeGraha}
                          onSelect={selectGraha}
                        />
                      </TabPanel>

                      <TabPanel controller={tabs} id="bhavas">
                        <BhavaTable
                          bhavas={chart.bhavas}
                          occupants={occupantsByBhava}
                          lagna={chart.lagna}
                          activeBhava={activeBhava}
                          onSelect={selectBhava}
                        />
                      </TabPanel>

                      <TabPanel controller={tabs} id="drishti">
                        <DrishtiPanel
                          drishti={chart.drishti}
                          occupants={occupantsByBhava}
                          activeGraha={activeGraha}
                          onSelect={selectGraha}
                        />
                      </TabPanel>

                      <TabPanel controller={tabs} id="dasha">
                        {dashaState.status === 'error' ? (
                          <ErrorState
                            variant="inline"
                            error={dashaState.error}
                            onRetry={dashaState.retry}
                          />
                        ) : dashaState.data ? (
                          <DashaTimeline dasha={dashaState.data} />
                        ) : (
                          <LoadingState label="Counting the periods…" lines={5} />
                        )}
                      </TabPanel>

                      <TabPanel controller={tabs} id="sav">
                        <AshtakavargaGrid
                          ashtakavarga={chart.ashtakavarga}
                          activeBhava={activeBhava}
                          onSelect={selectBhava}
                        />
                      </TabPanel>

                      <TabPanel controller={tabs} id="basis">
                        {basisState.status === 'error' ? (
                          <ErrorState
                            variant="inline"
                            error={basisState.error}
                            onRetry={basisState.retry}
                          />
                        ) : basisState.data ? (
                          <CalculationBasis
                            basis={basisState.data}
                            birthDetails={profile.birthDetails}
                          />
                        ) : (
                          <LoadingState label="Gathering the working…" lines={6} />
                        )}
                      </TabPanel>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right: reading notes and context, from 1280px up ── */}
            {chart && (
              <div className="hidden xl:col-start-3 xl:block">
                <div className="sticky top-8 space-y-4">
                  <div className="rounded-panel border border-border bg-surface/70 p-4 shadow-card">
                    <ReadingNotes
                      chart={chart}
                      activeGraha={activeGraha}
                      activeBhava={activeBhava}
                    />
                  </div>

                  {(activeGraha || activeBhava) && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveGraha(null)
                        setActiveBhava(undefined)
                      }}
                      className={cn(
                        'flex w-full items-center justify-center gap-2 rounded-control border border-copper/40',
                        'bg-copper/10 px-4 py-2.5 text-sm font-medium text-copper',
                        'transition-colors hover:bg-copper/15 hover:border-copper/55',
                      )}
                    >
                      <Info aria-hidden className="size-4" />
                      Clear selection
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </PageContainer>

      <ChatPaywall
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onUnlock={(_planId) => {
          if (!user) return
          unlockPlan(user.id)
          setPlanUnlocked(true)
          setPaywallOpen(false)
          toast.success('Downloads unlocked', {
            description: 'You can save this kundli as an SVG anytime.',
          })
          window.setTimeout(() => exportChartSvg(), 80)
        }}
        title="Download needs a plan"
        description="Chart exports are included with Cyklos Plus. Unlock to save this kundli."
        benefit="Plus unlocks SVG downloads of any divisional chart you are viewing."
        unlockLabel="Unlock downloads"
      />
    </>
  )
}
