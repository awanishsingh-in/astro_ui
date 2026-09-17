import {
  Bell,
  CircleHelp,
  CircleUserRound,
  Diamond,
  Gift,
  HeartHandshake,
  Languages,
  LogOut,
  MoonStar,
  Settings2,
  Sparkles,
  UserPlus,
  Users,
  WandSparkles,
} from 'lucide-react'
import type { ReactElement } from 'react'
import type { NavItem } from '@/types/ui'
import { paths } from './paths'

/**
 * Mobile bottom bar — Ask first, then the main product tabs.
 * Desktop side rail lists Ask on top and every primary feature under it.
 */
export const primaryNav: NavItem[] = [
  { id: 'ask', label: 'Ask', to: paths.ask, icon: <WandSparkles /> },
  { id: 'kundli', label: 'Kundli', to: paths.chart, icon: <Diamond /> },
  { id: 'match', label: 'Match', to: paths.matching, icon: <HeartHandshake /> },
  { id: 'horoscope', label: 'Horoscope', to: paths.horoscope('daily'), icon: <MoonStar /> },
  { id: 'tools', label: 'All', to: paths.everything, icon: <Sparkles /> },
]

/** Profile stays under the avatar on desktop; on mobile it lives in Account. */
export const profileNavItem: NavItem = {
  id: 'profile',
  label: 'Profile',
  to: paths.profile,
  icon: <CircleUserRound />,
}

/** @deprecated Prefer primaryNav — kept for foundation demos that expect five tabs. */
export const desktopNav = primaryNav.filter((item) => item.id !== 'ask')

export interface AccountMenuItem {
  id: string
  label: string
  icon: ReactElement
  /**
   * Opens an account panel popup when set.
   * Prefer this over `to` for profile / settings / languages / help.
   */
  panel?:
    | 'profile'
    | 'settings'
    | 'languages'
    | 'help'
    | 'upgrade-plan'
    | 'usage'
    | 'billing'
    | 'terms'
    | 'policies'
    | 'privacy'
  /** Navigates when set and no panel is used. */
  to?: string
  /** Not built yet — the menu reports this rather than looking dead. */
  pending?: boolean
  tone?: 'default' | 'critical'
}

/**
 * What the avatar menu offers.
 * Live items open as popups so they never replace the current page.
 */
export const accountMenu: AccountMenuItem[] = [
  { id: 'profile', label: 'Profile', icon: <CircleUserRound />, to: paths.profile },
  { id: 'add-profile', label: 'Add profile', icon: <UserPlus /> },
  { id: 'profiles', label: 'Saved profiles', icon: <Users />, pending: true },
  { id: 'notifications', label: 'Notifications', icon: <Bell />, pending: true },
  { id: 'upgrade-plan', label: 'Upgrade plan', icon: <Sparkles />, panel: 'upgrade-plan' },
  { id: 'referrals', label: 'Refer a friend', icon: <Gift />, pending: true },
  { id: 'languages', label: 'Languages', icon: <Languages />, panel: 'languages' },
  { id: 'settings', label: 'Settings', icon: <Settings2 />, panel: 'settings' },
  { id: 'help', label: 'Get help', icon: <CircleHelp />, panel: 'help' },
]

/** Sign out sits apart from the list — it is the only destructive entry. */
export const signOutItem: AccountMenuItem = {
  id: 'sign-out',
  label: 'Sign out',
  icon: <LogOut />,
  tone: 'critical',
}
