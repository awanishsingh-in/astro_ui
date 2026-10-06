/**
 * Kundli Matching access:
 * - First Check match is free.
 * - Then ₹99 unlocks unlimited matching for 30 days (demo, localStorage).
 */

const USED_KEY = 'cyklos_match_free_used'
const UNLIMITED_KEY = 'cyklos_match_unlimited_until'

type UsedMap = Record<string, true>
type UnlimitedMap = Record<string, number>

export const MATCH_CHECK_PRICE = 99
/** Length of the paid unlimited window. */
export const MATCH_UNLIMITED_DAYS = 30

function readUsed(): UsedMap {
  try {
    const raw = window.localStorage.getItem(USED_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as UsedMap
    }
    return {}
  } catch {
    return {}
  }
}

function writeUsed(map: UsedMap): void {
  try {
    window.localStorage.setItem(USED_KEY, JSON.stringify(map))
  } catch {
    // noop
  }
}

function readUnlimited(): UnlimitedMap {
  try {
    const raw = window.localStorage.getItem(UNLIMITED_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as UnlimitedMap
    }
    return {}
  } catch {
    return {}
  }
}

function writeUnlimited(map: UnlimitedMap): void {
  try {
    window.localStorage.setItem(UNLIMITED_KEY, JSON.stringify(map))
  } catch {
    // noop
  }
}

/** True once this account has completed their free match. */
export function hasUsedFreeMatch(userId: string): boolean {
  if (!userId) return false
  return Boolean(readUsed()[userId])
}

export function markFreeMatchUsed(userId: string): void {
  if (!userId) return
  const map = readUsed()
  map[userId] = true
  writeUsed(map)
}

/** Active paid window for unlimited matching. */
export function hasUnlimitedMatchAccess(userId: string): boolean {
  if (!userId) return false
  const until = readUnlimited()[userId]
  if (!until || typeof until !== 'number') return false
  return until > Date.now()
}

/** Expiry timestamp (ms) if unlimited is active. */
export function getUnlimitedMatchUntil(userId: string): number | null {
  if (!userId) return null
  const until = readUnlimited()[userId]
  if (!until || typeof until !== 'number' || until <= Date.now()) return null
  return until
}

/** Grant / extend unlimited matching for MATCH_UNLIMITED_DAYS from now. */
export function grantUnlimitedMatchAccess(userId: string): void {
  if (!userId) return
  const map = readUnlimited()
  const from = Math.max(Date.now(), map[userId] ?? 0)
  map[userId] = from + MATCH_UNLIMITED_DAYS * 24 * 60 * 60 * 1000
  writeUnlimited(map)
}

/** @deprecated use grantUnlimitedMatchAccess — kept for older call sites. */
export function grantMatchCheckPass(userId: string): void {
  grantUnlimitedMatchAccess(userId)
}

export function clearMatchCheckPass(): void {
  // No session pass anymore; paid access lives in localStorage.
}

/** Whether the user can start Check match without paying right now. */
export function canStartMatchCheck(userId: string): boolean {
  if (!userId) return false
  return !hasUsedFreeMatch(userId) || hasUnlimitedMatchAccess(userId)
}

export function formatMatchCheckInr(n = MATCH_CHECK_PRICE) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

export function formatUnlimitedExpiry(userId: string): string | null {
  const until = getUnlimitedMatchUntil(userId)
  if (!until) return null
  return new Date(until).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
