import {
  GANA_BY_NAKSHATRA,
  GANA_NAMES,
  NADI_BY_NAKSHATRA,
  NADI_NAMES,
  VARNA_BY_RASHI,
  VARNA_NAMES,
  VASHYA_BY_RASHI,
  YONI_BY_NAKSHATRA,
} from '@/data/kootas'
import { NAKSHATRAS } from '@/data/nakshatras'
import type { Chart } from '@/types/astrology'
import type { BirthDetails } from '@/types/user'
import { rashiIndex } from '@/utils/astro'
import { formatArc, formatTime12 } from '@/utils/format'

const VASHYA_NAMES = ['Chatushpad', 'Manav', 'Jalachar', 'Vanachar', 'Keeta']
const TARA_NAMES = [
  'Janma',
  'Sampat',
  'Vipat',
  'Kshema',
  'Pratyak',
  'Sadhaka',
  'Vadha',
  'Mitra',
  'Ati-mitra',
]
const YOGAS = [
  'Vishkambha',
  'Priti',
  'Ayushman',
  'Saubhagya',
  'Sobhana',
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
]
const KARANAS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti']
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
  'Purnima',
]
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export interface ChartBasicsFacts {
  lagna: string
  moonSign: string
  sunSign: string
  nakshatra: string
}

export interface ChartBirthFacts {
  tithi: string
  yoga: string
  karana: string
  weekday: string
  sunrise: string
  ayanamsa: string
}

export interface ChartAvakhadaFacts {
  varna: string
  vashya: string
  yoni: string
  gana: string
  nadi: string
  tara: string
}

function seedFrom(details: BirthDetails): number {
  const digits = details.date.replace(/\D/g, '')
  return Number(digits.slice(-6) || '2000') % 997
}

/** Middle-column facts for the Charts workspace. */
export function buildChartBasicsBundle(chart: Chart, details: BirthDetails) {
  const sun = chart.grahas.find((g) => g.graha === 'Su')
  const moon = chart.grahas.find((g) => g.graha === 'Mo')
  const moonNak = moon?.nakshatra
  const nakIndex = Math.max(
    0,
    NAKSHATRAS.findIndex((n) => n.name === moonNak?.name),
  )
  const rashiIdx = rashiIndex(moon?.rashi ?? chart.lagna.rashi)
  const seed = seedFrom(details)
  const day = new Date(`${details.date}T12:00:00`)
  const weekday = Number.isNaN(day.getTime())
    ? '—'
    : (WEEKDAYS[day.getDay()] ?? '—')

  const basics: ChartBasicsFacts = {
    lagna: chart.lagna.rashi,
    moonSign: moon?.rashi ?? '—',
    sunSign: sun?.rashi ?? '—',
    nakshatra: moonNak
      ? `${moonNak.name}, pada ${moonNak.pada}`
      : '—',
  }

  const paksha = seed % 2 === 0 ? 'Shukla' : 'Krishna'
  const tithiName = TITHIS[seed % 15] ?? 'Saptami'
  const birth: ChartBirthFacts = {
    tithi: `${paksha} ${tithiName}`,
    yoga: YOGAS[seed % YOGAS.length] ?? 'Siddha',
    karana: KARANAS[seed % KARANAS.length] ?? 'Gara',
    weekday,
    sunrise: formatTime12(
      `${String(5 + (seed % 2)).padStart(2, '0')}:${String(10 + (seed % 50)).padStart(2, '0')}`,
    ),
    ayanamsa: formatArc(24, 12, 45),
  }

  const taraIdx = nakIndex % 9
  const avakhada: ChartAvakhadaFacts = {
    varna: VARNA_NAMES[VARNA_BY_RASHI[rashiIdx] ?? 1] ?? 'Vaishya',
    vashya: VASHYA_NAMES[VASHYA_BY_RASHI[rashiIdx] ?? 2] ?? 'Jalachar',
    yoni: YONI_BY_NAKSHATRA[nakIndex] ?? 'Mriga',
    gana: GANA_NAMES[GANA_BY_NAKSHATRA[nakIndex] ?? 0] ?? 'Deva',
    nadi: NADI_NAMES[NADI_BY_NAKSHATRA[nakIndex] ?? 2] ?? 'Antya',
    tara: TARA_NAMES[taraIdx] ?? 'Sadhaka',
  }

  return { basics, birth, avakhada }
}

export const CHART_ASK_SUGGESTIONS = [
  'What does Saturn in my 5th house mean?',
  'Is 2027 a good year to change jobs?',
  'Why is my Mangal Dosha cancelled?',
  'विवाह कब होगा?',
]
