import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, createBrowserRouter, type RouteObject } from 'react-router-dom'
import { LoadingState } from '@/components/common/LoadingState'
import { AppLayout } from '@/layouts/AppLayout'
import {
  RequireAuth,
  RequireGuest,
  RequirePendingCode,
  RequireSignedInBare,
  RequireVerifiedPhone,
} from './guards'
import { paths } from './paths'

/**
 * Route table.
 *
 * Every screen is lazily loaded, so each area of the product ships its own
 * chunk. Three groups:
 *
 *   guest      — the landing and the auth flow, each with the guard that makes
 *                a reload or a pasted URL land somewhere sensible
 *   signed in  — everything inside `AppLayout`, which supplies the nav chrome
 *   bare       — the calculating screen: signed in, but no chrome
 */

const LandingPage = lazy(() => import('@/pages/auth/LandingPage'))
const PhonePage = lazy(() => import('@/pages/auth/PhonePage'))
const CodePage = lazy(() => import('@/pages/auth/CodePage'))
const BirthDetailsPage = lazy(() => import('@/pages/auth/BirthDetailsPage'))
const CalculatingPage = lazy(() => import('@/pages/auth/CalculatingPage'))
const PastInsightPage = lazy(() => import('@/pages/onboarding/PastInsightPage'))
const YourPastPage = lazy(() => import('@/pages/onboarding/YourPastPage'))

const AskPage = lazy(() => import('@/pages/ask/AskPage'))
const ChatHistoryPage = lazy(() => import('@/pages/ask/ChatHistoryPage'))
const ChartPage = lazy(() => import('@/pages/chart/ChartPage'))
const ChartDetailPage = lazy(() => import('@/pages/chart/ChartDetailPage'))
const ChartDetailUnlockPage = lazy(() => import('@/pages/chart/ChartDetailUnlockPage'))
const ChartDetailPayPage = lazy(() => import('@/pages/chart/ChartDetailPayPage'))
const ChartDetailViewPage = lazy(() => import('@/pages/chart/ChartDetailViewPage'))
const ReadingsPage = lazy(() => import('@/pages/readings/ReadingsPage'))
const ReadingDetailPage = lazy(() => import('@/pages/readings/ReadingDetailPage'))
const EverythingPage = lazy(() => import('@/pages/everything/EverythingPage'))
const FeaturePage = lazy(() => import('@/pages/everything/FeaturePage'))
const MatchingPage = lazy(() => import('@/pages/matching/MatchingPage'))
const MatchProfilePickPage = lazy(() => import('@/pages/matching/MatchProfilePickPage'))
const ManglikDoshaPage = lazy(() => import('@/pages/matching/ManglikDoshaPage'))
const CompatibilityPage = lazy(() => import('@/pages/matching/CompatibilityPage'))
const HoroscopePage = lazy(() => import('@/pages/horoscope/HoroscopePage'))
const HoroscopeFlow = lazy(() => import('@/pages/horoscope/HoroscopeFlow'))
const HoroscopeReadingsPage = lazy(() => import('@/pages/horoscope/HoroscopeReadingsPage'))
const CalculatorHubPage = lazy(() => import('@/pages/calculator/CalculatorHubPage'))
const CalculatorFormPage = lazy(() => import('@/pages/calculator/CalculatorFormPage'))
const CalculatorResultPage = lazy(() => import('@/pages/calculator/CalculatorResultPage'))
const ReportsHubPage = lazy(() => import('@/pages/reports/ReportsHubPage'))
const ReportIntroPage = lazy(() => import('@/pages/reports/ReportIntroPage'))
const ReportFormPage = lazy(() => import('@/pages/reports/ReportFormPage'))
const ReportPayPage = lazy(() => import('@/pages/reports/ReportPayPage'))
const ReportViewPage = lazy(() => import('@/pages/reports/ReportViewPage'))
const CalendarPage = lazy(() => import('@/pages/calendar/CalendarPage'))
const FestivalDetailPage = lazy(() => import('@/pages/calendar/FestivalDetailPage'))
const PanchangPage = lazy(() => import('@/pages/panchang/PanchangPage'))
const AccountPage = lazy(() => import('@/pages/account/AccountPage'))
const ProfilePage = lazy(() => import('@/pages/account/ProfilePage'))
const FoundationPage = lazy(() => import('@/pages/foundation/FoundationPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

/** Route-level fallback. Named work, not a bare spinner. */
function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas">
      <LoadingState variant="calculating" label="Opening Cyklos…" />
    </div>
  )
}

