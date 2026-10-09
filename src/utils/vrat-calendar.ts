import type { VratEntry } from '@/types/astrology'

function icsDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, '')
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function eventBlock(vrat: VratEntry): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const day = icsDate(vrat.date)
  const description = [
    vrat.hinduDate,
    `Tithi: ${vrat.tithiWindow}`,
    `Parana: ${vrat.parana}`,
    `Fast: ${vrat.fastType}`,
    vrat.involves,
  ].join('\\n')

  return [
    'BEGIN:VEVENT',
    `UID:vrat-${vrat.id}@cyklos`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${day}`,
    `SUMMARY:${escapeText(vrat.name)}`,
    `DESCRIPTION:${escapeText(description)}`,
    'END:VEVENT',
  ].join('\r\n')
}

/** Build a .ics calendar file for one or more vrats. */
export function buildVratCalendarIcs(vrats: VratEntry[], calendarName: string): string {
  const events = vrats.map(eventBlock).join('\r\n')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cyklos//Vrats//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    events,
    'END:VCALENDAR',
  ].join('\r\n')
}

/** Trigger a browser download of the vrat calendar. */
export function downloadVratCalendarIcs(
  vrats: VratEntry[],
  filename: string,
  calendarName = 'Cyklos vrats',
): void {
  if (vrats.length === 0) return
  const blob = new Blob([buildVratCalendarIcs(vrats, calendarName)], {
    type: 'text/calendar;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename.endsWith('.ics') ? filename : `${filename}.ics`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
