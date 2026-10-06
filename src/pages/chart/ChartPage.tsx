import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { TabPanel, useTabs } from '@/components/common/Tabs'
import { ChartDashaPanel } from '@/components/charts/ChartDashaPanel'
import { ChartWorkspace } from '@/components/charts/ChartWorkspace'
import { ChartYogaDoshaPanel } from '@/components/charts/ChartYogaDoshaPanel'
import { ChartPlanetsPanel } from '@/components/charts/ChartPlanetsPanel'
import { ChartVargasPanel } from '@/components/charts/ChartVargasPanel'
import { ChartTransitsPanel } from '@/components/charts/ChartTransitsPanel'
import { ChartStrengthPanel } from '@/components/charts/ChartStrengthPanel'
import { CHART_NAV_TABS, ChartNavRail } from '@/components/charts/ChartNavRail'
import type { ChartKundaliDownloadContext } from '@/components/charts/ChartKundaliDownloads'
import { useAuth } from '@/auth/auth-context'
import { chartSeedFor, type ChartProfile } from '@/data/profiles'
import { useProfiles } from '@/profiles/profiles-context'
import { useAsync } from '@/hooks/useAsync'
import { PageContainer } from '@/layouts/PageContainer'
import { hasChartDetailUnlocked } from '@/onboarding/chart-detail-unlock'
import { getChart, getDasha } from '@/services/chart.service'
import type { GrahaCode, VargaCode } from '@/types/astrology'
import { paths } from '@/routes/paths'

/** Map legacy `?section=` deep links onto the chart tab layout. */
function resolveDeepLink(section: string | null): string {
  if (!section) return 'chart'
  if (CHART_NAV_TABS.some((t) => t.id === section)) return section
  if (section === 'charts' || section === 'kundali' || section === 'bhavas' || section === 'basic' || section === 'basis') {
    return 'chart'
  }
  if (section === 'grahas' || section === 'planets') return 'planets'
  if (section === 'sav' || section === 'ashtakavarga' || section === 'kp' || section === 'report') {
    return 'strength'
  }
  if (section === 'dasha') return 'dasha'
  if (section === 'yoga' || section === 'dosha') return 'yoga'
  if (section === 'vargas' || section === 'varga') return 'vargas'
  if (section === 'transits' || section === 'transit') return 'transits'
  return 'chart'
}

/**
 * My Chart — Chart-first tab bar, then Yoga / Dasha / Planets / Vargas / Transits / Strength.
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
  const [activeBhava, setActiveBhava] = useState<number>(1)

  const seed = chartSeedFor(profile)
  const chartState = useAsync((signal) => getChart(seed, varga, signal), [seed, varga])
  const dashaState = useAsync(
    (signal) => getDasha(seed, profile.birthDetails.date, signal),
    [seed, profile.birthDetails.date],
  )

  const selectBhava = useCallback((bhava: number) => {
    setActiveGraha(null)
    setActiveBhava(bhava)
  }, [])

  const selectGraha = useCallback((graha: GrahaCode) => {
    setActiveBhava(1)
    setActiveGraha((current) => (current === graha ? null : graha))
  }, [])

  const changeProfile = useCallback(
    (next: ChartProfile) => {
      setProfileId(next.id)
      setActiveGraha(null)
      setActiveBhava(1)
    },
    [setProfileId],
  )

  const changeVarga = useCallback((next: VargaCode) => {
    setVarga(next)
    setActiveGraha(null)
    setActiveBhava(1)
  }, [])

  const openDetail = useCallback(() => {
    navigate(paths.chartDetail)
  }, [navigate])

  const chart = chartState.data
  const detailUnlocked = user ? hasChartDetailUnlocked(user.id, profile.id) : false

  const downloads = useMemo<ChartKundaliDownloadContext | undefined>(() => {
    if (!chart) return undefined
    return {
      chart,
      profileName: profile.name,
      birthDetails: profile.birthDetails,
      detailUnlocked,
      onGetDetail: openDetail,
    }
  }, [chart, profile.name, profile.birthDetails, detailUnlocked, openDetail])

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
            <TabPanel controller={tabs} id="chart">
              {chart ? (
                <ChartWorkspace
                  chart={chart}
                  birthDetails={profile.birthDetails}
                  profileName={profile.name}
                  varga={varga}
                  onVargaChange={changeVarga}
                  activeBhava={activeBhava}
                  onBhavaClick={selectBhava}
                  activeGraha={activeGraha}
                  onClearSelection={() => {
                    setActiveGraha(null)
                    setActiveBhava(1)
                  }}
                  chartFrameRef={chartFrameRef}
                  detailUnlocked={detailUnlocked}
                  onGetDetail={openDetail}
                />
              ) : (
                <LoadingState label="Drawing the kundli…" lines={6} />
              )}
            </TabPanel>

            <TabPanel controller={tabs} id="yoga">
              {chart ? (
                <ChartYogaDoshaPanel chart={chart} downloads={downloads} />
              ) : (
                <LoadingState label="Reading yogas and doshas…" lines={6} />
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
                  <ChartDashaPanel dasha={dashaState.data} downloads={downloads} />
                ) : (
                  <LoadingState label="Counting the periods…" lines={5} />
                )}
              </div>
            </TabPanel>

            <TabPanel controller={tabs} id="planets">
              {chart ? (
                <ChartPlanetsPanel
                  chart={chart}
                  activeGraha={activeGraha}
                  onSelectGraha={selectGraha}
                  downloads={downloads}
                />
              ) : (
                <LoadingState label="Reading the grahas…" lines={6} />
              )}
            </TabPanel>

            <TabPanel controller={tabs} id="vargas">
              <ChartVargasPanel
                seed={seed}
                varga={varga}
                onVargaChange={changeVarga}
                downloads={downloads}
              />
            </TabPanel>

            <TabPanel controller={tabs} id="transits">
              {chart ? (
                <ChartTransitsPanel chart={chart} downloads={downloads} />
              ) : (
                <LoadingState label="Reading gochar…" lines={5} />
              )}
            </TabPanel>

            <TabPanel controller={tabs} id="strength">
              {chart ? (
                <ChartStrengthPanel
                  chart={chart}
                  activeBhava={activeBhava}
                  onSelectBhava={selectBhava}
                  downloads={downloads}
                />
              ) : (
                <LoadingState label="Counting bindus…" lines={5} />
              )}
            </TabPanel>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
