/**
 * Display formatting. Every degree, date and time in the product goes through
 * here so the typography of data stays identical across screens.
 */

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** `20°41′` — the canonical way a position is shown. */
export function formatDegree(degree: number, minute: number): string {
  return `${pad(degree)}°${pad(minute)}′`
}

/** `23°46′09″` — used for the ayanamsa, which carries arc-seconds. */
export function formatArc(degree: number, minute: number, second: number): string {
  return `${pad(degree)}°${pad(minute)}′${pad(second)}″`
}

/** `2 Sep 1994` */
export function formatDateShort(iso: string): string {
  const d = parseISO(iso)
  if (!d) return iso
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

/** `2 September 1994` */
export function formatDateLong(iso: string): string {
  const d = parseISO(iso)
  if (!d) return iso
  return `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`
}

/** `Monday, 7 September` — the Home date line. */
export function formatDayAndDate(iso: string): string {
  const d = parseISO(iso)
  if (!d) return iso
  return `${DAYS_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS_LONG[d.getMonth()]}`
}

/** `Jul 2014` — dasha range endpoints. */
export function formatMonthYear(iso: string): string {
  const d = parseISO(iso)
  if (!d) return iso
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

/** `Jul 2014 → Jul 2030` */
export function formatPeriod(startIso: string, endIso: string): string {
  return `${formatMonthYear(startIso)} → ${formatMonthYear(endIso)}`
}

/** `06:40 AM` from a 24h `"06:40"`. */
export function formatTime12(time24: string): string {
  const [hRaw, m = '00'] = time24.split(':')
  const h = Number(hRaw)
  if (Number.isNaN(h)) return time24
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${pad(hour)}:${m} ${suffix}`
}

/** `2:14 pm` — timestamps in reading lists. */
export function formatClock(iso: string): string {
  const d = parseISO(iso)
  if (!d) return iso
  const h = d.getHours()
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${pad(d.getMinutes())} ${suffix}`
}

/**
 * `Today, 2:14 pm` / `31 August` — list rows say "today" and otherwise fall
 * back to the date, which is how the reference lists read.
 */
export function formatRelativeDay(iso: string, now = new Date()): string {
  const d = parseISO(iso)
  if (!d) return iso
  if (isSameDay(d, now)) return `Today, ${formatClock(iso)}`
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (isSameDay(d, yesterday)) return `Yesterday, ${formatClock(iso)}`
  return `${d.getDate()} ${MONTHS_LONG[d.getMonth()]}`
}

/** `+91 98765 43210` from E.164. Indian numbers only for now. */
export function formatPhone(e164: string): string {
  const digits = e164.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  if (digits.length === 10) return `${digits.slice(0, 5)} ${digits.slice(5)}`
  return e164
}

/** `22.08°N 82.15°E` */
export function formatCoordinates(latitude: number, longitude: number, precision = 2): string {
  const ns = latitude >= 0 ? 'N' : 'S'
  const ew = longitude >= 0 ? 'E' : 'W'
  return `${Math.abs(latitude).toFixed(precision)}°${ns} ${Math.abs(longitude).toFixed(precision)}°${ew}`
}

/** `PS` — the avatar monogram. */
export function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** `4 replies` / `1 reply` */
export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}

/** `0:28` — the resend countdown. */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  return `${Math.floor(s / 60)}:${pad(s % 60)}`
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function parseISO(iso: string): Date | null {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * `Good evening` — the greeting Home opens with, from the local clock.
 * Split at 12 and 17, which is where English usage actually turns.
 */
export function greetingFor(date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/** `Pallavi` — the name a greeting uses. */
export function firstNameOf(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName
}
