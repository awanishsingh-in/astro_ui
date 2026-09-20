import type { RashiName } from '@/types/astrology'
import { RASHIS } from '@/utils/astro'

/** The nine horoscope lenses on the immersive hub. */
export type HoroscopeThemeId =
  | 'general'
  | 'love'
  | 'career'
  | 'health'
  | 'finance'
  | 'lucky'
  | 'yearly'
  | 'tomorrow'
  | 'rashifal'

export type HoroscopePeriod = 'daily' | 'weekly' | 'monthly'

export const HOROSCOPE_THEMES: {
  id: HoroscopeThemeId
  label: string
  hint: string
}[] = [
  { id: 'general', label: 'General', hint: 'The day as a whole' },
  { id: 'love', label: 'Love', hint: 'Partnership & Shukra' },
  { id: 'career', label: 'Career', hint: 'Work & standing' },
  { id: 'health', label: 'Health', hint: 'Body & routine' },
  { id: 'finance', label: 'Finance', hint: 'Wealth & gains' },
  { id: 'lucky', label: 'Lucky', hint: 'Number, colour, hours' },
  { id: 'yearly', label: 'Yearly', hint: 'The year ahead' },
  { id: 'tomorrow', label: 'Tomorrow', hint: 'Next day to plan' },
  { id: 'rashifal', label: 'Rashifal', hint: 'By moon sign' },
]

export interface HoroscopeDateChip {
  id: string
  iso: string
  dayNum: number
  weekday: string
  monthShort: string
  label: string
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function toIso(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Build the date chips for the selected period (fits a full-width grid). */
export function buildHoroscopeDateChips(
  period: HoroscopePeriod,
  anchor = new Date(),
): HoroscopeDateChip[] {
  const base = startOfDay(anchor)
  const chips: HoroscopeDateChip[] = []

  if (period === 'daily') {
    // ~3 weeks so the strip can be dragged past “today”.
    for (let i = -7; i <= 14; i += 1) {
      const d = new Date(base)
      d.setDate(base.getDate() + i)
      chips.push(chipFromDate(d, 'daily'))
    }
  } else if (period === 'weekly') {
    // Start of week (Sunday) for each of ~8 weeks.
    const sunday = new Date(base)
    sunday.setDate(base.getDate() - base.getDay())
    for (let i = -1; i <= 6; i += 1) {
      const d = new Date(sunday)
      d.setDate(sunday.getDate() + i * 7)
      chips.push(chipFromDate(d, 'weekly'))
    }
  } else {
    for (let i = -1; i <= 5; i += 1) {
      const d = new Date(base.getFullYear(), base.getMonth() + i, 1)
      chips.push(chipFromDate(d, 'monthly'))
    }
  }

  return chips
}

function chipFromDate(d: Date, period: HoroscopePeriod): HoroscopeDateChip {
  const iso = toIso(d)
  const dayNum = d.getDate()
  const weekday = d.toLocaleDateString('en-IN', { weekday: 'short' })
  const monthShort = d.toLocaleDateString('en-IN', { month: 'short' })
  let label = String(dayNum)
  if (period === 'weekly') {
    label = `${dayNum}`
  }
  if (period === 'monthly') {
    label = monthShort.slice(0, 3)
  }
  return { id: `${period}-${iso}`, iso, dayNum, weekday, monthShort, label }
}

export interface SignHoroscopeSummary {
  rashi: RashiName
  english: string
  theme: HoroscopeThemeId
  period: HoroscopePeriod
  dateLabel: string
  headline: string
  summary: string
  bullets: string[]
  mood: string
}

const THEME_LINE: Record<HoroscopeThemeId, string> = {
  general: 'The chart favours steady moves over sudden turns.',
  love: 'Partnership reads clearer when you speak plainly.',
  career: 'Work gains from focus on one thread, not ten.',
  health: 'Routine and rest outweigh a dramatic reset.',
  finance: 'Hold the purse for impulse; plan one real spend.',
  lucky: 'Luck here is rhythm — hours and colour from your lords.',
  yearly: 'The year opens with patience; later months carry more push.',
  tomorrow: 'Tomorrow rewards what you prepare quietly today.',
  rashifal: 'Read by moon sign — same sky, different house emphasis.',
}

/**
 * Lightweight by-sign summary for the hub (no full kundli required).
 */
export function buildSignHoroscopeSummary(
  rashi: RashiName,
  theme: HoroscopeThemeId,
  period: HoroscopePeriod,
  dateIso: string,
): SignHoroscopeSummary {
  const meta = RASHIS.find((r) => r.name === rashi)!
  const d = new Date(`${dateIso}T12:00:00`)
  const dateLabel =
    period === 'monthly'
      ? d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      : period === 'weekly'
        ? `Week of ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
        : d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })

  const periodWord =
    period === 'daily' ? 'Today' : period === 'weekly' ? 'This week' : 'This month'

  return {
    rashi,
    english: meta.english,
    theme,
    period,
    dateLabel,
    headline: `${periodWord} for ${meta.english}`,
    summary: `${THEME_LINE[theme]} For ${meta.english} (${rashi}), the sky asks for care with timing rather than force.`,
    bullets: [
      `Lead with what ${meta.english} already does well — do not stretch into every house at once.`,
      period === 'daily'
        ? 'Keep the middle of the day for decisions; evenings for review.'
        : period === 'weekly'
          ? 'Mid-week carries more traction than the weekend edges.'
          : 'The first fortnight sets the tone; the second consolidates.',
      theme === 'lucky'
        ? 'Favour soft metals and muted greens where you choose colour.'
        : 'Name one watch-out and one opening — leave the rest.',
    ],
    mood: theme === 'love' || theme === 'lucky' ? 'Warm' : theme === 'career' ? 'Focused' : 'Steady',
  }
}

/** Map hub theme + period → existing HoroscopeKind for the detail page. */
export function themeToKind(
  theme: HoroscopeThemeId,
  period: HoroscopePeriod,
): string {
  if (theme === 'general') return period
  if (theme === 'tomorrow') return 'tomorrow'
  if (theme === 'yearly') return period === 'daily' ? 'yearly' : 'yearly'
  if (theme === 'lucky') return 'lucky'
  if (theme === 'rashifal') return 'rashifal'
  return theme
}
