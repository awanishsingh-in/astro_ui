/** Session flag to reopen the avatar account menu after certain navigations. */
export const REOPEN_AVATAR_MENU_KEY = 'cyklos_reopen_avatar_menu'

/** Open an account panel from anywhere (e.g. Panchang → Downloads history). */
export const OPEN_ACCOUNT_PANEL_EVENT = 'cyklos-open-account-panel'

export type OpenableAccountPanel =
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
  | 'downloads'

export function requestAvatarMenuReopen(): void {
  try {
    sessionStorage.setItem(REOPEN_AVATAR_MENU_KEY, '1')
  } catch {
    // Storage unavailable — menu simply stays closed.
  }
}

export function consumeAvatarMenuReopen(): boolean {
  try {
    if (sessionStorage.getItem(REOPEN_AVATAR_MENU_KEY) !== '1') return false
    sessionStorage.removeItem(REOPEN_AVATAR_MENU_KEY)
    return true
  } catch {
    return false
  }
}

export function requestAccountPanel(panel: OpenableAccountPanel): void {
  window.dispatchEvent(
    new CustomEvent(OPEN_ACCOUNT_PANEL_EVENT, { detail: { panel } }),
  )
}