function page(element: ReactNode) {
  return <Suspense fallback={<Loading />}>{element}</Suspense>
}

const routes: RouteObject[] = [
  // ── Signed out ──────────────────────────────────────────────
  {
    path: paths.landing,
    element: page(
      <RequireGuest>
        <LandingPage />
      </RequireGuest>,
    ),
  },
  {
    // A2 / C2 — signup's entry.
    path: paths.signUp,
    element: page(
      <RequireGuest>
        <PhonePage intent="sign-up" />
      </RequireGuest>,
    ),
  },
  {
    // B2 / D2 — the same screen, entered to sign in.
    path: paths.signIn,
    element: page(
      <RequireGuest>
        <PhonePage intent="sign-in" />
      </RequireGuest>,
    ),
  },
  {
    // A3 / B3 / C3 / D3
    path: paths.verify,
    element: page(
      <RequirePendingCode>
        <CodePage />
      </RequirePendingCode>,
    ),
  },
  {
    // A4 / C4 — signup only; a returning account never sees it.
    path: paths.birthDetails,
    element: page(
      <RequireVerifiedPhone>
        <BirthDetailsPage />
      </RequireVerifiedPhone>,
    ),
  },
  {
    // A5 — signed in, but deliberately without nav chrome.
    path: paths.calculating,
    element: page(
      <RequireSignedInBare>
        <CalculatingPage />
      </RequireSignedInBare>,
    ),
  },
  {
    // Post-signup Past Insight — once only; bare celestial chrome.
    path: paths.onboardingPast,
    element: page(
      <RequireSignedInBare>
        <PastInsightPage />
      </RequireSignedInBare>,
    ),
  },

  // ── Signed in — shares the nav chrome ───────────────────────
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { path: paths.home, element: <Navigate to={paths.everything} replace /> },
      { path: paths.ask, element: page(<AskPage />) },
      { path: paths.askHistory, element: page(<ChatHistoryPage />) },
      { path: paths.yourPast, element: page(<YourPastPage />) },
      { path: paths.chartDetailView, element: page(<ChartDetailViewPage />) },
      { path: paths.chartDetailPay, element: page(<ChartDetailPayPage />) },
      { path: paths.chartDetailUnlock, element: page(<ChartDetailUnlockPage />) },
      { path: paths.chartDetail, element: page(<ChartDetailPage />) },
      { path: paths.chart, element: page(<ChartPage />) },
      { path: paths.readings, element: page(<ReadingsPage />) },
      { path: paths.reading(), element: page(<ReadingDetailPage />) },
      { path: paths.everything, element: page(<EverythingPage />) },
      { path: paths.explore(), element: page(<FeaturePage />) },
      { path: paths.matching, element: page(<MatchingPage />) },
      { path: paths.matchingProfiles, element: page(<MatchProfilePickPage />) },
      { path: paths.matchingManglik, element: page(<ManglikDoshaPage />) },
      { path: paths.compatibility, element: page(<CompatibilityPage />) },
      { path: paths.horoscopeRoot, element: page(<HoroscopeFlow />) },
      { path: paths.horoscopeReadings, element: page(<HoroscopeReadingsPage />) },
      { path: paths.horoscope(), element: page(<HoroscopePage />) },
      { path: paths.calculatorRoot, element: page(<CalculatorHubPage />) },
      { path: paths.calculatorResult(), element: page(<CalculatorResultPage />) },
      { path: paths.calculator(), element: page(<CalculatorFormPage />) },
      { path: paths.reportsRoot, element: page(<ReportsHubPage />) },
      { path: paths.reportView(), element: page(<ReportViewPage />) },
      { path: paths.reportPay(), element: page(<ReportPayPage />) },
      { path: paths.reportForm(), element: page(<ReportFormPage />) },
      { path: paths.reportIntro(), element: page(<ReportIntroPage />) },
      { path: paths.calendar, element: page(<CalendarPage />) },
      { path: paths.calendarFestival(), element: page(<FestivalDetailPage />) },
      { path: paths.panchang, element: page(<PanchangPage />) },
      { path: paths.account, element: page(<AccountPage />) },
      { path: paths.profile, element: page(<ProfilePage />) },
    ],
  },

  // ── Development ─────────────────────────────────────────────
  { path: paths.foundation, element: page(<FoundationPage />) },

  { path: '*', element: page(<NotFoundPage />) },
]

export const router = createBrowserRouter(routes)
