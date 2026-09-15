import { createContext, useContext } from 'react'
import type { AppLanguage, BirthDetails, NotificationPreference, User } from '@/types/user'

/** Which button the user pressed on the landing screen. Copy differs; flow does not. */
export type AuthIntent = 'sign-up' | 'sign-in'

export interface PendingVerification {
  phone: string
  intent: AuthIntent
  /** The demo code the "SMS" carried. A real backend never sends this. */
  code: string
  /** True when this phone already has a completed account. */
  isReturning: boolean
}

export interface AuthApi {
  user: User | null
  isSignedIn: boolean
  /** True until the stored session has been read — guards must not redirect yet. */
  isLoading: boolean

  /** Set after `sendCode`, cleared once verified or abandoned. */
  pending: PendingVerification | null
  /** Set after a successful `verifyCode` when the phone has no account yet. */
  verifiedPhone: string | null
  /**
   * True between `completeSignup` and the end of the calculating screen.
   *
   * Without it the birth-details guard would see a signed-in user the instant
   * the account is created and bounce straight to Home, racing — and beating —
   * the navigation to the calculating screen.
   */
  signupComplete: boolean

  sendCode: (phone: string, intent: AuthIntent) => Promise<PendingVerification>
  /**
   * Resolves to the signed-in user, or null when signup still needs birth
   * details. Sign-in with no account throws — that page is signup-only.
   */
  verifyCode: (code: string) => Promise<User | null>
  /** Finishes signup: creates the account, persists it and signs in. */
  completeSignup: (details: BirthDetails) => Promise<User>

  /**
   * Replaces the birth details and recalculates the chart.
   *
   * Readings are deliberately untouched — an answer belongs to the period and
   * the chart it was read from, and rewriting history would make the citations
   * in it false.
   */
  updateBirthDetails: (details: BirthDetails) => Promise<User>

  /** Language, notifications and the rest of the account preferences. */
  updatePreferences: (patch: {
    language?: AppLanguage
    notifications?: NotificationPreference
  }) => void
  /** Called when the calculating screen finishes, releasing the flow to Home. */
  finishSignup: () => void
  signOut: () => void
  /** Wipes stored accounts so the signup flow can be replayed from scratch. */
  resetDemo: () => void
}

export const AuthContext = createContext<AuthApi | null>(null)

export function useAuth(): AuthApi {
  const api = useContext(AuthContext)
  if (!api) throw new Error('useAuth must be used inside <AuthProvider>.')
  return api
}
