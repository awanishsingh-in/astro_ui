import { useCallback, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components/navigation/BottomNav'
import { FullPageChrome } from '@/components/navigation/FullPageChrome'
import { SideNav } from '@/components/navigation/SideNav'
import { useAuth } from '@/auth/auth-context'
import { paths } from '@/routes/paths'

const SIDEBAR_KEY = 'cyklos_sidenav_collapsed'

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_KEY) === '1'
  } catch {
    return false
  }
}

/** Routes that take the full viewport — no side rail, no bottom tabs. */
function isImmersivePath(pathname: string): boolean {
  return (
    pathname === paths.chart ||
    pathname.startsWith(`${paths.chart}/`) ||
    pathname === paths.yourPast ||
    pathname.startsWith(`${paths.yourPast}/`) ||
    pathname === paths.profile ||
    pathname.startsWith(`${paths.profile}/`)
  )
}

/**
 * The signed-in shell.
 *
 * Desktop: vertical SideNav + page. Mobile: page + BottomNav.
 * Immersive routes (My Chart, Your Past, Profile) hide both and show a slim back + logo bar.
 */
export function AppLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const immersive = isImmersivePath(location.pathname)

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0')
      } catch {
        // Storage unavailable — preference lasts for this session only.
      }
      return next
    })
  }, [])

  if (!user) return null

  if (immersive) {
    return (
      <div className="relative flex min-h-dvh flex-col bg-transparent lg:h-dvh lg:max-h-dvh lg:overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -left-24 top-[-10%] h-[55vmin] w-[55vmin] rounded-full bg-deep-burgundy/40 blur-3xl" />
          <div className="absolute -right-16 top-[20%] h-[42vmin] w-[42vmin] rounded-full bg-copper-shadow/25 blur-3xl" />
          <div className="absolute bottom-[-15%] left-[30%] h-[48vmin] w-[48vmin] rounded-full bg-nebula-plum/35 blur-3xl" />
        </div>

        <FullPageChrome user={user} />

        <main
          key={location.pathname}
          className="min-h-0 flex-1 animate-fade-in overflow-y-auto overscroll-contain"
        >
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-dvh bg-transparent lg:h-dvh lg:max-h-dvh lg:overflow-hidden">
      {/* Ambient nebula wash behind the signed-in shell */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-24 top-[-10%] h-[55vmin] w-[55vmin] rounded-full bg-deep-burgundy/40 blur-3xl" />
        <div className="absolute -right-16 top-[20%] h-[42vmin] w-[42vmin] rounded-full bg-copper-shadow/25 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[30%] h-[48vmin] w-[48vmin] rounded-full bg-nebula-plum/35 blur-3xl" />
      </div>

      <SideNav user={user} collapsed={collapsed} onToggleCollapse={toggleCollapse} />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
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
