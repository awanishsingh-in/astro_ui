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

export type HoroscopeVerticalId =
  | 'career'
  | 'love'
  | 'health'
  | 'finance'
  | 'lucky'
  | 'focus'
  | 'family'
  | 'growth'

export interface SignHoroscopeVertical {
  id: HoroscopeVerticalId
  label: string
  blurb: string
  /** 0–100 display score for the hub card. */
  score: number
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
  /** Career / Love / Health / Finance columns for the hub card. */
  verticals: SignHoroscopeVertical[]
  mood: string
}

const THEME_LINE: Record<HoroscopeThemeId, string> = {
  general: 'Slow beats sudden today — pick one move and stick with it.',
  love: 'Say it plain. Soft hints get lost.',
  career: 'One thread of work beats a piled desk.',
  health: 'Sleep and a short walk win over a dramatic reset.',
  finance: 'One planned spend. Leave the impulse cart.',
  lucky: 'Your colour and hours matter more than a hunch.',
  yearly: 'Patience first; push later in the year.',
  tomorrow: 'Prep quietly today — tomorrow pays you back.',
  rashifal: 'Same sky, different house — read by your moon sign.',
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

  const spanCue =
    period === 'daily'
      ? 'today'
      : period === 'weekly'
        ? 'this week'
        : 'this month'

  return {
    rashi,
    english: meta.english,
    theme,
    period,
    dateLabel,
    headline: `${periodWord} for ${meta.english}`,
    summary:
      period === 'daily'
        ? `${THEME_LINE[theme]} For ${meta.english} (${rashi}), timing beats force — lean in where the score is high, and hold back where the chart is thin. Keep the middle of the day for the one decision that matters; leave evenings for review, not for reopening closed loops. A quiet hour or a short walk will do more for you than a packed calendar.`
        : period === 'weekly'
          ? `${THEME_LINE[theme]} For ${meta.english} (${rashi}), timing beats force — lean in where the score is high, and hold back where the chart is thin. Mid-week holds the real traction; keep weekend edges light so Monday isn’t spent undoing Friday’s stretch. One clear win for the week beats five half-started threads.`
          : `${THEME_LINE[theme]} For ${meta.english} (${rashi}), timing beats force — lean in where the score is high, and hold back where the chart is thin. The first fortnight sets the tone; the second consolidates if you stay steady. Name one priority for the month and protect it — depth beats dabbling.`,
    bullets: [
      `Lead with what ${meta.english} already does well. Don’t stretch into every lane at once.`,
      period === 'daily'
        ? 'Keep decisions for mid-day. Soften the evening. Skip the late-night spiral.'
        : period === 'weekly'
          ? 'Mid-week for push. Soft weekends. One clear win is enough.'
          : 'First half builds standing. Second half locks it in — don’t reboot mid-month.',
      period === 'daily'
        ? 'One clear ask of the day beats five half-started threads.'
        : period === 'weekly'
          ? 'Name one push and one pause for the week — leave the rest.'
          : 'Pick one habit and one boundary for the month. Depth over noise.',
      period === 'daily'
        ? 'If love or money asks for attention, keep the answer short and clear.'
        : 'Protect sleep and one real conversation. The rest can wait.',
      theme === 'lucky'
        ? 'Favour soft metals and muted greens if you choose a colour.'
        : 'Watch the house the chart is stressing — guard sleep, spend, and sharp words there.',
    ],
    verticals: [
      {
        id: 'career',
        label: 'Career',
        score: verticalScore(rashi, period, dateIso, 'career'),
        blurb:
          period === 'daily'
            ? `One clear work thread beats a crowded desk for ${meta.english} ${spanCue}.`
            : period === 'weekly'
              ? `Push mid-week. Soft-pedal the weekend for ${meta.english}.`
              : `First half sets standing — consolidate, don’t relaunch.`,
      },
      {
        id: 'love',
        label: 'Love',
        score: verticalScore(rashi, period, dateIso, 'love'),
        blurb:
          period === 'daily'
            ? `Say it straight — soft hints get lost ${spanCue}.`
            : period === 'weekly'
              ? `Small check-ins warm things up; save the heavy talk.`
              : `Show up steady. One clear ask beats a grand gesture.`,
      },
      {
        id: 'health',
        label: 'Health',
        score: verticalScore(rashi, period, dateIso, 'health'),
        blurb:
          period === 'daily'
            ? `Sleep + a short walk beat any dramatic reset ${spanCue}.`
            : period === 'weekly'
              ? `Pace the middle days. Rest is part of the plan.`
              : `One habit you can keep. Drop what you can’t.`,
      },
      {
        id: 'finance',
        label: 'Finance',
        score: verticalScore(rashi, period, dateIso, 'finance'),
        blurb:
          period === 'daily'
            ? `One planned outlay. Leave the impulse cart alone ${spanCue}.`
            : period === 'weekly'
              ? `Check one bill mid-week. Skip speculative moves.`
              : `Tight first fortnight — freer room opens if you stay steady.`,
      },
      {
        id: 'lucky',
        label: 'Lucky',
        score: verticalScore(rashi, period, dateIso, 'lucky'),
        blurb:
          period === 'daily'
            ? `Trust your hours and colour more than a random hunch ${spanCue}.`
            : period === 'weekly'
              ? `Luck rides rhythm this week — stack small wins, not jackpots.`
              : `Pick one lucky lane for the month and stick with it.`,
      },
      {
        id: 'focus',
        label: 'Focus',
        score: verticalScore(rashi, period, dateIso, 'focus'),
        blurb:
          period === 'daily'
            ? `Guard one quiet hour — that’s the real win for ${meta.english} ${spanCue}.`
            : period === 'weekly'
              ? `Block deep work mid-week. Meetings can wait.`
              : `One priority for the month. Everything else is noise.`,
      },
      {
        id: 'family',
        label: 'Family',
        score: verticalScore(rashi, period, dateIso, 'family'),
        blurb:
          period === 'daily'
            ? `A short check-in lands better than a long lecture ${spanCue}.`
            : period === 'weekly'
              ? `Keep home talk light mid-week; save big chats for softer days.`
              : `Presence over performance — show up once, clearly.`,
      },
      {
        id: 'growth',
        label: 'Growth',
        score: verticalScore(rashi, period, dateIso, 'growth'),
        blurb:
          period === 'daily'
            ? `Learn one thing well. Don’t open five tabs ${spanCue}.`
            : period === 'weekly'
              ? `Skill over stretch — finish one lesson before starting two.`
              : `Pick one craft for the month. Depth beats dabbling.`,
      },
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

/** Map an area lane → the horoscope kind we fetch for the detail pane. */
export function verticalToKind(
  id: HoroscopeVerticalId,
  period: HoroscopePeriod,
): string {
  switch (id) {
    case 'focus':
      return period
    case 'family':
      return 'love'
    case 'growth':
      return 'career'
    default:
      return id
  }
}

/** Stable 50–100 score so the hub cards feel lively without a live API. */
function verticalScore(
  rashi: RashiName,
  period: HoroscopePeriod,
  dateIso: string,
  area: HoroscopeVerticalId,
): number {
  const rashiI = Math.max(0, RASHIS.findIndex((r) => r.name === rashi))
  const day = Number(dateIso.slice(-2)) || 1
  const periodW = period === 'daily' ? 1 : period === 'weekly' ? 3 : 5
  const areaW: Record<HoroscopeVerticalId, number> = {
    career: 7,
    love: 11,
    health: 13,
    finance: 17,
    lucky: 19,
    focus: 23,
    family: 29,
    growth: 31,
  }
  const raw = 58 + ((rashiI * 9 + day * periodW + areaW[area] * 5) % 43)
  return Math.min(100, Math.round(raw / 5) * 5)
}
