/**
 * Daily muhurat type cards — hub + detail pages on the Muhurat tab.
 * Copy is original Cyklos mock text (structure inspired by classic day almanacs).
 */

export type DailyMuhuratId =
  | 'abhijit'
  | 'choghadiya'
  | 'do-ghati'
  | 'lagna'
  | 'shubha-horai'
  | 'panchaka-rahita'
  | 'jain-pachchakkhan'
  | 'pancha-pakshi'

export interface DailyMuhuratCard {
  id: DailyMuhuratId
  title: string
  blurb: string
  /** One-line summary shown on the collapsed card. */
  summary: string
  accent: string
}

export interface DailyMuhuratWindow {
  label: string
  range: string
  note?: string
  good?: boolean
}

export interface DailyMuhuratDetail {
  id: DailyMuhuratId
  title: string
  /** Primary window shown in the hero. */
  primaryRange: string
  durationLabel: string
  weekdayLabel: string
  summary: string
  about: string[]
  note: string
  windows: DailyMuhuratWindow[]
  related: DailyMuhuratId[]
}

export const DAILY_MUHURAT_CARDS: DailyMuhuratCard[] = [
  {
    id: 'abhijit',
    title: 'Abhijit Muhurat',
    blurb: 'Midday victory window',
    summary: 'Best for starts and quiet travel near midday.',
    accent: 'from-[#BF8466]/30 to-[#6E4234]/20',
  },
  {
    id: 'choghadiya',
    title: 'Choghadiya Muhurat',
    blurb: 'Day & night pockets',
    summary: 'Amrit and Shubh pockets flagged for new work.',
    accent: 'from-primary/30 to-secondary/20',
  },
  {
    id: 'do-ghati',
    title: 'Do Ghati Muhurat',
    blurb: 'Two-ghati stretches',
    summary: 'Short ~48 min slots for quick rites.',
    accent: 'from-[#6E4234]/30 to-[#6E4234]/20',
  },
  {
    id: 'lagna',
    title: 'Lagna Muhurat',
    blurb: 'Rising-sign windows',
    summary: 'Rising signs for vivah and griha pravesh.',
    accent: 'from-info/30 to-secondary/15',
  },
  {
    id: 'shubha-horai',
    title: 'Shubha Horai',
    blurb: 'Planetary hora guide',
    summary: 'Jupiter and Venus horas preferred today.',
    accent: 'from-[#E6BC9F]/35 to-[#BF8466]/20',
  },
  {
    id: 'panchaka-rahita',
    title: 'Panchaka Rahita Muhurat',
    blurb: 'Clear of panchaka',
    summary: 'Clear stretches outside panchaka faults.',
    accent: 'from-primary/25 to-[#6E4234]/20',
  },
  {
    id: 'jain-pachchakkhan',
    title: 'Jain Pachchakkhan',
    blurb: 'Vow & fasting times',
    summary: 'Morning and evening vow windows listed.',
    accent: 'from-[#6E4234]/25 to-primary/20',
  },
  {
    id: 'pancha-pakshi',
    title: 'Pancha Pakshi Activities',
    blurb: 'Five-bird activity map',
    summary: 'Eating and ruling activities look favourable.',
    accent: 'from-[#BF8466]/25 to-secondary/20',
  },
]

const ABOUT: Record<DailyMuhuratId, string[]> = {
  abhijit: [
    'Abhijit is the middle slice of the fifteen equal parts between sunrise and sunset — a short midday window traditionally used for beginnings that need a clean start.',
    'Because sunrise and sunset shift with the season and your city, the exact clock times move each day. Cyklos recomputes them from the local panchang.',
    'It is often treated as a powerful general-purpose muhurat. Still skip it for marriage and upanayana on Wednesdays in most schools, when the window is considered malefic.',
  ],
  choghadiya: [
    'Choghadiya divides day and night into eight named pockets — Amrit, Shubh, Labh, Char, and their avoid counterparts.',
    'Use the good pockets for new work and travel; keep Kaal, Roga, and Udvega for rest or finishing chores.',
    'Night choghadiya continues after sunset until the next sunrise, so evening plans still have a map.',
  ],
  'do-ghati': [
    'Do Ghati marks two-ghati stretches (about forty-eight minutes) that many almanacs flag as workable for short rites.',
    'They sit inside the wider day limbs, so always cross-check Rahu and Yamaganda before you lock a plan.',
  ],
  lagna: [
    'Lagna muhurat follows the rising zodiac sign on the eastern horizon through the day.',
    'Auspicious lagna windows are commonly used for vivah, griha pravesh, and other chart-sensitive starts.',
  ],
  'shubha-horai': [
    'Hora (horai) assigns each hour after sunrise to a planet in a fixed weekday order.',
    'Jupiter, Venus, and Mercury horas are often preferred for counsel, purchases, and messages; Saturn and Mars hours suit repairs or caution.',
  ],
  'panchaka-rahita': [
    'Panchaka rahita lists the stretches of the day that fall outside the five panchaka faults.',
    'Good muhurat pockets here are safer for travel and new work; labelled panchaka blocks are better left alone.',
  ],
  'jain-pachchakkhan': [
    'Pachchakkhan times mark traditional vow and fasting windows used in Jain practice.',
    'Morning and evening slots follow local sunrise and sunset — treat them as guidance, not a substitute for your sangh’s custom.',
  ],
  'pancha-pakshi': [
    'Pancha pakshi maps the day into five bird activities — eating, walking, ruling, sleeping, and dying — used in some South Indian timing systems.',
    'Ruling and eating stretches are usually preferred for starts; sleeping windows favour rest.',
  ],
}

