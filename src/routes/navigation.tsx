import {
  Bell,
  Cake,
  CircleUserRound,
  Gift,
  HeartHandshake,
  LogOut,
  MessageCircleHeart,
  Orbit,
  Settings2,
  Sparkles,
  Sun,
  Telescope,
  Users,
} from 'lucide-react'
import type { ReactElement } from 'react'
import type { NavItem } from '@/types/ui'
import { paths } from './paths'

/**
 * Mobile bottom bar — Ask first, then the main product tabs.
 * Desktop side rail lists Ask on top and every primary feature under it.
 */
export const primaryNav: NavItem[] = [
  { id: 'ask', label: 'Ask', to: paths.ask, icon: <MessageCircleHeart /> },
  { id: 'kundli', label: 'Kundli', to: paths.chart, icon: <Orbit /> },
  { id: 'match', label: 'Match', to: paths.matching, icon: <HeartHandshake /> },
  { id: 'horoscope', label: 'Horoscope', to: paths.horoscope('daily'), icon: <Sun /> },
  { id: 'tools', label: 'All', to: paths.everything, icon: <Telescope /> },
]

/** Profile stays under the avatar on desktop; on mobile it lives in Account. */
export const profileNavItem: NavItem = {
  id: 'profile',
  label: 'Profile',
  to: paths.account,
  icon: <CircleUserRound />,
}

/** @deprecated Prefer primaryNav — kept for foundation demos that expect five tabs. */
export const desktopNav = primaryNav.filter((item) => item.id !== 'ask')

export interface AccountMenuItem {
  id: string
  label: string
  icon: ReactElement
  /** Navigates when set; otherwise the menu calls its own handler. */
  to?: string
  /** Not built yet — the menu reports this rather than looking dead. */
  pending?: boolean
  tone?: 'default' | 'critical'
}

/**
 * What the avatar menu offers.
 */
export const accountMenu: AccountMenuItem[] = [
  { id: 'profile', label: 'Profile', icon: <CircleUserRound />, to: paths.account },
  { id: 'birth-details', label: 'Birth details', icon: <Cake />, to: paths.account },
  { id: 'profiles', label: 'Saved profiles', icon: <Users />, pending: true },
  { id: 'notifications', label: 'Notifications', icon: <Bell />, pending: true },
  { id: 'subscription', label: 'Subscription', icon: <Sparkles />, pending: true },
  { id: 'referrals', label: 'Refer a friend', icon: <Gift />, pending: true },
  { id: 'preferences', label: 'Preferences', icon: <Settings2 />, to: `${paths.account}?section=preferences` },
]

/** Sign out sits apart from the list — it is the only destructive entry. */
export const signOutItem: AccountMenuItem = {
  id: 'sign-out',
  label: 'Sign out',
  icon: <LogOut />,
  tone: 'critical',
}
