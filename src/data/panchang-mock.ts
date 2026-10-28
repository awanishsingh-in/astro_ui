/**
 * Mock daily panchang, choghadiya, hora and Rahu windows for Panchang & muhurat.
 * Deterministic for a given ISO date so the UI stays stable in demos.
 */

import { buildCalendarDay } from '@/data/calendar-mock'

export interface PanchangDayEvent {
  name: string
  note?: string
}

export type TimelineSegmentTone = 'neutral' | 'good' | 'avoid'

/** One named stretch on the day timeline (minutes from midnight). */
export interface PanchangTimelineSegment {
  label: string
  startMin: number
  endMin: number
  tone?: TimelineSegmentTone
}

export interface PanchangTimelineRow {
  id: string
  label: string
  segments: PanchangTimelineSegment[]
}

/** Horizontal limb chart for the selected day — sunrise → next sunrise. */
export interface PanchangDayTimelineData {
  /** Inclusive start hour on the axis (local). */
  axisStartHour: number
  /** Exclusive end hour on the axis; may be > 24 for next-day hours. */
  axisEndHour: number
  sunriseMin: number
  sunsetMin: number
  rows: PanchangTimelineRow[]
  notes: string[]
}

export interface PanchangDayDetail {
  date: string
  weekdayLabel: string
  /** Short weekday for Vaara — e.g. "Friday". */
  vaara: string
  place: string
  tithi: string
  /** Paksha part of tithi — e.g. "Shukla". */
  tithiPaksha: string
  /** Name part of tithi — e.g. "Ashtami". */
  tithiName: string
  tithiEnds: string
  /** Next tithi after the current one ends. */
  nextTithi: string
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
  moonset: string
  moonPhase: string
  /** Ayan + ritu — e.g. "Uttarayan · Shishira". */
  sunEarth: string
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
  /** Hindi day-detail header — lunar day + masa. */
  lunarDayLabel: string
  vikramSamvat: string
  shakaSamvat: string
  samvatsara: string
  chandramasaPurnimanta: string
  chandramasaAmanta: string
  drikRitu: string
  vedicRitu: string
  drikAyana: string
  vedicAyana: string
  dinamana: string
  ratrimana: string
  madhyahna: string
  godhuliMuhurat: string
  amritKalam: string
  dayEvents: PanchangDayEvent[]
  timeline: PanchangDayTimelineData
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

function vaaraLabel(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'long' })
}

