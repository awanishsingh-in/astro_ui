/**
 * Paid reports unlock — demo, localStorage only, per user.
 */

const REPORTS_KEY = 'cyklos_reports_unlocked'

type UnlockMap = Record<string, Record<string, true>>

function readMap(): UnlockMap {
  try {
    const raw = window.localStorage.getItem(REPORTS_KEY)
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
    window.localStorage.setItem(REPORTS_KEY, JSON.stringify(map))
  } catch {
    // noop
  }
}

export function hasReportUnlocked(userId: string, reportId: string): boolean {
  if (!userId || !reportId) return false
  return Boolean(readMap()[userId]?.[reportId])
}

export function unlockReport(userId: string, reportId: string): void {
  if (!userId || !reportId) return
  const map = readMap()
  map[userId] = { ...(map[userId] ?? {}), [reportId]: true }
  writeMap(map)
}

export function listUnlockedReports(userId: string): string[] {
  if (!userId) return []
  return Object.keys(readMap()[userId] ?? {})
}

/** Draft person for the report checkout — survives form → pay → view. */
const DRAFT_KEY = 'cyklos_report_draft'

export interface ReportDraft {
  reportId: string
  name: string
  gender: string
  date: string
  time: string
  placeLabel: string
  placeLat: number
  placeLng: number
  placeTz: string
  profileId?: string
}

export function saveReportDraft(draft: ReportDraft): void {
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // noop
  }
}

export function readReportDraft(): ReportDraft | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ReportDraft
  } catch {
    return null
  }
}

export function clearReportDraft(): void {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // noop
  }
}
