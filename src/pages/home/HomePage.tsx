import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorState } from '@/components/common/ErrorState'
import { QuestionComposer } from '@/components/ask/QuestionComposer'
import {
  ChartInsightPanel,
  ChartSummaryCard,
  GreetingBlock,
  HomeSkeleton,
  IdentityStrip,
  RecentReadings,
  SuggestedQuestions,
} from '@/components/home'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { useAuth } from '@/auth/auth-context'
import { chartSeedFor } from '@/data/profiles'
import { useAsync } from '@/hooks/useAsync'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'
import { getHomeFeed } from '@/services/home.service'

/**
 * A6 / C5 — Home.
 *
 * Composition only: every block is its own component and every string comes
 * from the feed, so this file stays a layout decision rather than a wall of
 * markup.
 *
 * The two breakpoints are genuinely different compositions, not one stretched:
 *   mobile   one column — greeting, composer, chart, prompts, readings
 *   desktop  three — prompts on the left, the chart at the centre of attention,
 *            and what the chart is doing now on the right
 */
export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Home always shows the account holder's own chart, seeded the same way the
  // dashboard seeds it so the two wheels agree.
  const seed = user ? chartSeedFor({ id: 'self', birthDetails: user.birthDetails }) : 'self'
  const { status, data, error, retry } = useAsync(
    (signal) => getHomeFeed(seed, user?.birthDetails.date, signal),
    [seed, user?.birthDetails.date],
  )

  /** Every route into the reading flow goes through here. */
  const ask = useCallback(
    (question: string) => {
      navigate(`${paths.ask}?q=${encodeURIComponent(question)}`)
    },
    [navigate],
  )

  if (!user) return null

  return (
    <>
      <MobileHeader user={user} />

      <PageContainer width="wide">
        {status === 'loading' || status === 'idle' ? (
          <HomeSkeleton />
        ) : status === 'error' ? (
          <ErrorState error={error} onRetry={retry} title="Your chart did not load" />
        ) : (
          data && (
            <div className="animate-rise">
              <GreetingBlock fullName={user.fullName} panchang={data.panchang} />

              {/*
                The three values the chart is recognised by, directly under the
                greeting — on mobile the wheel is several screens down, so this
                is where Home says whose sky it is.
              */}
              <IdentityStrip
                summary={data.summary}
                nakshatra={data.chart.grahas.find((g) => g.graha === 'Mo')?.nakshatra.name}
                className="mt-5"
              />

              {/*
                One grid, two compositions.

                Below `lg` the column wrappers are `display: contents`, so
                their children flatten into the single-column grid and each one
                can take its own `order`: composer, chart, prompts, readings.
                At `lg` the wrappers become real columns and the order classes
                fall inert.
              */}
              <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-10">
                {/* ── Left: the composer and the prompts into it ── */}
                <div className="contents lg:col-start-1 lg:row-start-1 lg:block lg:space-y-8">
                  <div className="order-1">
                    <QuestionComposer onAsk={ask} />
                  </div>
                  <SuggestedQuestions
                    questions={data.suggested}
                    onSelect={ask}
                    className="order-3"
                  />
                </div>

                {/* ── Centre: the chart ── */}
                <div className="order-2 lg:col-start-2 lg:row-start-1">
                  <ChartSummaryCard
                    fullName={user.fullName}
                    birthDetails={user.birthDetails}
                    chart={data.chart}
                    summary={data.summary}
                    insight={data.insight}
                    layout="stack"
                    className="lg:sticky lg:top-8"
                  />
                </div>

                {/* ── Right: what the chart is doing, and what it has answered ── */}
                <div className="contents lg:col-start-3 lg:row-start-1 lg:block lg:space-y-8">
                  <ChartInsightPanel insight={data.insight} className="hidden lg:block" />
                  <RecentReadings
                    readings={data.recent}
                    totalReadings={data.totalReadings}
                    className="order-4"
                  />
                </div>
              </div>
            </div>
          )
        )}
      </PageContainer>
    </>
  )
}
