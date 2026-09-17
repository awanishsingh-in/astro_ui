import { useCallback, useMemo, useState, type ReactNode } from 'react'
import * as auth from '@/services/auth.service'
import type { AppLanguage, BirthDetails, NotificationPreference, User } from '@/types/user'
import {
  AuthContext,
  type AuthApi,
  type AuthIntent,
  type PendingVerification,
} from './auth-context'
import { clearEverything, clearSession, saveAccount, saveSession, loadSession } from './storage'
import { resetPastIntroForUser } from '@/onboarding/past-intro'

/**
 * Holds the demo's authentication state and keeps it in `localStorage`.
 *
 * The flow has three stages and each is a distinct piece of state, so a guard
 * can tell them apart:
 *   pending        — a code has been sent, not yet verified
 *   verifiedPhone  — the code was right but this phone has no account yet
 *   user           — signed in
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  /*
    Read synchronously in the initialiser rather than in an effect: the first
    render already knows whether someone is signed in, so a returning user
    never sees the landing screen flash before the redirect.

    `isLoading` stays in the API because a real backend will need it — here the
    read is synchronous, so it is false from the start.
  */
  const [user, setUser] = useState<User | null>(() => loadSession())
  const [pending, setPending] = useState<PendingVerification | null>(null)
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null)
  const [signupComplete, setSignupComplete] = useState(false)
  const isLoading = false

  const sendCode = useCallback(async (phone: string, intent: AuthIntent) => {
    const { code, isReturning } = await auth.sendCode(phone)
    const next: PendingVerification = { phone, intent, code, isReturning }
    setPending(next)
    setVerifiedPhone(null)
    return next
  }, [])

  const verifyCode = useCallback(
    async (code: string) => {
      if (!pending) {
        throw new Error('There is no code to verify. Start from your mobile number.')
      }

      const { user: existing } = await auth.verifyCode(pending.phone, code, pending.code)

      if (existing) {
        // A returning account — nothing is re-entered.
        saveSession(existing)
        setUser(existing)
        setPending(null)
        setVerifiedPhone(null)
        return existing
      }

      // Sign-in never creates an account. Birth details are signup-only.
      if (pending.intent === 'sign-in') {
        setPending(null)
        throw new Error('No account for this number yet. Create an account to continue.')
      }

      // Verified signup, but no account yet: birth details come next.
      setVerifiedPhone(pending.phone)
      return null
    },
    [pending],
  )

  const completeSignup = useCallback(
    async (details: BirthDetails) => {
      const phone = verifiedPhone ?? pending?.phone
      if (!phone) {
        throw new Error('Confirm your mobile number before adding birth details.')
      }

      const created = await auth.createAccount(phone, details)
      saveAccount(created)
      saveSession(created)
      // Always show Know Your Past once after this signup, even if this browser
      // skipped it during an earlier test account.
      resetPastIntroForUser(created.id)
      setUser(created)
      setPending(null)
      setVerifiedPhone(null)
      setSignupComplete(true)
      return created
    },
    [verifiedPhone, pending],
  )

  const updateBirthDetails = useCallback(
    async (details: BirthDetails) => {
      if (!user) throw new Error('Nobody is signed in.')
      const updated = await auth.recalculate(user, details)
      saveAccount(updated)
      saveSession(updated)
      setUser(updated)
      return updated
    },
    [user],
  )

  const updatePhoto = useCallback(
    async (photoUrl: string | null) => {
      if (!user) throw new Error('Nobody is signed in.')
      const updated = { ...user, photoUrl: photoUrl || null }
      saveAccount(updated)
      saveSession(updated)
      setUser(updated)
      return updated
    },
    [user],
  )

  const updatePreferences = useCallback(
    (patch: { language?: AppLanguage; notifications?: NotificationPreference }) => {
      setUser((current) => {
        if (!current) return current
        const updated = { ...current, ...patch }
        saveAccount(updated)
        return updated
      })
    },
    [],
  )

  const finishSignup = useCallback(() => setSignupComplete(false), [])

  const signOut = useCallback(() => {
    clearSession()
    setUser(null)
    setPending(null)
    setVerifiedPhone(null)
    setSignupComplete(false)
  }, [])

  const resetDemo = useCallback(() => {
    clearEverything()
    setUser(null)
    setPending(null)
    setVerifiedPhone(null)
    setSignupComplete(false)
  }, [])

  const value = useMemo<AuthApi>(
    () => ({
      user,
      isSignedIn: user !== null,
      isLoading,
      pending,
      verifiedPhone,
      signupComplete,
      sendCode,
      verifyCode,
      completeSignup,
      updateBirthDetails,
      updatePhoto,
      updatePreferences,
      finishSignup,
      signOut,
      resetDemo,
    }),
    [
      user,
      isLoading,
      pending,
      verifiedPhone,
      signupComplete,
      sendCode,
      verifyCode,
      completeSignup,
      updateBirthDetails,
      updatePhoto,
      updatePreferences,
      finishSignup,
      signOut,
      resetDemo,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
