import type { ChartProfile } from '@/data/profiles'

/**
 * Saved charts and the one currently being read, kept in `localStorage`.
 *
 * Separate from the auth store because these outlive a session: signing out
 * should not lose the charts you have saved for your family.
 */

const PROFILES_KEY = 'cyklos.profiles'
const SELECTED_KEY = 'cyklos.selectedProfile'

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
    // Storage unavailable — the change simply does not survive a reload.
  }
}

/** `null` means the key has never been written, so the seed should be used. */
export function loadProfiles(): ChartProfile[] | null {
  return read<ChartProfile[] | null>(PROFILES_KEY, null)
}

export function saveProfiles(profiles: ChartProfile[]): void {
  write(PROFILES_KEY, profiles)
}

export function loadSelected(): string {
  return read<string>(SELECTED_KEY, 'self')
}

export function saveSelected(id: string): void {
  write(SELECTED_KEY, id)
}
