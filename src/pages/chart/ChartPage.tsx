import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { TabPanel, useTabs } from '@/components/common/Tabs'
import { AshtakavargaGrid } from '@/components/astrology/AshtakavargaGrid'
import { ChartDashaPanel } from '@/components/charts/ChartDashaPanel'
import { ChartBasicPanel } from '@/components/charts/ChartBasicPanel'
import { ChartWorkspace } from '@/components/charts/ChartWorkspace'
import { ChartPlanetsPanel } from '@/components/charts/ChartPlanetsPanel'
import { ChartKpPanel } from '@/components/charts/ChartKpPanel'
import { CHART_NAV_TABS, ChartNavRail } from '@/components/charts/ChartNavRail'
import { ChartReportPanel } from '@/components/charts/ChartReportPanel'
import { useAuth } from '@/auth/auth-context'
import { chartSeedFor, type ChartProfile } from '@/data/profiles'
import { useProfiles } from '@/profiles/profiles-context'
import { useAsync } from '@/hooks/useAsync'
import { PageContainer } from '@/layouts/PageContainer'
import { hasChartDetailUnlocked } from '@/onboarding/chart-detail-unlock'
import { getChart, getDasha } from '@/services/chart.service'
import type { GrahaCode, VargaCode } from '@/types/astrology'
import { paths } from '@/routes/paths'

/** Map legacy `?section=` deep links onto the new tab layout. */
function resolveDeepLink(section: string | null): string {
  if (!section) return 'charts'
  if (CHART_NAV_TABS.some((t) => t.id === section)) return section
  if (section === 'basis' || section === 'basic') return 'basic'
  if (section === 'kundali' || section === 'bhavas' || section === 'drishti') {
    return 'charts'
  }
  if (section === 'grahas' || section === 'planets') return 'planets'
  if (section === 'sav' || section === 'ashtakavarga') return 'ashtakavarga'
  if (section === 'dasha') return 'dasha'
  if (section === 'kp') return 'kp'
  if (section === 'report' || section === 'more') return 'report'
  return 'charts'
}

/**
 * My Chart — tab rail first, then Basic / Charts / Planets / KP / Ashtakvarga / Dasha / Report.
 */
export default function ChartPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const chartFrameRef = useRef<HTMLDivElement>(null)

  const requested = params.get('section')
  const tabs = useTabs(resolveDeepLink(requested))
  const { setValue: setTab } = tabs

  useEffect(() => {
    if (!requested) return
    setTab(resolveDeepLink(requested))
    setParams({}, { replace: true })
  }, [requested, setTab, setParams])

  const { profiles, selectedId: profileId, selected: profile, select: setProfileId } = useProfiles()
  const [varga, setVarga] = useState<VargaCode>('D1')
  const [activeGraha, setActiveGraha] = useState<GrahaCode | null>(null)
  const [activeBhava, setActiveBhava] = useState<number | undefined>(undefined)

  const seed = chartSeedFor(profile)
  const chartState = useAsync((signal) => getChart(seed, varga, signal), [seed, varga])
  const dashaState = useAsync(
    (signal) => getDasha(seed, profile.birthDetails.date, signal),
    [seed, profile.birthDetails.date],
  )

  const selectBhava = useCallback((bhava: number) => {
    setActiveGraha(null)
    setActiveBhava((current) => (current === bhava ? undefined : bhava))
  }, [])

  const selectGraha = useCallback((graha: GrahaCode) => {
    setActiveBhava(undefined)
    setActiveGraha((current) => (current === graha ? null : graha))
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

  const openDetail = useCallback(() => {
    navigate(paths.chartDetail)
  }, [navigate])

  const chart = chartState.data
  const detailUnlocked = user ? hasChartDetailUnlocked(user.id, profile.id) : false

  if (!user) return null

  return (
    <PageContainer width="full" className="pb-8 pt-3 sm:pt-4">
      {chartState.status === 'error' ? (
        <ErrorState
          error={chartState.error}
          onRetry={chartState.retry}
          title="This chart did not load"
        />
      ) : (
        <div className="w-full animate-rise space-y-4 sm:space-y-5">
          <ChartNavRail
            controller={tabs}
            profiles={profiles}
            profileId={profileId}
            onSelectProfile={changeProfile}
          />

          <div className="min-h-[20rem] w-full">
            <TabPanel controller={tabs} id="basic">
              <div className="mx-auto max-w-3xl">
                <ChartBasicPanel birth={profile.birthDetails} />
              </div>
            </TabPanel>

            <TabPanel controller={tabs} id="charts">
              {chart ? (
                <ChartWorkspace
                  chart={chart}
                  birthDetails={profile.birthDetails}
                  varga={varga}
                  onVargaChange={changeVarga}
                  activeBhava={activeBhava}
                  onBhavaClick={selectBhava}
                  activeGraha={activeGraha}
                  onClearSelection={() => {
                    setActiveGraha(null)
                    setActiveBhava(undefined)
                  }}
                  chartFrameRef={chartFrameRef}
                  detailUnlocked={detailUnlocked}
                  onGetDetail={openDetail}
                />
              ) : (
                <LoadingState label="Drawing the kundli…" lines={6} />
              )}
            </TabPanel>

            <TabPanel controller={tabs} id="planets">
              <div className="mx-auto max-w-5xl">
                {chart ? (
                  <ChartPlanetsPanel
                    chart={chart}
                    activeGraha={activeGraha}
                    onSelectGraha={selectGraha}
                  />
                ) : (
                  <LoadingState label="Reading the grahas…" lines={6} />
                )}
              </div>
            </TabPanel>

            <TabPanel controller={tabs} id="kp">
              <div className="mx-auto max-w-4xl">
                {chart ? (
                  <ChartKpPanel chart={chart} />
                ) : (
                  <LoadingState label="Reading KP cusps…" lines={5} />
                )}
              </div>
            </TabPanel>

            <TabPanel controller={tabs} id="ashtakavarga">
              {chart ? (
                <div className="mx-auto max-w-5xl animate-rise space-y-4">
                  <div className="space-y-1.5">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                      Ashtakvarga
                    </p>
                    <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                      Bindus by house
                    </h2>
                    <p className="max-w-lg text-sm leading-relaxed text-muted text-pretty">
                      Sarvashtakavarga — which parts of the sky back this chart.
                    </p>
                  </div>
                  <AshtakavargaGrid
                    ashtakavarga={chart.ashtakavarga}
                    activeBhava={activeBhava}
                    onSelect={selectBhava}
                  />
                </div>
              ) : (
                <LoadingState label="Counting bindus…" lines={5} />
              )}
            </TabPanel>

            <TabPanel controller={tabs} id="dasha">
              <div className="w-full animate-rise">
                {dashaState.status === 'error' ? (
                  <ErrorState
                    variant="inline"
                    error={dashaState.error}
                    onRetry={dashaState.retry}
                  />
                ) : dashaState.data ? (
                  <ChartDashaPanel dasha={dashaState.data} />
                ) : (
                  <LoadingState label="Counting the periods…" lines={5} />
                )}
              </div>
            </TabPanel>

            <TabPanel controller={tabs} id="report">
              <div className="mx-auto max-w-lg">
                <ChartReportPanel
                  profileName={profile.name}
                  unlocked={detailUnlocked}
                  onGetDetail={openDetail}
                />
              </div>
            </TabPanel>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

