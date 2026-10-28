import { useCallback, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { NebulaBackground } from '@/components/celestial/NebulaBackground'
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
    pathname === paths.yourPast ||
    pathname.startsWith(`${paths.yourPast}/`) ||
    pathname === paths.profile ||
    pathname.startsWith(`${paths.profile}/`) ||
    pathname === paths.matching ||
    pathname.startsWith(`${paths.matching}/`) ||
    pathname === paths.horoscopeRoot ||
    pathname.startsWith(`${paths.horoscopeRoot}/`) ||
    pathname === paths.calculatorRoot ||
    pathname.startsWith(`${paths.calculatorRoot}/`)
  )
}

function CosmicAtmosphere() {
  return <NebulaBackground />
}

/**
 * The signed-in shell.
 *
 * Desktop: vertical SideNav + page. Mobile: page + BottomNav.
 * Immersive routes hide both and show a slim back + logo bar.
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
      <div className="relative flex min-h-dvh min-w-0 flex-col bg-transparent lg:h-dvh lg:max-h-dvh lg:overflow-hidden">
        <CosmicAtmosphere />

        <FullPageChrome user={user} />

        <main
          key={location.pathname}
          className="min-h-0 min-w-0 flex-1 animate-fade-in overflow-y-auto overscroll-contain"
        >
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-dvh min-w-0 bg-transparent lg:h-dvh lg:max-h-dvh lg:overflow-hidden">
      <CosmicAtmosphere />

      <SideNav user={user} collapsed={collapsed} onToggleCollapse={toggleCollapse} />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <main
          key={location.pathname}
          className="min-h-0 min-w-0 flex-1 animate-rise overflow-y-auto overscroll-contain"
        >
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
