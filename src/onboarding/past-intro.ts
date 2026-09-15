/**
 * Know Your Past onboarding + paid chat unlock (demo, localStorage only).
 *
 * Seen state is per user id so a new signup always gets the screen, even if
 * someone else (or an earlier test) skipped it in the same browser.
 */

import type { PastInsightCategory } from '@/data/past-insights'
import { PAST_INSIGHTS } from '@/data/past-insights'

const PAST_INTRO_KEY = 'cyklos_past_intro_seen'
const PAST_SELECTIONS_KEY = 'cyklos_past_selections'
const CHAT_UNLOCK_KEY = 'cyklos_chat_unlocked'

type SeenMap = Record<string, true>
type SelectionsMap = Record<string, PastInsightCategory[]>

function readSeenMap(): SeenMap {
  try {
    const raw = window.localStorage.getItem(PAST_INTRO_KEY)
    if (!raw) return {}
    // Legacy: a single "true" string from the first build — drop it so new
    // signups are not skipped forever on this browser.
    if (raw === 'true') {
      window.localStorage.removeItem(PAST_INTRO_KEY)
      return {}
    }
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as SeenMap
    }
    return {}
  } catch {
    return {}
  }
}

function writeSeenMap(map: SeenMap): void {
  try {
    window.localStorage.setItem(PAST_INTRO_KEY, JSON.stringify(map))
  } catch {
    // Storage unavailable — screen may reappear next session.
  }
}

export function hasSeenPastIntro(userId: string): boolean {
  if (!userId) return false
  return Boolean(readSeenMap()[userId])
}

export function markPastIntroSeen(userId: string): void {
  if (!userId) return
  const map = readSeenMap()
  map[userId] = true
  writeSeenMap(map)
}

/** New signup must always see Know Your Past once. */
export function resetPastIntroForUser(userId: string): void {
  if (!userId) return
  const map = readSeenMap()
  if (!map[userId]) return
  delete map[userId]
  writeSeenMap(map)
}

function readSelectionsMap(): SelectionsMap {
  try {
    const raw = window.localStorage.getItem(PAST_SELECTIONS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as SelectionsMap
    }
    return {}
  } catch {
    return {}
  }
}

function writeSelectionsMap(map: SelectionsMap): void {
  try {
    window.localStorage.setItem(PAST_SELECTIONS_KEY, JSON.stringify(map))
  } catch {
    // Storage unavailable — history may not persist.
  }
}

const VALID_IDS = new Set(PAST_INSIGHTS.map((item) => item.id))

/** Persist the areas chosen on Know Your Past (sidebar history). */
export function savePastSelections(userId: string, ids: PastInsightCategory[]): void {
  if (!userId) return
  const cleaned = ids.filter((id) => VALID_IDS.has(id)).slice(0, 3)
  const map = readSelectionsMap()
  map[userId] = cleaned
  writeSelectionsMap(map)
}

/** Areas the user picked on Know Your Past, if any. */
export function getPastSelections(userId: string): PastInsightCategory[] {
  if (!userId) return []
  const stored = readSelectionsMap()[userId]
  if (!Array.isArray(stored)) return []
  return stored.filter((id): id is PastInsightCategory => VALID_IDS.has(id)).slice(0, 3)
}

export function hasChatUnlocked(userId: string): boolean {
  try {
    const raw = window.localStorage.getItem(CHAT_UNLOCK_KEY)
    if (!raw) return false
    if (raw === 'true') return true
    const parsed = JSON.parse(raw) as SeenMap
    return Boolean(parsed?.[userId])
  } catch {
    return false
  }
}

export function unlockChat(userId: string): void {
  try {
    const raw = window.localStorage.getItem(CHAT_UNLOCK_KEY)
    let map: SeenMap = {}
    if (raw && raw !== 'true') {
      try {
        map = JSON.parse(raw) as SeenMap
      } catch {
        map = {}
      }
    }
    map[userId] = true
    window.localStorage.setItem(CHAT_UNLOCK_KEY, JSON.stringify(map))
  } catch {
    // noop
  }
}

/** Plan unlock — same storage as chat unlock for this demo. */
export const hasActivePlan = hasChatUnlocked
export const unlockPlan = unlockChat
