import { useCallback, useState } from 'react'
import { ErrorState } from '@/components/common/ErrorState'
import { SectionHeader } from '@/components/common/SectionHeader'
import { TabPanel, Tabs, useTabs } from '@/components/common/Tabs'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { AllLens } from '@/components/readings/AllLens'
import { BhavaLens } from '@/components/readings/BhavaLens'
import { DashaLens } from '@/components/readings/DashaLens'
import { ReadingsEmpty, ReadingsSkeleton } from '@/components/readings/ReadingsStates'
import { useAuth } from '@/auth/auth-context'
import { chartSeedFor } from '@/data/profiles'
import { useAsync } from '@/hooks/useAsync'
import { PageContainer } from '@/layouts/PageContainer'
import { getReadingsIndex } from '@/services/readings.service'

const LENSES = [
  { id: 'bhava', label: 'Bhava' },
  { id: 'dasha', label: 'Dasha' },
  { id: 'all', label: 'All' },
]

/**
 * G1–G4 — Readings.
 *
 * Three lenses on one set, never an inbox. The chart is the index: by bhava it
 * is the diamond, by dasha it is the timeline, and only the third view is a
 * flat list — kept for when you just want to find a sentence.
 */
export default function ReadingsPage() {
  const { user } = useAuth()
  const tabs = useTabs('bhava')
  // The bhava lens draws the user's own chart as its index, so it seeds the
  // same way every other chart surface does.
  const seed = user ? chartSeedFor({ id: 'self', birthDetails: user.birthDetails }) : 'self'
  const { status, data, error, retry } = useAsync(
    (signal) => getReadingsIndex(seed, user?.birthDetails.date, signal),
    [seed, user?.birthDetails.date],
  )
  const [activeBhava, setActiveBhava] = useState<number | undefined>(undefined)

  const selectBhava = useCallback((bhava: number) => setActiveBhava(bhava), [])

  if (!user) return null

  const isEmpty = status === 'success' && data && data.all.length === 0

  return (
    <>
      <MobileHeader title="Readings" user={user} />

      <PageContainer width="content">
        <SectionHeader
          as="h1"
          size="lg"
          className="max-lg:[&>div>h1]:sr-only"
          title="Readings"
          description="Your questions sit where they were read from — not in the order you happened to ask them."
        />

        {status === 'error' ? (
          <ErrorState
            className="mt-8"
            error={error}
            onRetry={retry}
            title="Your readings did not load"
          />
        ) : status === 'loading' || status === 'idle' ? (
          <ReadingsSkeleton className="mt-8" />
        ) : isEmpty ? (
          <ReadingsEmpty className="mt-4" />
        ) : (
          data && (
            <div className="mt-6 animate-fade-in">
              <Tabs items={LENSES} controller={tabs} variant="segmented" label="Reading lenses" />

              <div className="pt-6">
                <TabPanel controller={tabs} id="bhava">
                  <BhavaLens
                    groups={data.byBhava}
                    unasked={data.unaskedBhavas}
                    chart={data.chart}
                    activeBhava={activeBhava}
                    onSelectBhava={selectBhava}
                  />
                </TabPanel>

                <TabPanel controller={tabs} id="dasha">
                  <DashaLens
                    groups={data.byPeriod}
                    runningPath={data.runningPath}
                    runningEndsOn={data.runningEndsOn}
                  />
                </TabPanel>

                <TabPanel controller={tabs} id="all">
                  <AllLens readings={data.all} />
                </TabPanel>
              </div>
            </div>
          )
        )}
      </PageContainer>
    </>
  )
}
