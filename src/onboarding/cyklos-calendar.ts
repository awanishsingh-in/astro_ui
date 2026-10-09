export interface CyklosCalendarEvent {
  id: string
  title: string
  dateIso: string
  whenLabel: string
  savedAt: string
}

const KEY = 'cyklos_calendar_events'

type EventsMap = Record<string, CyklosCalendarEvent[]>

function readMap(): EventsMap {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as EventsMap
    }
    return {}
  } catch {
    return {}
  }
}

function writeMap(map: EventsMap): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    // noop
  }
}

export function listCyklosCalendarEvents(userId: string): CyklosCalendarEvent[] {
  if (!userId) return []
  return readMap()[userId] ?? []
}

/** Save an event into the in-app Cyklos calendar (sync / export — not push reminders). */
export function addCyklosCalendarEvent(
  userId: string,
  event: Omit<CyklosCalendarEvent, 'id' | 'savedAt'>,
): { ok: boolean; already?: boolean } {
  if (!userId) return { ok: false }
  const map = readMap()
  const existing = map[userId] ?? []
  const duplicate = existing.some(
    (row) => row.title === event.title && row.dateIso === event.dateIso,
  )
  if (duplicate) return { ok: true, already: true }

  const next: CyklosCalendarEvent = {
    ...event,
    id: `cal_${Date.now().toString(36)}`,
    savedAt: new Date().toISOString(),
  }
  map[userId] = [next, ...existing]
  writeMap(map)
  return { ok: true }
}