const PRIMARY: Record<
  DailyMuhuratId,
  { range: string; duration: string; windows: DailyMuhuratWindow[] }
> = {
  abhijit: {
    range: '11:48 AM to 12:36 PM',
    duration: 'Duration 00 Hours 48 Mins',
    windows: [
      { label: 'Abhijit', range: '11:48 AM – 12:36 PM', good: true, note: 'Primary midday window' },
    ],
  },
  choghadiya: {
    range: '10:44 AM to 12:16 PM',
    duration: 'Next good pocket · Amrit',
    windows: [
      { label: 'Amrit', range: '10:44 AM – 12:16 PM', good: true },
      { label: 'Shubh', range: '01:48 PM – 03:20 PM', good: true },
      { label: 'Kaal', range: '12:16 PM – 01:48 PM', note: 'Avoid journeys' },
      { label: 'Labh', range: '07:40 AM – 09:12 AM', good: true },
    ],
  },
  'do-ghati': {
    range: '07:12 AM to 08:00 AM',
    duration: 'Duration 00 Hours 48 Mins',
    windows: [
      { label: 'Morning', range: '07:12 AM – 08:00 AM', good: true },
      { label: 'Afternoon', range: '02:04 PM – 02:52 PM', good: true },
    ],
  },
  lagna: {
    range: '06:08 AM to 08:22 AM',
    duration: 'Current · Kanya lagna',
    windows: [
      { label: 'Kanya lagna', range: '06:08 AM – 08:22 AM', good: true },
      { label: 'Tula lagna', range: '08:22 AM – 10:40 AM' },
      { label: 'Vrishchika lagna', range: '10:40 AM – 01:05 PM', good: true },
    ],
  },
  'shubha-horai': {
    range: '07:08 AM to 08:08 AM',
    duration: 'Jupiter hora · 60 mins',
    windows: [
      { label: 'Jupiter hora', range: '07:08 AM – 08:08 AM', good: true, note: 'Study & counsel' },
      { label: 'Venus hora', range: '10:08 AM – 11:08 AM', good: true, note: 'Purchases & art' },
      { label: 'Saturn hora', range: '06:08 AM – 07:08 AM', note: 'Repairs only' },
    ],
  },
  'panchaka-rahita': {
    range: '06:56 AM to 09:16 AM',
    duration: 'Clear of panchaka',
    windows: [
      { label: 'Good muhurat', range: '06:56 AM – 09:16 AM', good: true },
      { label: 'Good muhurat', range: '01:20 PM – 03:40 PM', good: true },
      { label: 'Roga panchaka', range: '09:16 AM – 11:40 AM', note: 'Skip new beginnings' },
    ],
  },
  'jain-pachchakkhan': {
    range: '06:08 AM to 08:30 AM',
    duration: 'Morning vow window',
    windows: [
      { label: 'Morning vow', range: '06:08 AM – 08:30 AM', good: true },
      { label: 'Evening vow', range: '05:40 PM – 07:10 PM', good: true },
    ],
  },
  'pancha-pakshi': {
    range: '06:08 AM to 09:40 AM',
    duration: 'Eating activity',
    windows: [
      { label: 'Eating', range: '06:08 AM – 09:40 AM', good: true },
      { label: 'Walking', range: '09:40 AM – 01:20 PM' },
      { label: 'Ruling', range: '01:20 PM – 04:50 PM', good: true },
      { label: 'Sleeping', range: '04:50 PM – 06:22 PM', note: 'Rest preferred' },
    ],
  },
}

const RELATED: Record<DailyMuhuratId, DailyMuhuratId[]> = {
  abhijit: ['choghadiya', 'lagna', 'shubha-horai', 'panchaka-rahita'],
  choghadiya: ['abhijit', 'shubha-horai', 'do-ghati', 'panchaka-rahita'],
  'do-ghati': ['abhijit', 'choghadiya', 'lagna', 'shubha-horai'],
  lagna: ['abhijit', 'choghadiya', 'shubha-horai', 'pancha-pakshi'],
  'shubha-horai': ['choghadiya', 'abhijit', 'lagna', 'do-ghati'],
  'panchaka-rahita': ['abhijit', 'choghadiya', 'lagna', 'shubha-horai'],
  'jain-pachchakkhan': ['abhijit', 'panchaka-rahita', 'choghadiya', 'lagna'],
  'pancha-pakshi': ['lagna', 'shubha-horai', 'choghadiya', 'abhijit'],
}

export function buildDailyMuhuratDetail(
  id: DailyMuhuratId,
  dateIso: string,
): DailyMuhuratDetail {
  const card = DAILY_MUHURAT_CARDS.find((c) => c.id === id)!
  const primary = PRIMARY[id]
  const weekdayLabel = new Date(`${dateIso}T12:00:00`).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return {
    id,
    title: card.title,
    primaryRange: primary.range,
    durationLabel: primary.duration,
    weekdayLabel,
    summary: card.blurb,
    about: ABOUT[id],
    note: 'Times use 12-hour notation for your city. The Hindu day runs sunrise to sunrise — windows after midnight belong to the next civil date.',
    windows: primary.windows,
    related: RELATED[id],
  }
}

export function dailyMuhuratTitle(id: DailyMuhuratId) {
  return DAILY_MUHURAT_CARDS.find((c) => c.id === id)?.title ?? 'Muhurat'
}

export function dailyMuhuratBlurb(id: DailyMuhuratId) {
  return DAILY_MUHURAT_CARDS.find((c) => c.id === id)?.blurb ?? ''
}
