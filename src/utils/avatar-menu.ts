/** Session flag so Back from Profile reopens the avatar account menu. */
export const REOPEN_AVATAR_MENU_KEY = 'cyklos_reopen_avatar_menu'

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
