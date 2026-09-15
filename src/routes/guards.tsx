import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LoadingState } from '@/components/common/LoadingState'
import { useAuth } from '@/auth/auth-context'
import { paths } from './paths'

/** Shown for the frame it takes to read the stored session. */
function Booting() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas">
      <LoadingState variant="calculating" label="Opening Cyklos…" />
    </div>
  )
}

/** The app. Signed-out visitors are sent to the landing screen. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <Booting />
  if (!isSignedIn) return <Navigate to={paths.landing} replace state={{ from: location.pathname }} />
  return <>{children}</>
}

/** Auth screens. A signed-in user is sent straight to Ask. */
export function RequireGuest({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoading } = useAuth()

  if (isLoading) return <Booting />
  if (isSignedIn) return <Navigate to={paths.ask} replace />
  return <>{children}</>
}

/**
 * The code screen. Reachable only while a code is outstanding — a reload or a
 * direct link lands back on the number instead of an empty screen.
 */
export function RequirePendingCode({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoading, pending } = useAuth()

  if (isLoading) return <Booting />
  if (isSignedIn) return <Navigate to={paths.ask} replace />
  if (!pending) return <Navigate to={paths.signUp} replace />
  return <>{children}</>
}

/**
 * Birth details. Reachable only once a code has been verified for a phone that
 * has no account yet.
 */
export function RequireVerifiedPhone({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoading, verifiedPhone, signupComplete } = useAuth()

  if (isLoading) return <Booting />
  // Signup just finished: the chart is drawn before Home, so this branch has
  // to come first — otherwise the `isSignedIn` rule below would skip it.
  if (signupComplete) return <Navigate to={paths.calculating} replace />
  if (isSignedIn) return <Navigate to={paths.ask} replace />
  if (!verifiedPhone) return <Navigate to={paths.signUp} replace />
  return <>{children}</>
}

/**
 * The calculating screen. The account exists by now, so this needs a signed-in
 * user — but it deliberately sits outside `AppLayout`, with no nav chrome.
 */
export function RequireSignedInBare({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoading } = useAuth()

  if (isLoading) return <Booting />
  if (!isSignedIn) return <Navigate to={paths.landing} replace />
  return <>{children}</>
}
