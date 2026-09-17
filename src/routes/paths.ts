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
  readings: '/readings',
  reading: (id = ':id') => `/readings/${id}`,
  everything: '/everything',
  /** A capability's own page, built from the feature catalogue. */
  explore: (slug = ':slug') => `/explore/${slug}`,

  // Astrology features
  matching: '/matching',
  compatibility: '/compatibility',
  horoscope: (kind = ':kind') => `/horoscope/${kind}`,
  calendar: '/calendar',
  account: '/account',
  /** Full-page profile — identity and birth details. */
  profile: '/profile',

  // Development only
  foundation: '/foundation',
} as const
