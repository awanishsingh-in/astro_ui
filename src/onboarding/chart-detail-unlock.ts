/**
 * Detailed kundli report unlock — demo, localStorage, per user + profile.
 */

const KEY = 'cyklos_chart_detail_unlocked'

type UnlockMap = Record<string, Record<string, true>>

function readMap(): UnlockMap {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as UnlockMap
    }
    return {}
  } catch {
    return {}
  }
}

function writeMap(map: UnlockMap): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    // noop
  }
}

export function hasChartDetailUnlocked(userId: string, profileId: string): boolean {
  if (!userId || !profileId) return false
  return Boolean(readMap()[userId]?.[profileId])
}

export function unlockChartDetail(userId: string, profileId: string): void {
  if (!userId || !profileId) return
  const map = readMap()
  map[userId] = { ...(map[userId] ?? {}), [profileId]: true }
  writeMap(map)
}

/** Price for the detailed kundli report (demo). */
export const CHART_DETAIL_PRICE = 799

export function formatChartDetailInr(n = CHART_DETAIL_PRICE) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}
