/**
 * Mock daily panchang, choghadiya, hora and Rahu windows for Panchang & muhurat.
 * Deterministic for a given ISO date so the UI stays stable in demos.
 */

export interface PanchangDayDetail {
  date: string
  weekdayLabel: string
  place: string
  tithi: string
  tithiEnds: string
  nakshatra: string
  nakshatraPada: number
  nakshatraEnds: string
  yoga: string
  yogaEnds: string
  karana: string
  karanaEnds: string
  sunrise: string
  sunset: string
  moonrise: string
  abhijit: string
  brahmaMuhurat: string
  rahuKaal: string
  yamaganda: string
  gulika: string
  durMuhurat: string
  plainWords: string
  alsoOnThisDay: string
  /** 0–1 progress through each limb “right now”. */
  progress: {
    tithi: number
    nakshatra: number
    yoga: number
    karana: number
  }
}

export type ChoghadiyaQuality = 'good' | 'avoid'

export interface ChoghadiyaSlot {
  name: string
  start: string
  end: string
  quality: ChoghadiyaQuality
  now?: boolean
}

export interface HoraSlot {
  planet: string
  start: string
  end: string
  note: string
  now?: boolean
}

export interface AvoidWindow {
  name: string
  start: string
  end: string
  note: string
}

export interface PanchangAlertPref {
  id: string
  title: string
  description: string
  enabled: boolean
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function weekdayLong(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function buildPanchangDay(iso = '2026-09-19'): PanchangDayDetail {
  return {
    date: iso,
    weekdayLabel: weekdayLong(iso),
    place: 'Delhi, India',
    tithi: 'Shukla Ashtami',
    tithiEnds: '14:12',
    nakshatra: 'Mula',
    nakshatraPada: 3,
    nakshatraEnds: '09:40',
    yoga: 'Shukla',
    yogaEnds: '21:05',
    karana: 'Bava',
    karanaEnds: '14:12',
    sunrise: '06:08',
    sunset: '18:22',
    moonrise: '13:44',
    abhijit: '11:48 – 12:36',
    brahmaMuhurat: '04:32 – 05:20',
    rahuKaal: '09:12 – 10:44',
    yamaganda: '13:48 – 15:20',
    gulika: '06:08 – 07:40',
    durMuhurat: '12:16 – 12:48',
    plainWords:
      'In plain words: the eighth day of the waxing moon, under Mula. Good for study and starting something quiet; poor for travel after 14:12.',
    alsoOnThisDay: 'No festival · no vrat · 2 muhurat windows.',
    progress: { tithi: 0.62, nakshatra: 0.78, yoga: 0.45, karana: 0.62 },
  }
}

export function buildChoghadiya(period: 'day' | 'night'): ChoghadiyaSlot[] {
  if (period === 'night') {
    return [
      { name: 'Shubh', start: '18:24', end: '19:56', quality: 'good' },
      { name: 'Amrit', start: '19:56', end: '21:28', quality: 'good' },
      { name: 'Char', start: '21:28', end: '23:00', quality: 'good' },
      { name: 'Rog', start: '23:00', end: '00:32', quality: 'avoid' },
      { name: 'Kaal', start: '00:32', end: '02:04', quality: 'avoid' },
      { name: 'Labh', start: '02:04', end: '03:36', quality: 'good' },
      { name: 'Udveg', start: '03:36', end: '05:08', quality: 'avoid' },
      { name: 'Shubh', start: '05:08', end: '06:08', quality: 'good' },
    ]
  }
  return [
    { name: 'Udveg', start: '06:08', end: '07:40', quality: 'avoid' },
    { name: 'Char', start: '07:40', end: '09:12', quality: 'good' },
    { name: 'Labh', start: '09:12', end: '10:44', quality: 'good' },
    { name: 'Amrit', start: '10:44', end: '12:16', quality: 'good', now: true },
    { name: 'Kaal', start: '12:16', end: '13:48', quality: 'avoid' },
    { name: 'Shubh', start: '13:48', end: '15:20', quality: 'good' },
    { name: 'Rog', start: '15:20', end: '16:52', quality: 'avoid' },
    { name: 'Udveg', start: '16:52', end: '18:24', quality: 'avoid' },
  ]
}

export function buildHora(span: 'day' | 'night'): HoraSlot[] {
  if (span === 'night') {
    return [
      { planet: 'Mercury', start: '18:22', end: '19:22', note: 'Writing, trade, messages.' },
      { planet: 'Moon', start: '19:22', end: '20:22', note: 'Home, rest, family.' },
      { planet: 'Saturn', start: '20:22', end: '21:22', note: 'Discipline, long work.' },
      { planet: 'Jupiter', start: '21:22', end: '22:22', note: 'Study, counsel.' },
      { planet: 'Mars', start: '22:22', end: '23:22', note: 'Drive, disputes — go gently.' },
      { planet: 'Sun', start: '23:22', end: '00:22', note: 'Authority, planning.' },
      { planet: 'Venus', start: '00:22', end: '01:22', note: 'Art, ease, affection.' },
    ]
  }
  return [
    { planet: 'Saturn', start: '06:08', end: '07:08', note: 'Discipline, repairs, property.' },
    { planet: 'Jupiter', start: '07:08', end: '08:08', note: 'Study, money, advice.' },
    { planet: 'Mars', start: '08:08', end: '09:08', note: 'Disputes, surgery, sport.' },
    { planet: 'Sun', start: '09:08', end: '10:08', note: 'Authority, government work.' },
    {
      planet: 'Venus',
      start: '10:08',
      end: '11:08',
      note: 'Purchases, marriage talk, art.',
      now: true,
    },
    { planet: 'Mercury', start: '11:08', end: '12:08', note: 'Writing, trade, travel booking.' },
    { planet: 'Moon', start: '12:08', end: '13:08', note: 'Home, water, meeting family.' },
  ]
}

export function buildAvoidWindows(): AvoidWindow[] {
  return [
    {
      name: 'Rahu kaal',
      start: '09:12',
      end: '10:44',
      note: 'Avoid starting journeys.',
    },
    {
      name: 'Yamaganda',
      start: '13:48',
      end: '15:20',
      note: 'Avoid signing and lending.',
    },
    {
      name: 'Gulika kaal',
      start: '06:08',
      end: '07:40',
      note: 'Avoid new beginnings.',
    },
    {
      name: 'Dur muhurat',
      start: '12:16',
      end: '12:48',
      note: 'Brief inauspicious pocket.',
    },
  ]
}

export function nextSevenTithis(fromIso: string) {
  const names = [
    'Navami',
    'Dashami',
    'Ekadashi',
    'Dwadashi',
    'Trayodashi',
    'Chaturdashi',
    'Purnima',
  ]
  const start = new Date(`${fromIso}T12:00:00`)
  return names.map((name, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i + 1)
    return {
      label: `${pad(d.getDate())} ${d.toLocaleDateString('en-IN', { month: 'short' })}`,
      tithi: name,
    }
  })
}

export const DEFAULT_PANCHANG_ALERTS: PanchangAlertPref[] = [
  {
    id: 'morning',
    title: 'Morning panchang',
    description: 'Tithi, nakshatra and the day’s good windows, at 07:00',
    enabled: true,
  },
  {
    id: 'rahu',
    title: 'Before Rahu kaal',
    description: '15 minutes before it starts, daily',
    enabled: true,
  },
  {
    id: 'amrit',
    title: 'Amrit and Shubh choghadiya',
    description: 'Only the two best windows',
    enabled: false,
  },
  {
    id: 'tithi',
    title: 'Tithi change',
    description: 'When a vrat tithi begins',
    enabled: false,
  },
  {
    id: 'ekadashi',
    title: 'Ekadashi & vrat days',
    description: 'The evening before — same record as Calendar vrats',
    enabled: true,
  },
  {
    id: 'festival',
    title: 'Festival mornings',
    description: 'Same record as Calendar festivals',
    enabled: false,
  },
  {
    id: 'muhurat',
    title: 'Saved muhurat reminders',
    description: '2 days before, and the morning of',
    enabled: true,
  },
]

export type MuhuratPurposeId =
  | 'griha-pravesh'
  | 'vivah'
  | 'vehicle'
  | 'business'
  | 'naming'
  | 'property'
  | 'travel'
  | 'other'
  | 'engagement'
  | 'namkaran'
  | 'mundan'
  | 'annaprashan'
  | 'office'
  | 'job'
  | 'investment'
  | 'loan'
  | 'gold'
  | 'electronics'
  | 'contract'
  | 'journey'
  | 'admission'
  | 'exam'
  | 'surgery'
  | 'havan'

export interface MuhuratPurpose {
  id: MuhuratPurposeId
  label: string
  group?: 'home' | 'work' | 'buying' | 'travel' | 'quick'
}

export const MUHURAT_LOOKUP_PURPOSES: MuhuratPurpose[] = [
  { id: 'griha-pravesh', label: 'Griha Pravesh', group: 'quick' },
  { id: 'vivah', label: 'Vivah (marriage)', group: 'quick' },
  { id: 'vehicle', label: 'Vehicle purchase', group: 'quick' },
  { id: 'business', label: 'Business start', group: 'quick' },
  { id: 'naming', label: 'Naming ceremony', group: 'quick' },
  { id: 'property', label: 'Property registry', group: 'quick' },
  { id: 'travel', label: 'Travel', group: 'quick' },
  { id: 'other', label: 'Something else', group: 'quick' },
]

export const MUHURAT_HOME_GROUPS: { id: string; title: string; items: MuhuratPurpose[] }[] = [
  {
    id: 'home',
    title: 'Home & family',
    items: [
      { id: 'griha-pravesh', label: 'Griha Pravesh' },
      { id: 'vivah', label: 'Vivah (marriage)' },
      { id: 'engagement', label: 'Engagement / Roka' },
      { id: 'namkaran', label: 'Namkaran' },
      { id: 'mundan', label: 'Mundan' },
      { id: 'annaprashan', label: 'Annaprashan' },
    ],
  },
  {
    id: 'work',
    title: 'Work & money',
    items: [
      { id: 'business', label: 'Business start' },
      { id: 'office', label: 'Office opening' },
      { id: 'job', label: 'New job joining' },
      { id: 'investment', label: 'Investment / trading' },
      { id: 'loan', label: 'Account or loan opening' },
    ],
  },
  {
    id: 'buying',
    title: 'Buying & signing',
    items: [
      { id: 'vehicle', label: 'Vehicle purchase' },
      { id: 'property', label: 'Property registry' },
      { id: 'gold', label: 'Gold & jewellery' },
      { id: 'electronics', label: 'Electronics' },
      { id: 'contract', label: 'Contract signing' },
    ],
  },
  {
    id: 'travel',
    title: 'Travel, study & rites',
    items: [
      { id: 'journey', label: 'Journey start' },
      { id: 'admission', label: 'Admission / first class' },
      { id: 'exam', label: 'Exam start' },
      { id: 'surgery', label: 'Surgery date' },
      { id: 'havan', label: 'Havan / puja start' },
    ],
  },
]

export interface MuhuratResultRow {
  id: string
  dateLabel: string
  window: string
  meta: string
  quality: number
  /** Personalised chart note — only when matched. */
  chartNote?: string
  faded?: boolean
}

export interface SavedMuhurat {
  id: string
  purpose: string
  forLabel: string
  dateLabel: string
  window: string
  status: string
  past?: boolean
}

export function buildGenericMuhuratResults(purposeLabel: string): MuhuratResultRow[] {
  return [
    {
      id: '1',
      dateLabel: 'Thu 08 Oct',
      window: '07:12 – 09:04',
      meta: 'Rohini · Shukla Saptami',
      quality: 5,
    },
    {
      id: '2',
      dateLabel: 'Sun 11 Oct',
      window: '10:20 – 12:02',
      meta: 'Pushya · Shukla Dashami',
      quality: 5,
    },
    {
      id: '3',
      dateLabel: 'Wed 14 Oct',
      window: '06:40 – 08:18',
      meta: 'Ashwini · Shukla Trayodashi',
      quality: 5,
    },
    {
      id: '4',
      dateLabel: 'Fri 17 Oct',
      window: '11:05 – 12:40',
      meta: 'Rohini · Krishna Pratipada',
      quality: 4,
    },
    {
      id: '5',
      dateLabel: 'Mon 20 Oct',
      window: '08:15 – 09:50',
      meta: 'Hasta · Krishna Chaturthi',
      quality: 2,
      faded: true,
    },
    {
      id: '6',
      dateLabel: 'Thu 23 Oct',
      window: '07:40 – 09:12',
      meta: 'Chitra · Krishna Saptami',
      quality: 2,
      faded: true,
    },
  ].map((row) => ({ ...row, meta: `${row.meta} · ${purposeLabel}` }))
}

export function buildPersonalisedMuhuratResults(): MuhuratResultRow[] {
  return [
    {
      id: 'p1',
      dateLabel: 'Sun 11 Oct',
      window: '10:20 – 12:02',
      meta: 'Pushya · Shukla Dashami',
      quality: 5,
      chartNote: 'Pushya + your Moon dasha lord; no Venus affliction',
    },
    {
      id: 'p2',
      dateLabel: 'Thu 08 Oct',
      window: '07:12 – 09:04',
      meta: 'Rohini · Shukla Saptami',
      quality: 4,
      chartNote: 'Strong panchang, but Saturn transits your 4th house',
    },
    {
      id: 'p3',
      dateLabel: 'Wed 14 Oct',
      window: '06:40 – 08:18',
      meta: 'Ashwini · Shukla Trayodashi',
      quality: 4,
      chartNote: 'Neutral for your chart — safe fallback',
    },
  ]
}

export const DEFAULT_SAVED_MUHURATS: SavedMuhurat[] = [
  {
    id: 's1',
    purpose: 'Griha Pravesh',
    forLabel: 'Self',
    dateLabel: 'Sun 11 Oct',
    window: '10:20–12:02',
    status: 'Notification on',
  },
  {
    id: 's2',
    purpose: 'Vehicle purchase',
    forLabel: 'Papa · saved profile',
    dateLabel: 'Fri 23 Oct',
    window: '08:05–09:30',
    status: 'Notification on',
  },
  {
    id: 's3',
    purpose: 'Business start',
    forLabel: 'Self',
    dateLabel: 'Fri 06 Nov',
    window: '07:40–09:12',
    status: 'No reminder yet',
  },
  {
    id: 's4',
    purpose: 'Namkaran',
    forLabel: 'Aarav · saved profile',
    dateLabel: 'Tue 08 Dec',
    window: '09:15–10:40',
    status: 'Shared with 2 people',
  },
  {
    id: 's5',
    purpose: 'Engagement',
    forLabel: 'Self',
    dateLabel: '14 Aug 2026',
    window: '—',
    status: 'Kept for your records',
    past: true,
  },
]

export const MUHURAT_RECENT_SEARCHES = [
  'Vivah · Nov–Dec 2026',
  'Vehicle purchase · Oct 2026',
  'Business start · Sep–Oct 2026',
]
