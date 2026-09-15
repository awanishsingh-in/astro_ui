import { Info } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { Skeleton } from '@/components/common/Skeleton'
import { TabPanel, Tabs, useTabs } from '@/components/common/Tabs'
import { AshtakavargaGrid } from '@/components/astrology/AshtakavargaGrid'
import { BhavaTable } from '@/components/astrology/BhavaTable'
import { CalculationBasis } from '@/components/astrology/CalculationBasis'
import { DashaTimeline } from '@/components/astrology/DashaTimeline'
import { DrishtiPanel } from '@/components/astrology/DrishtiPanel'
import { GrahaTable } from '@/components/astrology/GrahaTable'
import { ReadingNotes } from '@/components/astrology/ReadingNotes'
import { ChartProfilePicker } from '@/components/charts/ChartProfilePicker'
import { PremiumChartWheel } from '@/components/charts/PremiumChartWheel'
import { CelestialCard } from '@/components/celestial/CelestialCard'
import { VargaSelector, vargaLabel } from '@/components/charts/VargaSelector'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { useAuth } from '@/auth/auth-context'
import { chartSeedFor, type ChartProfile } from '@/data/profiles'
import { useProfiles } from '@/profiles/profiles-context'
import { vargas } from '@/data/vargas'
import { useAsync } from '@/hooks/useAsync'
import { PageContainer } from '@/layouts/PageContainer'
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
  const [params, setParams] = useSearchParams()

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

  const chart = chartState.data
  const vargaMeta = vargas.find((v) => v.code === varga)

  /** The aspect trace drawn on the wheel: where the graha sits, then its targets. */
  const aspectTrace = useMemo(() => {
    if (!chart || !activeGraha) return undefined
    const row = chart.drishti.find((d) => d.graha === activeGraha)
    return row ? [row.sitsIn, ...row.aspects] : undefined
  }, [chart, activeGraha])

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
      <MobileHeader
        title="My Chart"
        showBack
        action={
          <ChartProfilePicker profiles={profiles} selectedId={profileId} onSelect={changeProfile} />
        }
      />

      <PageContainer width="wide">
        {chartState.status === 'error' ? (
          <ErrorState
            error={chartState.error}
            onRetry={chartState.retry}
            title="This chart did not load"
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,19rem)]">
            {/* ── Left: whose chart, and which one ── */}
            <div className="hidden lg:col-start-1 lg:block">
              <div className="sticky top-8 space-y-6">
                <ChartProfilePicker
                  profiles={profiles}
                  selectedId={profileId}
                  onSelect={changeProfile}
                  variant="list"
                />
              </div>
            </div>

            {/* ── Centre: the chart and the active section ── */}
            <div className="min-w-0 lg:col-start-2">
              {/*
                Exactly one <h1> per breakpoint: the sticky bar carries it on
                mobile, so this one is display:none there and leaves the
                accessibility tree; above `lg` the bar is hidden and it takes
                over. A profile other than your own always shows, because the
                bar only ever says "My Chart".
              */}
              <header className="space-y-1.5">
                <h1
                  className={cn(
                    'text-title font-semibold text-ink lg:block lg:text-title-lg',
                    profile.id === 'self' ? 'hidden' : 'block',
                  )}
                >
                  {profile.id === 'self' ? 'My chart' : profile.name}
                </h1>
                <p className="font-mono text-data text-muted">
                  {describeBirth(profile.birthDetails)}
                </p>
                {/* The birth nakshatra is what the dasha is entered at, so it
                    belongs in the identity strip rather than only in a table. */}
                {chart && (
                  <p className="font-mono text-label uppercase text-gold-deep">
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

              {/*
                Below `xl` the notes sit beside the wheel; at `xl` they move to
                the right rail, so this collapses to one column and the wheel
                takes the width it deserves.
              */}
              <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-start xl:grid-cols-1">
                {/*
                  The one dark panel on the dashboard. Everything around it is
                  paper — tables, notes, controls — so the chart itself reads
                  as the object being studied rather than another card.
                */}
                <CelestialCard
                  motifs={['stars']}
                  tone="midnight"
                  seed={`${profileId}:${varga}`}
                  padding="none"
                  className="rounded-panel [&>div]:rounded-panel"
                >
                  <div className="p-4 xl:p-6">
                    {chart ? (
                      <PremiumChartWheel
                        chart={chart}
                        tone="dark"
                        animationKey={`${profileId}:${varga}`}
                        activeGraha={activeGraha}
                        onGrahaClick={selectGraha}
                        activeBhava={activeBhava}
                        onBhavaClick={selectBhava}
                        aspectsFrom={aspectTrace}
                        interactive
                        className="mx-auto max-w-[440px]"
                      />
                    ) : (
                      <Skeleton
                        shape="circle"
                        className="mx-auto aspect-square w-full max-w-[440px] bg-indigo-royal/50"
                      />
                    )}

                    <p className="mt-4 border-t border-celestial-line pt-3 text-sm text-on-celestial-muted text-pretty">
                      <span className="font-mono text-label uppercase text-gold-soft-line">
                        {vargaLabel(varga)} {vargaMeta?.name}
                      </span>
                      {' — '}
                      {vargaMeta?.signifies}.
                    </p>
                  </div>
                </CelestialCard>

                {/* Reading notes sit beside the wheel until the third column appears. */}
                {chart && (
                  <ReadingNotes
                    chart={chart}
                    activeGraha={activeGraha}
                    activeBhava={activeBhava}
                    className="xl:hidden"
                  />
                )}
              </div>

              {/* ── The six sections ── */}
              <div className="mt-8">
                <Tabs items={SECTIONS} controller={tabs} label="Chart sections" />

                <div className="pt-5">
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
                <div className="sticky top-8 space-y-6">
                  <ReadingNotes chart={chart} activeGraha={activeGraha} activeBhava={activeBhava} />

                  {(activeGraha || activeBhava) && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveGraha(null)
                        setActiveBhava(undefined)
                      }}
                      className={cn(
                        'flex w-full items-center justify-center gap-2 rounded-control border border-border',
                        'bg-surface px-4 py-2.5 text-sm font-medium text-navy hover:bg-navy-soft',
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
    </>
  )
}
