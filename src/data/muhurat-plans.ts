/**
 * Personalized muhurat download plans — demo unlocks in localStorage.
 * ₹49 = one download · ₹399 = unlimited for 30 days.
 */

import { MUHURAT_HOME_GROUPS, type MuhuratPurposeId } from '@/data/panchang-mock'

const PLAN_KEY = 'cyklos_muhurat_plan'
const RECENT_KEY = 'cyklos_muhurat_recent'
const VIEWED_KEY = 'cyklos_muhurat_viewed'
const MAX_VIEWED = 12

export type MuhuratPlanKind = 'single' | 'unlimited'

export interface MuhuratPlanState {
  /** Active paid plan, if any. */
  kind: MuhuratPlanKind | null
  /** For unlimited — epoch ms when access ends. */
  unlimitedUntil?: number
  /** For single — whether the one download was used. */
  singleUsed?: boolean
}

export interface MuhuratRecentDownload {
  purposeId: MuhuratPurposeId
  label: string
  dateIso: string
  downloadedAt: number
}

/** Occasions the user opened via Find your muhurat (view history). */
export interface MuhuratViewedItem {
  purposeId: MuhuratPurposeId
  label: string
  group?: string
  location: string
  dateIso: string
  viewedAt: number
}

export const MUHURAT_PLAN_SINGLE_PRICE = 49
export const MUHURAT_PLAN_UNLIMITED_PRICE = 399
export const MUHURAT_UNLIMITED_DAYS = 30

export interface MuhuratDownloadOption {
  id: MuhuratPurposeId
  label: string
  group: string
}

/** Purposes users can pick to download after payment. */
export const MUHURAT_DOWNLOAD_OPTIONS: MuhuratDownloadOption[] = MUHURAT_HOME_GROUPS.flatMap(
  (group) =>
    group.items.map((item) => ({
      id: item.id,
      label: item.label,
      group: group.title,
    })),
)

type PlanMap = Record<string, MuhuratPlanState>
type RecentMap = Record<string, MuhuratRecentDownload>
type ViewedMap = Record<string, MuhuratViewedItem[]>

function readPlanMap(): PlanMap {
  try {
    const raw = window.localStorage.getItem(PLAN_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as PlanMap
    }
    return {}
  } catch {
    return {}
  }
}

function writePlanMap(map: PlanMap) {
  try {
    window.localStorage.setItem(PLAN_KEY, JSON.stringify(map))
  } catch {
    // noop
  }
}

function readRecentMap(): RecentMap {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as RecentMap
    }
    return {}
  } catch {
    return {}
  }
}

function writeRecentMap(map: RecentMap) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(map))
  } catch {
    // noop
  }
}

function readViewedMap(): ViewedMap {
  try {
    const raw = window.localStorage.getItem(VIEWED_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as ViewedMap
    }
    return {}
  } catch {
    return {}
  }
}

function writeViewedMap(map: ViewedMap) {
  try {
    window.localStorage.setItem(VIEWED_KEY, JSON.stringify(map))
  } catch {
    // noop
  }
}

export function getMuhuratPlan(userId: string): MuhuratPlanState {
  if (!userId) return { kind: null }
  const state = readPlanMap()[userId]
  if (!state) return { kind: null }
  if (state.kind === 'unlimited') {
    if (!state.unlimitedUntil || state.unlimitedUntil <= Date.now()) {
      return { kind: null }
    }
  }
  return state
}

export function hasUnlimitedMuhurat(userId: string): boolean {
  const plan = getMuhuratPlan(userId)
  return plan.kind === 'unlimited' && Boolean(plan.unlimitedUntil && plan.unlimitedUntil > Date.now())
}

/** Sticky CTA stays for free users and ₹49 (even after one download). Hidden for active ₹399. */
export function showMuhuratPersonalizedCta(userId: string): boolean {
  return !hasUnlimitedMuhurat(userId)
}

export function purchaseMuhuratPlan(userId: string, kind: MuhuratPlanKind): MuhuratPlanState {
  if (!userId) return { kind: null }
  const map = readPlanMap()
  const next: MuhuratPlanState =
    kind === 'unlimited'
      ? {
          kind: 'unlimited',
          unlimitedUntil: Date.now() + MUHURAT_UNLIMITED_DAYS * 24 * 60 * 60 * 1000,
          singleUsed: false,
        }
      : { kind: 'single', singleUsed: false }
  map[userId] = next
  writePlanMap(map)
  return next
}

export function getMuhuratRecent(userId: string): MuhuratRecentDownload | null {
  if (!userId) return null
  return readRecentMap()[userId] ?? null
}

export function getMuhuratViewed(userId: string): MuhuratViewedItem[] {
  if (!userId) return []
  const list = readViewedMap()[userId]
  return Array.isArray(list) ? list : []
}

/** Push a viewed occasion to the front of the user's recent list. */
export function recordMuhuratView(
  userId: string,
  item: Omit<MuhuratViewedItem, 'viewedAt'>,
): MuhuratViewedItem[] {
  if (!userId) return []
  const map = readViewedMap()
  const prev = Array.isArray(map[userId]) ? map[userId]! : []
  const nextItem: MuhuratViewedItem = { ...item, viewedAt: Date.now() }
  const deduped = prev.filter(
    (row) =>
      !(
        row.purposeId === item.purposeId &&
        row.label === item.label &&
        row.dateIso === item.dateIso &&
        row.location === item.location
      ),
  )
  const next = [nextItem, ...deduped].slice(0, MAX_VIEWED)
  map[userId] = next
  writeViewedMap(map)
  return next
}

/**
 * Record a download. ₹49 can only succeed once; ₹399 always allowed while active.
 * Returns false if the single plan already used its download.
 */
export function recordMuhuratDownload(
  userId: string,
  purposeId: MuhuratPurposeId,
  label: string,
  dateIso: string,
): { ok: boolean; reason?: string } {
  if (!userId) return { ok: false, reason: 'Sign in required' }
  const plan = getMuhuratPlan(userId)
  if (!plan.kind) return { ok: false, reason: 'No active plan' }
  if (plan.kind === 'single' && plan.singleUsed) {
    return { ok: false, reason: 'Your ₹49 plan allows one download. Upgrade for unlimited.' }
  }

  const recent: MuhuratRecentDownload = {
    purposeId,
    label,
    dateIso,
    downloadedAt: Date.now(),
  }
  const recentMap = readRecentMap()
  recentMap[userId] = recent
  writeRecentMap(recentMap)

  if (plan.kind === 'single') {
    const map = readPlanMap()
    map[userId] = { ...plan, singleUsed: true }
    writePlanMap(map)
  }

  return { ok: true }
}

export function formatInr(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}
