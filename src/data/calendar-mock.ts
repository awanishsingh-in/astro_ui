import type { CalendarDay, CalendarEvent } from '@/types/astrology'

const TITHIS = [
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
] as const

const NAKSHATRAS = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashira',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Mula',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
] as const

const YOGAS = [
  'Vishkambha',
  'Priti',
  'Ayushman',
  'Saubhagya',
  'Shobhana',
  'Atiganda',
  'Sukarma',
  'Dhriti',
  'Shula',
  'Ganda',
  'Vriddhi',
  'Dhruva',
  'Vyaghata',
  'Harshana',
  'Vajra',
  'Siddhi',
  'Vyatipata',
  'Variyan',
  'Parigha',
  'Shiva',
  'Siddha',
  'Sadhya',
  'Shubha',
  'Shukla',
  'Brahma',
  'Indra',
  'Vaidhriti',
] as const

const KARANAS = [
  'Bava',
  'Balava',
  'Kaulava',
  'Taitila',
  'Gara',
  'Vanija',
  'Vishti',
  'Shakuni',
  'Chatushpada',
  'Naga',
  'Kimstughna',
] as const

const VAARS = [
  'Ravivara',
  'Somavara',
  'Mangalavara',
  'Budhavara',
  'Guruvara',
  'Shukravara',
  'Shanivara',
] as const

function festival(name: string): CalendarEvent {
  return { name, kind: 'festival' }
}

function vrat(name: string): CalendarEvent {
  return { name, kind: 'vrat' }
}

function ekadashi(name: string): CalendarEvent {
  return { name, kind: 'ekadashi' }
}