function formatClock(hhmm: string) {
  const [hRaw, mRaw] = hhmm.split(':').map(Number)
  const h = hRaw ?? 0
  const m = mRaw ?? 0
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${pad(hour12)}:${pad(m)} ${period}`
}

const SAMVATSARA = [
  'Prabhava',
  'Vibhava',
  'Shukla',
  'Pramoda',
  'Prajapati',
  'Angirasa',
  'Shrimukha',
  'Bhava',
  'Yuva',
  'Dhata',
  'Ishvara',
  'Bahudhanya',
  'Pramathi',
  'Vikrama',
  'Vrisha',
  'Chitrabhanu',
  'Svabhanu',
  'Tarana',
  'Parthiva',
  'Vyaya',
  'Sarvajit',
  'Sarvadhari',
  'Virodhi',
  'Vikriti',
  'Khara',
  'Nandana',
  'Vijaya',
  'Jaya',
  'Manmatha',
  'Durmukhi',
  'Hevilambi',
  'Vilambi',
  'Vikari',
  'Sharvari',
  'Plava',
  'Shubhakrit',
  'Shobhakrit',
  'Krodhi',
  'Vishvavasu',
  'Parabhava',
  'Plavanga',
  'Kilaka',
  'Saumya',
  'Sadharana',
  'Virodhikrit',
  'Paridhavi',
  'Pramadi',
  'Ananda',
  'Rakshasa',
  'Nala',
  'Pingala',
  'Kalayukta',
  'Siddharthi',
  'Raudra',
  'Durmati',
  'Dundubhi',
  'Rudhirodgari',
  'Raktakshi',
  'Krodhana',
  'Akshaya',
] as const

const RITUS = [
  { drik: 'Shishira (Winter)', vedic: 'Hemanta (Pre-winter)' },
  { drik: 'Vasanta (Spring)', vedic: 'Shishira (Winter)' },
  { drik: 'Grishma (Summer)', vedic: 'Vasanta (Spring)' },
  { drik: 'Varsha (Monsoon)', vedic: 'Grishma (Summer)' },
  { drik: 'Sharad (Autumn)', vedic: 'Varsha (Monsoon)' },
  { drik: 'Hemanta (Pre-winter)', vedic: 'Sharad (Autumn)' },
] as const

const NEXT_TITHI: Record<string, string> = {
  Pratipada: 'Dwitiya',
  Dwitiya: 'Tritiya',
  Tritiya: 'Chaturthi',
  Chaturthi: 'Panchami',
  Panchami: 'Shashthi',
  Shashthi: 'Saptami',
  Saptami: 'Ashtami',
  Ashtami: 'Navami',
  Navami: 'Dashami',
  Dashami: 'Ekadashi',
  Ekadashi: 'Dwadashi',
  Dwadashi: 'Trayodashi',
  Trayodashi: 'Chaturdashi',
  Chaturdashi: 'Purnima / Amavasya',
  'Purnima / Amavasya': 'Pratipada',
  Purnima: 'Pratipada',
  Amavasya: 'Pratipada',
}

function seedFromIso(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return ((y ?? 2026) * 372 + ((m ?? 1) - 1) * 31 + (d ?? 1)) % 997
}

function lunarDayNumber(tithiName: string, paksha: string) {
  const order = [
    'Pratipada',
    'Dwitiya',
    'Tritiya',
    'Chaturthi',
    'Panchami',
    'Shashthi',
    'Saptami',
    'Ashtami',
    'Navami',
    'Dashami',
    'Ekadashi',
    'Dwadashi',
    'Trayodashi',
    'Chaturdashi',
    'Purnima / Amavasya',
    'Purnima',
    'Amavasya',
  ]
  const idx = order.indexOf(tithiName)
  if (tithiName === 'Purnima' || tithiName === 'Amavasya' || tithiName === 'Purnima / Amavasya') {
    return 15
  }
  if (idx >= 0 && idx < 15) return idx + 1
  return paksha === 'Krishna' ? 8 : 1
}

function minutesFromHhmm(hhmm: string) {
  const [hRaw, mRaw] = hhmm.split(':').map(Number)
  return (hRaw ?? 0) * 60 + (mRaw ?? 0)
}

const NEXT_NAKSHATRA: Record<string, string> = {
  Ashwini: 'Bharani',
  Bharani: 'Krittika',
  Krittika: 'Rohini',
  Rohini: 'Mrigashira',
  Mrigashira: 'Ardra',
  Ardra: 'Punarvasu',
  Punarvasu: 'Pushya',
  Pushya: 'Ashlesha',
  Ashlesha: 'Magha',
  Magha: 'Purva Phalguni',
  'Purva Phalguni': 'Uttara Phalguni',
  'Uttara Phalguni': 'Hasta',
  Hasta: 'Chitra',
  Chitra: 'Swati',
  Swati: 'Vishakha',
  Vishakha: 'Anuradha',
  Anuradha: 'Jyeshtha',
  Jyeshtha: 'Mula',
  Mula: 'Purva Ashadha',
  'Purva Ashadha': 'Uttara Ashadha',
  'Uttara Ashadha': 'Shravana',
  Shravana: 'Dhanishta',
  Dhanishta: 'Shatabhisha',
  Shatabhisha: 'Purva Bhadrapada',
  'Purva Bhadrapada': 'Uttara Bhadrapada',
  'Uttara Bhadrapada': 'Revati',
  Revati: 'Ashwini',
}

const NEXT_YOGA: Record<string, string> = {
  Vishkambha: 'Priti',
  Priti: 'Ayushman',
  Ayushman: 'Saubhagya',
  Saubhagya: 'Shobhana',
  Shobhana: 'Atiganda',
  Atiganda: 'Sukarma',
  Sukarma: 'Dhriti',
  Dhriti: 'Shula',
  Shula: 'Ganda',
  Ganda: 'Vriddhi',
  Vriddhi: 'Dhruva',
  Dhruva: 'Vyaghata',
  Vyaghata: 'Harshana',
  Harshana: 'Vajra',
  Vajra: 'Siddhi',
  Siddhi: 'Vyatipata',
  Vyatipata: 'Variyan',
  Variyan: 'Parigha',
  Parigha: 'Shiva',
  Shiva: 'Siddha',
  Siddha: 'Sadhya',
  Sadhya: 'Shubha',
  Shubha: 'Shukla',
  Shukla: 'Brahma',
  Brahma: 'Indra',
  Indra: 'Vaidhriti',
  Vaidhriti: 'Vishkambha',
}

const NEXT_KARANA: Record<string, string> = {
  Bava: 'Balava',
  Balava: 'Kaulava',
  Kaulava: 'Taitila',
  Taitila: 'Gara',
  Gara: 'Vanija',
  Vanija: 'Vishti',
  Vishti: 'Bava',
  Shakuni: 'Chatushpada',
  Chatushpada: 'Nagava',
  Nagava: 'Kimstughna',
  Kimstughna: 'Bava',
}

const WEEKDAY_SLOTS: { name: string; tone: TimelineSegmentTone }[] = [
  { name: 'Udvega', tone: 'avoid' },
  { name: 'Char', tone: 'good' },
  { name: 'Labh', tone: 'good' },
  { name: 'Amrit', tone: 'good' },
  { name: 'Kaal', tone: 'avoid' },
  { name: 'Shubh', tone: 'good' },
  { name: 'Roga', tone: 'avoid' },
  { name: 'Udvega', tone: 'avoid' },
]

function buildDayTimeline(args: {
  vaara: string
  tithiName: string
  nextTithi: string
  tithiEnds: string
  nakshatra: string
  nakshatraEnds: string
  yoga: string
  yogaEnds: string
  karana: string
  karanaEnds: string
  sunrise: string
  sunset: string
  seed: number
}): PanchangDayTimelineData {
  const axisStartHour = 6
  const axisEndHour = 31
  const axisStartMin = axisStartHour * 60
  const axisEndMin = axisEndHour * 60
  const sunriseMin = minutesFromHhmm(args.sunrise)
  const sunsetMin = minutesFromHhmm(args.sunset)

  const clamp = (min: number) => Math.min(axisEndMin, Math.max(axisStartMin, min))

  function transitionMin(hhmm: string, fallbackHour: number) {
    const raw = minutesFromHhmm(hhmm)
    // Limb ends often fall in the evening; keep them on today's axis when possible.
    if (raw < axisStartMin) return clamp(raw + 24 * 60)
    return clamp(raw || fallbackHour * 60)
  }

  const tithiAt = transitionMin(args.tithiEnds, 14)
  const nakAt = transitionMin(args.nakshatraEnds, 16)
  const yogaAt = transitionMin(args.yogaEnds, 18)
  const karanaAt = transitionMin(args.karanaEnds, 14)
  const karanaMid = clamp(karanaAt + 90 + (args.seed % 40))

  const nextNak = NEXT_NAKSHATRA[args.nakshatra] ?? 'Chitra'
  const nextYoga = NEXT_YOGA[args.yoga] ?? 'Vaidhriti'
  const nextKarana = NEXT_KARANA[args.karana] ?? 'Balava'
  const thirdKarana = NEXT_KARANA[nextKarana] ?? 'Kaulava'

  const weekdaySegs: PanchangTimelineSegment[] = []
  const daySpan = Math.max(60, sunsetMin - sunriseMin)
  const slotLen = Math.floor(daySpan / WEEKDAY_SLOTS.length)
  WEEKDAY_SLOTS.forEach((slot, i) => {
    const start = sunriseMin + i * slotLen
    const end = i === WEEKDAY_SLOTS.length - 1 ? sunsetMin : sunriseMin + (i + 1) * slotLen
    weekdaySegs.push({
      label: slot.name,
      startMin: clamp(start),
      endMin: clamp(end),
      tone: slot.tone,
    })
  })
  // Night stretch after sunset → axis end
  weekdaySegs.push({
    label: 'Night',
    startMin: clamp(sunsetMin),
    endMin: axisEndMin,
    tone: 'neutral',
  })

  return {
    axisStartHour,
    axisEndHour,
    sunriseMin,
    sunsetMin,
    rows: [
      {
        id: 'tithi',
        label: 'Tithi',
        segments: [
          { label: args.tithiName, startMin: axisStartMin, endMin: tithiAt },
          { label: args.nextTithi, startMin: tithiAt, endMin: axisEndMin },
        ],
      },
      {
        id: 'nakshatra',
        label: 'Nakshatra',
        segments: [
          { label: args.nakshatra, startMin: axisStartMin, endMin: nakAt },
          { label: nextNak, startMin: nakAt, endMin: axisEndMin },
        ],
      },
      {
        id: 'yoga',
        label: 'Yoga',
        segments: [
          { label: args.yoga, startMin: axisStartMin, endMin: yogaAt },
          { label: nextYoga, startMin: yogaAt, endMin: axisEndMin },
        ],
      },
      {
        id: 'karana',
        label: 'Karana',
        segments: [
          { label: args.karana, startMin: axisStartMin, endMin: karanaAt },
          { label: nextKarana, startMin: karanaAt, endMin: karanaMid },
          { label: thirdKarana, startMin: karanaMid, endMin: axisEndMin },
        ],
      },
      {
        id: 'weekday',
        label: args.vaara,
        segments: weekdaySegs,
      },
    ],
    notes: [
      `Tithi changes at ${formatClock(args.tithiEnds)}`,
      `Nakshatra changes at ${formatClock(args.nakshatraEnds)}`,
      `Yoga changes at ${formatClock(args.yogaEnds)}`,
      'Weekday row shows day choghadiya-style pockets',
    ],
  }
}

export function buildPanchangDay(iso = '2026-09-19'): PanchangDayDetail {
  const [y, m, d] = iso.split('-').map(Number)
  const year = y ?? 2026
  const month = (m ?? 1) - 1
  const dayNum = d ?? 1
  const cal = buildCalendarDay(year, month, dayNum)
  const seed = seedFromIso(iso)
  const tithiName = cal.tithi.includes('/')
    ? cal.paksha === 'Shukla'
      ? 'Purnima'
      : 'Amavasya'
    : cal.tithi
  const nextTithi = NEXT_TITHI[tithiName] ?? NEXT_TITHI[cal.tithi] ?? 'Navami'
  const ritu = RITUS[month % RITUS.length]!
  const ayana = month >= 5 && month <= 10 ? 'Dakshinayana' : 'Uttarayana'
  const vikramYear = year + 57
  const shakaYear = year - 78
  const samvatsara = SAMVATSARA[vikramYear % SAMVATSARA.length]!
  const lunarNum = lunarDayNumber(tithiName, cal.paksha)
  const endH = 8 + (seed % 14)
  const endM = (seed * 7) % 60
  const hh = (n: number) => pad(n % 24)

  const dayEvents: PanchangDayEvent[] = cal.events.map((e) => ({
    name: e.name,
    note: e.kind === 'vrat' || e.kind === 'ekadashi' ? 'Observed as a vrat day' : undefined,
  }))

  const alsoOnThisDay =
    dayEvents.length > 0
      ? dayEvents.map((e) => e.name).join(' · ')
      : 'No festival · no vrat · 2 muhurat windows.'

  return {
    date: iso,
    weekdayLabel: weekdayLong(iso),
    vaara: vaaraLabel(iso),
    place: 'Delhi, India',
    tithi: `${cal.paksha} ${tithiName}`,
    tithiPaksha: cal.paksha,
    tithiName,
    tithiEnds: cal.tithiEnds,
    nextTithi,
    nakshatra: cal.nakshatra,
    nakshatraPada: 1 + (seed % 4),
    nakshatraEnds: cal.nakshatraEnds,
    yoga: cal.yoga,
    yogaEnds: cal.yogaEnds,
    karana: cal.karana,
    karanaEnds: cal.karanaEnds,
    sunrise: cal.sunrise,
    sunset: cal.sunset,
    moonrise: `${hh(12 + (seed % 8))}:${hh((seed * 3) % 60)}`,
    moonset: `${hh(3 + (seed % 5))}:${hh((seed * 5) % 60)}`,
    moonPhase: cal.paksha === 'Shukla' ? 'Waxing' : 'Waning',
    sunEarth: `${ayana} · ${ritu.drik.split(' ')[0]}`,
    abhijit: `${hh(11)}:${hh(40 + (seed % 20))} – ${hh(12)}:${hh(20 + (seed % 20))}`,
    brahmaMuhurat: `${hh(4)}:${hh(20 + (seed % 20))} – ${hh(5)}:${hh(10 + (seed % 20))}`,
    rahuKaal: cal.rahuKaal,
    yamaganda: `${hh(13 + (seed % 2))}:${hh(40)} – ${hh(15 + (seed % 2))}:${hh(10)}`,
    gulika: `${cal.sunrise} – ${hh(7)}:${hh(30 + (seed % 20))}`,
    durMuhurat: `${hh(12)}:${hh(endM)} – ${hh(12)}:${hh((endM + 32) % 60)}`,
    plainWords: `In plain words: ${cal.paksha} ${tithiName} under ${cal.nakshatra}. Quiet work suits the morning; watch the afternoon avoid windows.`,
    alsoOnThisDay,
    progress: {
      tithi: 0.35 + (seed % 50) / 100,
      nakshatra: 0.4 + (seed % 45) / 100,
      yoga: 0.3 + (seed % 55) / 100,
      karana: 0.45 + (seed % 40) / 100,
    },
    lunarDayLabel: `${lunarNum}, ${cal.hinduMonth}`,
    vikramSamvat: `Vikram Samvat ${vikramYear}`,
    shakaSamvat: `Shaka Samvat ${shakaYear}`,
    samvatsara,
    chandramasaPurnimanta: `${cal.hinduMonth} (Purnimanta)`,
    chandramasaAmanta: `${cal.hinduMonth} (Amanta)`,
    drikRitu: ritu.drik,
    vedicRitu: ritu.vedic,
    drikAyana: ayana,
    vedicAyana: ayana,
    dinamana: `${11 + (seed % 2)} hrs ${20 + (seed % 30)} mins`,
    ratrimana: `${12 - (seed % 2)} hrs ${10 + (seed % 40)} mins`,
    madhyahna: `${hh(12)}:${hh(5 + (seed % 20))}`,
    godhuliMuhurat: `${cal.sunset} – ${hh(18)}:${hh(40 + (seed % 15))}`,
    amritKalam: `${hh(15 + (seed % 2))}:${hh(20)} – ${hh(17)}:${hh(endH % 50)}`,
    dayEvents,
    timeline: buildDayTimeline({
      vaara: vaaraLabel(iso),
      tithiName,
      nextTithi,
      tithiEnds: cal.tithiEnds,
      nakshatra: cal.nakshatra,
      nakshatraEnds: cal.nakshatraEnds,
      yoga: cal.yoga,
      yogaEnds: cal.yogaEnds,
      karana: cal.karana,
      karanaEnds: cal.karanaEnds,
      sunrise: cal.sunrise,
      sunset: cal.sunset,
      seed,
    }),
  }
}

/** Display helper — "14:12" → "02:12 PM". */
export function panchangClock(hhmm: string) {
  return formatClock(hhmm)
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
