import type { User } from '@/types/user'

/**
 * The demo's persistence layer.
 *
 * Two keys, both in `localStorage`:
 *   cyklos.accounts  — every account that has completed signup, by phone.
 *                      This is what lets a returning user sign in with only a
 *                      code, skipping birth details.
 *   cyklos.session   — the phone of whoever is currently signed in.
 *
 * When a real backend arrives, `accounts` is replaced by the server and
 * `session` by a token. Nothing above this file reads `localStorage` directly.
 */

const ACCOUNTS_KEY = 'cyklos.accounts'
const SESSION_KEY = 'cyklos.session'

type AccountMap = Record<string, User>

/** Private-mode and disabled-storage browsers throw. Never let that break the app. */
function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage unavailable — the session simply does not survive a reload.
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Nothing to do.
  }
}

export function loadAccounts(): AccountMap {
  return read<AccountMap>(ACCOUNTS_KEY, {})
}

export function findAccount(phone: string): User | null {
  return loadAccounts()[phone] ?? null
}

export function saveAccount(user: User): void {
  const accounts = loadAccounts()
  accounts[user.phone] = user
  write(ACCOUNTS_KEY, accounts)
}

export function loadSession(): User | null {
  const phone = read<string | null>(SESSION_KEY, null)
  return phone ? findAccount(phone) : null
}

export function saveSession(user: User): void {
  write(SESSION_KEY, user.phone)
}

export function clearSession(): void {
  remove(SESSION_KEY)
}

/** Used by the account-reset control so the signup flow can be replayed. */
export function clearEverything(): void {
  remove(SESSION_KEY)
  remove(ACCOUNTS_KEY)
}