function mmdd(month: number, day: number): string {
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * Solar / national observances that stay on (nearly) the same Gregorian date.
 * Keyed by MM-DD.
 */
const FIXED_ANNUAL: Record<string, CalendarEvent[]> = {
  '01-14': [festival('Makar Sankranti'), festival('Pongal'), festival('Uttarayan')],
  '01-26': [festival('Republic Day')],
  '04-14': [festival('Baisakhi'), festival('Mesha Sankranti')],
  '08-15': [festival('Independence Day')],
  '10-02': [festival('Gandhi Jayanti')],
}

/**
 * Full Hindu festival & vrat calendar for 2026 (New Delhi / Drik Panchang reckoning).
 * Lunar festivals move each year — add new year maps as they publish.
 * Keyed by MM-DD within that year.
 */
const FESTIVALS_BY_YEAR: Record<number, Record<string, CalendarEvent[]>> = {
  2026: {
    // January
    '01-01': [vrat('Pradosh Vrat (Shukla)')],
    '01-03': [vrat('Paush Purnima')],
    '01-06': [vrat('Sankashti Chaturthi')],
    '01-13': [festival('Lohri')],
    '01-14': [
      festival('Makar Sankranti'),
      festival('Pongal'),
      festival('Uttarayan'),
      ekadashi('Shattila Ekadashi'),
    ],
    '01-16': [vrat('Pradosh Vrat (Krishna)'), vrat('Masik Shivratri')],
    '01-18': [vrat('Magha Amavasya')],
    '01-23': [festival('Vasant Panchami'), festival('Saraswati Puja')],
    '01-29': [ekadashi('Jaya Ekadashi')],
    '01-30': [vrat('Pradosh Vrat (Shukla)')],

    // February
    '02-01': [vrat('Magha Purnima')],
    '02-05': [vrat('Sankashti Chaturthi')],
    '02-13': [ekadashi('Vijaya Ekadashi'), festival('Kumbha Sankranti')],
    '02-14': [vrat('Pradosh Vrat (Krishna)')],
    '02-15': [festival('Maha Shivratri'), vrat('Masik Shivratri')],
    '02-17': [vrat('Phalguna Amavasya')],
    '02-27': [ekadashi('Amalaki Ekadashi')],
    '02-28': [vrat('Pradosh Vrat (Shukla)')],

    // March
    '03-03': [festival('Holika Dahan'), vrat('Phalguna Purnima')],
    '03-04': [festival('Holi')],
    '03-06': [vrat('Sankashti Chaturthi')],
    '03-15': [ekadashi('Papmochani Ekadashi'), festival('Meena Sankranti')],
    '03-16': [vrat('Pradosh Vrat (Krishna)')],
    '03-17': [vrat('Masik Shivratri')],
    '03-19': [
      festival('Chaitra Navratri begins'),
      festival('Ugadi'),
      festival('Gudi Padwa'),
      festival('Ghatasthapana'),
    ],
    '03-20': [festival('Cheti Chand')],
    '03-26': [festival('Ram Navami')],
    '03-27': [festival('Chaitra Navratri Parana')],
    '03-29': [ekadashi('Kamada Ekadashi')],
    '03-30': [vrat('Pradosh Vrat (Shukla)')],
    '03-31': [festival('Mahavir Jayanti')],

    // April
    '04-02': [festival('Hanuman Jayanti'), vrat('Chaitra Purnima')],
    '04-05': [vrat('Sankashti Chaturthi')],
    '04-13': [ekadashi('Varuthini Ekadashi')],
    '04-14': [festival('Baisakhi'), festival('Mesha Sankranti')],
    '04-15': [vrat('Masik Shivratri'), vrat('Pradosh Vrat (Krishna)')],
    '04-17': [vrat('Vaishakh Amavasya')],
    '04-19': [festival('Akshaya Tritiya')],
    '04-25': [festival('Sita Navami')],
    '04-27': [ekadashi('Mohini Ekadashi')],
    '04-28': [vrat('Pradosh Vrat (Shukla)')],

    // May
    '05-01': [vrat('Vaishakh Purnima'), festival('Buddha Purnima')],
    '05-05': [vrat('Sankashti Chaturthi')],
    '05-13': [ekadashi('Apara Ekadashi')],
    '05-14': [vrat('Pradosh Vrat (Krishna)')],
    '05-15': [vrat('Masik Shivratri'), festival('Vrishabha Sankranti')],
    '05-16': [vrat('Jyeshtha Amavasya')],
    '05-27': [ekadashi('Padmini Ekadashi')],
    '05-28': [vrat('Pradosh Vrat (Shukla)')],
    '05-31': [vrat('Purnima Vrat')],

    // June
    '06-03': [vrat('Sankashti Chaturthi')],
    '06-11': [ekadashi('Param Ekadashi')],
    '06-12': [vrat('Pradosh Vrat (Krishna)')],
    '06-13': [vrat('Masik Shivratri')],
    '06-15': [vrat('Amavasya'), festival('Mithuna Sankranti')],
    '06-25': [ekadashi('Nirjala Ekadashi')],
    '06-27': [vrat('Pradosh Vrat (Shukla)')],
    '06-29': [vrat('Jyeshtha Purnima')],

    // July
    '07-03': [vrat('Sankashti Chaturthi')],
    '07-10': [ekadashi('Yogini Ekadashi')],
    '07-12': [vrat('Masik Shivratri'), vrat('Pradosh Vrat (Krishna)')],
    '07-14': [vrat('Ashadha Amavasya')],
    '07-16': [festival('Jagannath Rath Yatra'), festival('Karka Sankranti')],
    '07-25': [ekadashi('Devshayani Ekadashi'), ekadashi('Ashadhi Ekadashi')],
    '07-26': [vrat('Pradosh Vrat (Shukla)')],
    '07-29': [festival('Guru Purnima'), vrat('Ashadha Purnima')],

    // August
    '08-02': [vrat('Sankashti Chaturthi')],
    '08-09': [ekadashi('Kamika Ekadashi')],
    '08-10': [vrat('Pradosh Vrat (Krishna)')],
    '08-11': [vrat('Masik Shivratri')],
    '08-12': [vrat('Shravan Amavasya')],
    '08-15': [festival('Hariyali Teej'), festival('Independence Day')],
    '08-17': [festival('Nag Panchami'), festival('Simha Sankranti')],
    '08-23': [ekadashi('Shravan Putrada Ekadashi')],
    '08-25': [vrat('Pradosh Vrat (Shukla)')],
    '08-26': [festival('Onam (Thiruvonam)')],
    '08-28': [festival('Raksha Bandhan'), vrat('Shravan Purnima')],
    '08-31': [vrat('Sankashti Chaturthi'), festival('Kajari Teej')],

    // September
    '09-04': [festival('Krishna Janmashtami')],
    '09-07': [ekadashi('Aja Ekadashi')],
    '09-08': [vrat('Pradosh Vrat (Krishna)')],
    '09-09': [vrat('Masik Shivratri')],
    '09-11': [vrat('Bhadrapada Amavasya')],
    '09-14': [festival('Ganesh Chaturthi'), festival('Hartalika Teej')],
    '09-17': [festival('Kanya Sankranti')],
    '09-22': [ekadashi('Parivartini Ekadashi')],
    '09-24': [vrat('Pradosh Vrat (Shukla)')],
    '09-25': [festival('Anant Chaturdashi'), festival('Ganesh Visarjan')],
    '09-26': [vrat('Bhadrapada Purnima'), festival('Pitru Paksha begins')],
    '09-29': [vrat('Sankashti Chaturthi')],

    // October
    '10-02': [festival('Gandhi Jayanti')],
    '10-06': [ekadashi('Indira Ekadashi')],
    '10-08': [vrat('Masik Shivratri'), vrat('Pradosh Vrat (Krishna)')],
    '10-10': [vrat('Ashwin Amavasya'), festival('Mahalaya Amavasya'), festival('Pitru Paksha ends')],
    '10-11': [festival('Sharad Navratri begins'), festival('Ghatasthapana')],
    '10-16': [festival('Kalparambha')],
    '10-17': [festival('Navpatrika Puja'), festival('Tula Sankranti')],
    '10-18': [festival('Durga Maha Ashtami')],
    '10-19': [festival('Durga Maha Navami'), festival('Durga Ashtami Puja')],
    '10-20': [festival('Dussehra'), festival('Vijayadashami'), festival('Sharad Navratri Parana')],
    '10-21': [festival('Durga Visarjan')],
    '10-22': [ekadashi('Papankusha Ekadashi')],
    '10-23': [vrat('Pradosh Vrat (Shukla)')],
    '10-25': [festival('Sharad Purnima')],
    '10-26': [vrat('Ashwin Purnima')],
    '10-29': [vrat('Karva Chauth'), vrat('Sankashti Chaturthi')],
    '10-31': [festival('Maharishi Valmiki Jayanti')],

    // November
    '11-05': [ekadashi('Rama Ekadashi')],
    '11-06': [festival('Dhanteras'), vrat('Pradosh Vrat (Krishna)')],
    '11-07': [festival('Naraka Chaturdashi'), festival('Choti Diwali'), vrat('Masik Shivratri')],
    '11-08': [festival('Diwali'), festival('Lakshmi Puja')],
    '11-09': [vrat('Kartik Amavasya')],
    '11-10': [festival('Govardhan Puja'), festival('Annakut')],
    '11-11': [festival('Bhai Dooj')],
    '11-15': [festival('Chhath Puja')],
    '11-16': [festival('Vrischika Sankranti')],
    '11-20': [ekadashi('Devutthana Ekadashi'), festival('Prabodhini Ekadashi')],
    '11-21': [festival('Tulsi Vivah')],
    '11-22': [vrat('Pradosh Vrat (Shukla)')],
    '11-24': [festival('Kartik Purnima'), festival('Dev Diwali')],
    '11-27': [vrat('Sankashti Chaturthi')],

    // December
    '12-04': [ekadashi('Utpanna Ekadashi')],
    '12-06': [vrat('Pradosh Vrat (Krishna)')],
    '12-07': [vrat('Masik Shivratri')],
    '12-08': [vrat('Margashirsha Amavasya')],
    '12-16': [festival('Dhanu Sankranti')],
    '12-20': [ekadashi('Mokshada Ekadashi'), festival('Gita Jayanti')],
    '12-21': [vrat('Pradosh Vrat (Shukla)')],
    '12-23': [vrat('Margashirsha Purnima')],
    '12-25': [festival('Christmas')],
    '12-26': [vrat('Sankashti Chaturthi')],
  },
}

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${mmdd(month + 1, day)}`
}

function daySeed(year: number, month: number, day: number): number {
  return year * 372 + month * 31 + day
}

function tithiFor(seed: number): { label: string; paksha: 'Shukla' | 'Krishna'; isEkadashi: boolean } {
  const cycle = seed % 30
  const paksha: 'Shukla' | 'Krishna' = cycle < 15 ? 'Shukla' : 'Krishna'
  const index = cycle % 15
  const name = TITHIS[index] ?? 'Pratipada'
  const isEkadashi = name === 'Ekadashi'
  const label =
    index === 14
      ? paksha === 'Shukla'
        ? 'Purnima'
        : 'Amavasya'
      : `${paksha} ${name}`
  return { label, paksha, isEkadashi }
}

function mergeEvents(...lists: CalendarEvent[][]): CalendarEvent[] {
  const seen = new Set<string>()
  const out: CalendarEvent[] = []
  for (const list of lists) {
    for (const event of list) {
      const key = `${event.kind}:${event.name}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push(event)
    }
  }
  return out
}

