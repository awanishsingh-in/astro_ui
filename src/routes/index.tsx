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
const ReadingsPage = lazy(() => import('@/pages/readings/ReadingsPage'))
const ReadingDetailPage = lazy(() => import('@/pages/readings/ReadingDetailPage'))
const EverythingPage = lazy(() => import('@/pages/everything/EverythingPage'))
const FeaturePage = lazy(() => import('@/pages/everything/FeaturePage'))
const MatchingPage = lazy(() => import('@/pages/matching/MatchingPage'))
const CompatibilityPage = lazy(() => import('@/pages/matching/CompatibilityPage'))
const HoroscopePage = lazy(() => import('@/pages/horoscope/HoroscopePage'))
const CalendarPage = lazy(() => import('@/pages/calendar/CalendarPage'))
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
      { path: paths.chart, element: page(<ChartPage />) },
      { path: paths.readings, element: page(<ReadingsPage />) },
      { path: paths.reading(), element: page(<ReadingDetailPage />) },
      { path: paths.everything, element: page(<EverythingPage />) },
      { path: paths.explore(), element: page(<FeaturePage />) },
      { path: paths.matching, element: page(<MatchingPage />) },
      { path: paths.compatibility, element: page(<CompatibilityPage />) },
      { path: paths.horoscope(), element: page(<HoroscopePage />) },
      { path: paths.calendar, element: page(<CalendarPage />) },
      { path: paths.account, element: page(<AccountPage />) },
      { path: paths.profile, element: page(<ProfilePage />) },
    ],
  },

  // ── Development ─────────────────────────────────────────────
  { path: paths.foundation, element: page(<FoundationPage />) },

  { path: '*', element: page(<NotFoundPage />) },
]

export const router = createBrowserRouter(routes)
