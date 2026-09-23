/**
 * Every route in one place. Nothing in the app writes a URL string by hand —
 * links and redirects read from here, so a path can be renamed once.
 */
export const paths = {
  landing: '/',

  /**
   * Auth — code-based, no password anywhere.
   *
   * Sign-up and sign-in enter at different URLs but share every screen after
   * the first, because the reference draws A2/B2 and A3/B3 as the same screen.
   * The entry URL only carries the intent, which changes the copy and the
   * number of steps promised.
   */
  signUp: '/sign-up',
  signIn: '/sign-in',
  verify: '/verify',
  birthDetails: '/birth-details',
  calculating: '/calculating',
  /** One-time post-signup Past Insight preview before Ask. */
  onboardingPast: '/onboarding/past',
  /** Saved Know Your Past selections — always available in the app shell. */
  yourPast: '/your-past',

  // The app
  home: '/home',
  ask: '/ask',
  /** Full list of past Ask chats — View or Continue each thread. */
  askHistory: '/ask/history',
  chart: '/chart',
  /** Detailed kundli report preview + Get detailed report. */
  chartDetail: '/chart/detail',
  /** Payment required card before the gateway. */
  chartDetailUnlock: '/chart/detail/unlock',
  /** Demo payment gateway for detailed kundli. */
  chartDetailPay: '/chart/detail/pay',
  /** Book-style unlocked detailed kundli. */
  chartDetailView: '/chart/detail/view',
  readings: '/readings',
  reading: (id = ':id') => `/readings/${id}`,
  everything: '/everything',
  /** A capability's own page, built from the feature catalogue. */
  explore: (slug = ':slug') => `/explore/${slug}`,

  // Astrology features
  matching: '/matching',
  /** Pick a saved profile to fill Person 1 or 2 on Matching. */
  matchingProfiles: '/matching/profiles',
  /** Standalone Manglik / Kuja dosha calculator. */
  matchingManglik: '/matching/manglik',
  compatibility: '/compatibility',
  /** Immersive horoscope hub — signs, period, date strip. */
  horoscopeRoot: '/horoscope',
  /** Nine themed readings picker (love, career, …). */
  horoscopeReadings: '/horoscope/readings',
  horoscope: (kind = ':kind') => `/horoscope/${kind}`,
  /** Calculator hub — six chart tools. */
  calculatorRoot: '/calculator',
  /** One calculator birth form. */
  calculator: (kind = ':kind') => `/calculator/${kind}`,
  /** Calculator result detail. */
  calculatorResult: (kind = ':kind') => `/calculator/${kind}/result`,
  /** Paid reports hub — topic cards with Get / Download. */
  reportsRoot: '/reports',
  /** Payment intro for one report. */
  reportIntro: (reportId = ':reportId') => `/reports/${reportId}`,
  /** Birth form before paying for a report. */
  reportForm: (reportId = ':reportId') => `/reports/${reportId}/form`,
  /** Demo payment gateway for a report. */
  reportPay: (reportId = ':reportId') => `/reports/${reportId}/pay`,
  /** Book-style unlocked report. */
  reportView: (reportId = ':reportId') => `/reports/${reportId}/view`,
  calendar: '/calendar',
  /** Full festival editorial page inside Calendar. */
  calendarFestival: (id = ':id') => `/calendar/festival/${id}`,
  /** Daily panchang, timings, muhurat and alerts. */
  panchang: '/panchang',
  account: '/account',
  /** Full-page profile — identity and birth details. */
  profile: '/profile',

  // Development only
  foundation: '/foundation',
} as const