function eventsFor(year: number, month: number, day: number, isEkadashi: boolean): CalendarEvent[] {
  const key = mmdd(month + 1, day)
  const yearMap = FESTIVALS_BY_YEAR[year]
  const yearEvents = yearMap?.[key] ?? []
  // Solar/national only when this year has no dedicated entry for that key
  // (year map already includes Makar Sankranti etc. for 2026).
  const fixed = yearMap ? [] : (FIXED_ANNUAL[key] ?? [])
  const events = mergeEvents(yearEvents, fixed)

  const hasNamedEkadashi = events.some((e) => e.kind === 'ekadashi')
  if (isEkadashi && !hasNamedEkadashi) {
    events.push(ekadashi('Ekadashi vrat'))
  }
  return events
}

/** Deterministic mock panchang for any Gregorian day. */
export function buildCalendarDay(year: number, month: number, day: number): CalendarDay {
  const date = new Date(year, month, day)
  const seed = daySeed(year, month, day)
  const { label, paksha, isEkadashi } = tithiFor(seed)

  return {
    date: toIsoDate(year, month, day),
    tithi: label,
    nakshatra: NAKSHATRAS[seed % NAKSHATRAS.length] ?? 'Ashwini',
    yoga: YOGAS[seed % YOGAS.length] ?? 'Vishkambha',
    karana: KARANAS[seed % KARANAS.length] ?? 'Bava',
    vaar: VAARS[date.getDay()] ?? 'Ravivara',
    paksha,
    events: eventsFor(year, month, day, isEkadashi),
  }
}

/** All days in a month, including leading/trailing padding for the grid. */
export function buildMonthGrid(year: number, month: number): CalendarDay[] {
  const first = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0).getDate()
  const startPad = first.getDay()
  const cells: CalendarDay[] = []

  for (let i = 0; i < startPad; i++) {
    const d = new Date(year, month, -startPad + i + 1)
    cells.push(buildCalendarDay(d.getFullYear(), d.getMonth(), d.getDate()))
  }

  for (let day = 1; day <= lastDay; day++) {
    cells.push(buildCalendarDay(year, month, day))
  }

  while (cells.length % 7 !== 0) {
    const tail = cells.length - (startPad + lastDay) + 1
    const d = new Date(year, month + 1, tail)
    cells.push(buildCalendarDay(d.getFullYear(), d.getMonth(), d.getDate()))
  }

  return cells
}
