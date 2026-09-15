import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components/navigation/BottomNav'
import { SideNav } from '@/components/navigation/SideNav'
import { useAuth } from '@/auth/auth-context'

/**
 * The signed-in shell.
 *
 * Desktop: vertical SideNav + page. Mobile: page + BottomNav.
 * Exactly one primary navigation is visible at each breakpoint.
 */
export function AppLayout() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return null

  return (
    <div className="flex min-h-dvh bg-canvas lg:h-dvh lg:max-h-dvh lg:overflow-hidden">
      <SideNav user={user} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/*
          One page transition for the whole app, keyed on the path — so every
          screen fades in identically instead of each page remembering to bring
          its own animation.
        */}
        <main
          key={location.pathname}
          className="min-h-0 flex-1 animate-fade-in overflow-y-auto overscroll-contain"
        >
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
