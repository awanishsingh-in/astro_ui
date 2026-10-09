export type PushReminderKind = 'festival' | 'vrat' | 'muhurat' | 'other'

export type PushReminderTiming = 'day-of' | 'day-before'

export interface PushReminder {
  id: string
  title: string
  dateIso: string
  whenLabel: string
  kind: PushReminderKind
  /** When to fire relative to the event date. */
  timing: PushReminderTiming
  /** Preferred local time from account notifications, e.g. "08:00". */
  notifyAt: string
  savedAt: string
}

const KEY = 'cyklos_push_reminders'

type RemindersMap = Record<string, PushReminder[]>

function readMap(): RemindersMap {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as RemindersMap
    }
    return {}
  } catch {
    return {}
  }
}

function writeMap(map: RemindersMap): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    // noop
  }
}

export function listPushReminders(userId: string): PushReminder[] {
  if (!userId) return []
  return readMap()[userId] ?? []
}

/**
 * Save an in-app push reminder. Backend will deliver the notification later;
 * for now we persist locally so the preference is ready to sync.
 */
export function addPushReminder(
  userId: string,
  reminder: Omit<PushReminder, 'id' | 'savedAt'>,
): { ok: boolean; already?: boolean; reminder?: PushReminder } {
  if (!userId) return { ok: false }
  const map = readMap()
  const existing = map[userId] ?? []
  const duplicate = existing.some(
    (row) =>
      row.title === reminder.title &&
      row.dateIso === reminder.dateIso &&
      row.timing === reminder.timing,
  )
  if (duplicate) return { ok: true, already: true }

  const next: PushReminder = {
    ...reminder,
    id: `push_${Date.now().toString(36)}`,
    savedAt: new Date().toISOString(),
  }
  map[userId] = [next, ...existing]
  writeMap(map)
  return { ok: true, reminder: next }
}

export function removePushReminder(userId: string, reminderId: string): boolean {
  if (!userId) return false
  const map = readMap()
  const existing = map[userId] ?? []
  const next = existing.filter((row) => row.id !== reminderId)
  if (next.length === existing.length) return false
  map[userId] = next
  writeMap(map)
  return true
}

export function timingLabel(timing: PushReminderTiming): string {
  return timing === 'day-before' ? 'Day before' : 'Morning of the day'
}
