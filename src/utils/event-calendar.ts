function icsDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, '')
}

function nextDayIso(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`)
  d.setDate(d.getDate() + 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/** Download a single all-day .ics event (Outlook / Apple Calendar). */
export function downloadSimpleEventIcs({
  title,
  dateIso,
  description,
  filename,
}: {
  title: string
  dateIso: string
  description?: string
  filename: string
}): void {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const start = icsDate(dateIso)
  const end = icsDate(nextDayIso(dateIso))
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cyklos//Reminders//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${start}-${title.replace(/\s+/g, '-').toLowerCase()}@cyklos`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeText(title)}`,
    description ? `DESCRIPTION:${escapeText(description)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename.endsWith('.ics') ? filename : `${filename}.ics`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

/** Google Calendar template URL for an all-day event. */
export function googleCalendarUrl({
  title,
  dateIso,
  details,
}: {
  title: string
  dateIso: string
  details?: string
}): string {
  const start = icsDate(dateIso)
  const end = icsDate(nextDayIso(dateIso))
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
  })
  if (details) params.set('details', details)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export interface CalendarEventInput {
  id: string
  title: string
  dateIso: string
  description?: string
}

/** Multi-event .ics — import into Google Calendar (Settings → Import). */
export function downloadEventsIcs(
  events: CalendarEventInput[],
  filename: string,
  calendarName: string,
): void {
  if (events.length === 0) return
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const blocks = events.map((event) => {
    const start = icsDate(event.dateIso)
    const end = icsDate(nextDayIso(event.dateIso))
    return [
      'BEGIN:VEVENT',
      `UID:${event.id}@cyklos`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${escapeText(event.title)}`,
      event.description ? `DESCRIPTION:${escapeText(event.description)}` : '',
      'END:VEVENT',
    ]
      .filter(Boolean)
      .join('\r\n')
  })

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cyklos//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    ...blocks,
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename.endsWith('.ics') ? filename : `${filename}.ics`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
