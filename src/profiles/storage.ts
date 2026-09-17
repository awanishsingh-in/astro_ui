import type { ChartProfile } from '@/data/profiles'

/**
 * Saved charts and the one currently being read, kept in `localStorage`.
 *
 * Keyed by account id so each signed-in user keeps their own family charts,
 * and signing out / in restores them.
 */

const LEGACY_PROFILES_KEY = 'cyklos.profiles'
const LEGACY_SELECTED_KEY = 'cyklos.selectedProfile'

function profilesKey(userId: string) {
  return `cyklos.profiles.${userId}`
}

function selectedKey(userId: string) {
  return `cyklos.selectedProfile.${userId}`
}

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

/**
 * Load this account's saved charts.
 * `null` means nothing stored yet (start empty — no demo seed).
 */
export function loadProfiles(userId: string): ChartProfile[] | null {
  const keyed = read<ChartProfile[] | null>(profilesKey(userId), null)
  if (keyed) return keyed

  // One-time migrate from the pre–per-user key so existing demos keep charts.
  const legacy = read<ChartProfile[] | null>(LEGACY_PROFILES_KEY, null)
  if (legacy) {
    write(profilesKey(userId), legacy)
    return legacy
  }
  return null
}

export function saveProfiles(userId: string, profiles: ChartProfile[]): void {
  write(profilesKey(userId), profiles)
}

export function loadSelected(userId: string): string {
  const keyed = read<string | null>(selectedKey(userId), null)
  if (keyed) return keyed
  return read<string>(LEGACY_SELECTED_KEY, 'self')
}

export function saveSelected(userId: string, id: string): void {
  write(selectedKey(userId), id)
}
