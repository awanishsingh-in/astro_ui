import type { FestivalEntry, VratEntry } from '@/types/astrology'

/**
 * Curated festival + vrat catalogue for Calendar lists and detail pages.
 * Dates are illustrative for the Cyklos mock (aligned with 2026 almanac entries).
 */

export const FESTIVAL_CATALOG: FestivalEntry[] = [
  {
    id: 'ganesh-visarjan',
    name: 'Ganesh Visarjan',
    date: '2026-09-25',
    hinduDate: 'Bhadrapada Shukla Chaturdashi',
    regions: 'Pan-India',
    category: 'major',
    blurb: 'Immersion day that closes Ganesh Chaturthi — clay idols return to water.',
    significance:
      'Ganesh Visarjan marks the farewell of Ganesha after the days of worship that began on Chaturthi. Families carry the murti in procession and immerse it, asking the deity to return next year. Regional practice varies in length — from one-and-a-half days to eleven — but the immersion itself is the shared close.',
    timings: [
      { label: 'Chaturdashi tithi', value: '05:40 — 03:12 (+1)' },
      { label: 'Immersion muhurat', value: '11:48 — 12:36' },
      { label: 'Evening aarti', value: '18:10 — 19:00' },
    ],
    rituals: 'Final aarti, visarjan procession, immersion, and distribution of prasad.',
    relatedIds: ['ganesh-chaturthi'],
  },
  {
    id: 'ganesh-chaturthi',
    name: 'Ganesh Chaturthi',
    date: '2026-09-14',
    hinduDate: 'Bhadrapada Shukla Chaturthi',
    regions: 'Pan-India · strong in Maharashtra',
    category: 'major',
    blurb: 'Birth festival of Ganesha — the obstacle-remover welcomed into the home.',
    significance:
      'Ganesh Chaturthi opens the season of clay idols, modak offerings, and community pandals. The day is observed as an invitation: Ganesha arrives, stays for a set number of days, and leaves at Visarjan.',
    timings: [
      { label: 'Chaturthi tithi', value: '10:22 — 07:48 (+1)' },
      { label: 'Madhyahna puja', value: '11:10 — 13:40' },
    ],
    rituals: 'Sthapana, shodashopachar puja, modak naivedya, aarti.',
    relatedIds: ['ganesh-visarjan'],
  },
  {
    id: 'sarva-pitru-amavasya',
    name: 'Sarva Pitru Amavasya',
    date: '2026-10-10',
    hinduDate: 'Ashwin Amavasya',
    regions: 'Pan-India',
    category: 'observance',
    blurb: 'Closing day of Pitru Paksha — tarpan for all ancestors.',
    significance:
      'Sarva Pitru Amavasya is the day set aside when the exact death tithi is unknown. Families offer tarpan and food so every ancestor is remembered before Sharad Navratri begins.',
    timings: [{ label: 'Amavasya', value: 'Full day until sunrise next' }],
    rituals: 'Tarpan, pind daan where customary, charity in the ancestors’ name.',
  },
  {
    id: 'sharad-navratri-begins',
    name: 'Sharad Navratri begins',
    date: '2026-10-11',
    hinduDate: 'Ashwin Shukla Pratipada',
    regions: 'Pan-India',
    category: 'major',
    blurb: 'Nine nights of Devi begin with Ghatasthapana.',
    significance:
      'Sharad Navratri opens with the kalash installation. Each of the nine days honours a form of Durga, building toward Maha Navami and Vijayadashami.',
    timings: [
      { label: 'Pratipada', value: 'Sunrise onward' },
      { label: 'Ghatasthapana muhurat', value: '06:18 — 07:42' },
    ],
    rituals: 'Kalash sthapana, daily aarti, fasting as observed in the family.',
    relatedIds: ['maha-navami', 'vijayadashami'],
  },
  {
    id: 'maha-navami',
    name: 'Maha Navami',
    date: '2026-10-19',
    hinduDate: 'Ashwin Shukla Navami',
    regions: 'Pan-India',
    category: 'major',
    blurb: 'Ninth day of Sharad Navratri — Sandhi puja and Kanya puja in many homes.',
    significance:
      'Maha Navami is the ninth night of Sharad Navratri. Traditions gather around Sandhi puja (the junction of Ashtami and Navami) and, in many households, Kanya / Kumari puja. It is the crest of the nine nights before Vijayadashami.',
    timings: [
      { label: 'Navami tithi', value: '05:40 — 03:12 (+1)' },
      { label: 'Puja muhurat', value: '11:48 — 12:36' },
      { label: 'Sandhi puja', value: '02:48 — 03:36' },
    ],
    rituals: 'Sandhi puja, Kanya puja, aarti, and preparation for Vijayadashami.',
    relatedIds: ['sharad-navratri-begins', 'vijayadashami'],
  },
  {
    id: 'vijayadashami',
    name: 'Vijayadashami',
    date: '2026-10-20',
    hinduDate: 'Ashwin Shukla Dashami',
    regions: 'Pan-India',
    category: 'major',
    blurb: 'Dussehra — the tenth day that closes Sharad Navratri.',
    significance:
      'Vijayadashami commemorates the victory of Dharma. In the north, Ramlila concludes with Ravana’s effigy; elsewhere Aparajita puja and Shami worship mark the day. It is also treated as an auspicious start for learning and new work.',
    timings: [
      { label: 'Dashami tithi', value: '03:12 — 01:05 (+1)' },
      { label: 'Aparajita puja', value: '13:10 — 14:00' },
    ],
    rituals: 'Aparajita puja, Shami / Seemollanghan where customary, Ramlila close.',
    relatedIds: ['maha-navami', 'sharad-navratri-begins'],
  },
  {
    id: 'sharad-purnima',
    name: 'Sharad Purnima',
    date: '2026-10-25',
    hinduDate: 'Ashwin Purnima',
    regions: 'Pan-India',
    category: 'observance',
    blurb: 'Full moon of Ashwin — kheer left under moonlight in many homes.',
    significance:
      'Sharad Purnima is the brightest full moon of the harvest season. Folklore ties it to Lakshmi’s grace and to cooling the mind under moonlight.',
    timings: [{ label: 'Purnima', value: 'Moonrise onward' }],
    rituals: 'Kheer under moonlight, Lakshmi remembrance, night vigil where observed.',
  },
  {
    id: 'diwali-lakshmi',
    name: 'Diwali — Lakshmi Puja',
    date: '2026-11-08',
    hinduDate: 'Kartik Amavasya',
    regions: 'Pan-India',
    category: 'major',
    blurb: 'The main night of Diwali — lamps and Lakshmi–Ganesha puja.',
    significance:
      'Lakshmi Puja is the heart of Diwali for most North Indian households: the home is cleaned, lamps are lit, and Lakshmi and Ganesha are welcomed for the year ahead.',
    timings: [
      { label: 'Amavasya', value: 'Evening window' },
      { label: 'Lakshmi puja muhurat', value: '18:24 — 20:06' },
    ],
    rituals: 'Deepdan, Lakshmi–Ganesha puja, sweets, and family gathering.',
  },
]

export const VRAT_CATALOG: VratEntry[] = [
  {
    id: 'parsva-ekadashi',
    name: 'Parsva Ekadashi',
    date: '2026-09-22',
    hinduDate: 'Bhadrapada Shukla Ekadashi',
    kind: 'ekadashi',
    tithiWindow: '18:10 (21 Sep) – 20:02',
    parana: '06:12 – 08:36, 23 Sep',
    fastType: 'Nirjala / Phalahar',
    involves:
      'Observed as a Vishnu fast. Many keep a fruit-and-milk day; some observe nirjala. The fast breaks on Dwadashi in the parana window.',
    pujaVidhi: 'Morning snana, Vishnu / Tulsi remembrance, evening aarti, early rest.',
  },
  {
    id: 'aja-ekadashi',
    name: 'Aja Ekadashi',
    date: '2026-09-07',
    hinduDate: 'Bhadrapada Krishna Ekadashi',
    kind: 'ekadashi',
    tithiWindow: '07:20 – 05:48 (+1)',
    parana: '06:05 – 08:40 next day',
    fastType: 'Phalahar',
    involves: 'Krishna-paksha Ekadashi of Bhadrapada — a quieter fast before the bright fortnight festivals.',
    pujaVidhi: 'Simple Vishnu puja, abstinence from grains, evening katha where available.',
  },
  {
    id: 'pradosh-krishna-sep',
    name: 'Pradosh Vrat',
    date: '2026-09-08',
    hinduDate: 'Bhadrapada Krishna Trayodashi',
    kind: 'pradosh',
    tithiWindow: 'Trayodashi evening',
    parana: 'After evening aarti',
    fastType: 'Sunset fast',
    involves: 'Observed from late afternoon into the first prahar of night, dedicated to Shiva.',
    pujaVidhi: 'Abhishek, bilva leaves, evening aarti at Pradosh kaal.',
  },
  {
    id: 'bhadrapada-amavasya',
    name: 'Bhadrapada Amavasya',
    date: '2026-09-11',
    hinduDate: 'Bhadrapada Amavasya',
    kind: 'amavasya',
    tithiWindow: 'Full Amavasya day',
    parana: 'Not a break-fast day',
    fastType: 'Optional ancestral observance',
    involves: 'New-moon day often used for pitru tarpan before the brighter festivals of the month.',
    pujaVidhi: 'Tarpan if customary; quiet household day.',
  },
  {
    id: 'pradosh-shukla-sep',
    name: 'Pradosh Vrat',
    date: '2026-09-24',
    hinduDate: 'Bhadrapada Shukla Trayodashi',
    kind: 'pradosh',
    tithiWindow: 'Trayodashi evening',
    parana: 'After evening aarti',
    fastType: 'Sunset fast',
    involves: 'Shukla-paksha Pradosh in Bhadrapada — often kept before Anant Chaturdashi.',
    pujaVidhi: 'Shiva aarti in the Pradosh window; light meal after.',
  },
  {
    id: 'bhadrapada-purnima',
    name: 'Bhadrapada Purnima',
    date: '2026-09-26',
    hinduDate: 'Bhadrapada Purnima',
    kind: 'purnima',
    tithiWindow: 'Full moon day',
    parana: 'Not required',
    fastType: 'Optional Purnima vrat',
    involves: 'Full moon that also opens Pitru Paksha in many reckonings this year.',
    pujaVidhi: 'Satyanarayan katha where kept; moon sighting.',
  },
  {
    id: 'papankusha-ekadashi',
    name: 'Papankusha Ekadashi',
    date: '2026-10-22',
    hinduDate: 'Ashwin Shukla Ekadashi',
    kind: 'ekadashi',
    tithiWindow: '18:10 (21 Oct) – 20:02',
    parana: '06:12 – 08:36, 23 Oct',
    fastType: 'Nirjala / Phalahar',
    involves:
      'Ashwin Shukla Ekadashi, falling soon after Vijayadashami. Free to read; a push reminder needs an account.',
    pujaVidhi: 'Vishnu remembrance, grain-free day, parana on Dwadashi morning.',
  },
  {
    id: 'indira-ekadashi',
    name: 'Indira Ekadashi',
    date: '2026-10-06',
    hinduDate: 'Ashwin Krishna Ekadashi',
    kind: 'ekadashi',
    tithiWindow: 'Full Ekadashi window',
    parana: 'Dwadashi morning',
    fastType: 'Phalahar',
    involves: 'Krishna-paksha Ekadashi of Ashwin, during Pitru Paksha.',
    pujaVidhi: 'Quiet Vishnu fast; some combine with pitru remembrance.',
  },
]

export function festivalById(id: string): FestivalEntry | undefined {
  return FESTIVAL_CATALOG.find((f) => f.id === id)
}

export function festivalsForYear(year: number): FestivalEntry[] {
  return FESTIVAL_CATALOG.filter((f) => f.date.startsWith(String(year))).sort((a, b) =>
    a.date.localeCompare(b.date),
  )
}

export function vratsForYear(year: number): VratEntry[] {
  return VRAT_CATALOG.filter((v) => v.date.startsWith(String(year))).sort((a, b) =>
    a.date.localeCompare(b.date),
  )
}

export function vratById(id: string): VratEntry | undefined {
  return VRAT_CATALOG.find((v) => v.id === id)
}

export function nextFestivals(fromIso: string, limit = 3): FestivalEntry[] {
  return FESTIVAL_CATALOG.filter((f) => f.date >= fromIso)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit)
}

export function nextVrats(fromIso: string, limit = 3): VratEntry[] {
  return VRAT_CATALOG.filter((v) => v.date >= fromIso)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit)
}

export function festivalOnDate(iso: string): FestivalEntry | undefined {
  return FESTIVAL_CATALOG.find((f) => f.date === iso.slice(0, 10))
}

export const FESTIVAL_CATEGORY_LABEL: Record<FestivalEntry['category'], string> = {
  major: 'Major',
  gazetted: 'Gazetted',
  regional: 'Regional',
  observance: 'Observance',
}

export const VRAT_KIND_LABEL: Record<VratEntry['kind'], string> = {
  ekadashi: 'Ekadashi',
  pradosh: 'Pradosh',
  purnima: 'Purnima',
  amavasya: 'Amavasya',
  sankashti: 'Sankashti',
  other: 'Vrat',
}

export const HINDU_MONTHS = [
  { id: 'chaitra', name: 'Chaitra', range: 'Mar–Apr' },
  { id: 'vaishakha', name: 'Vaishakha', range: 'Apr–May' },
  { id: 'jyeshtha', name: 'Jyeshtha', range: 'May–Jun' },
  { id: 'ashadha', name: 'Ashadha', range: 'Jun–Jul' },
  { id: 'shravana', name: 'Shravana', range: 'Jul–Aug' },
  { id: 'bhadrapada', name: 'Bhadrapada', range: 'Aug–Sep' },
  { id: 'ashwina', name: 'Ashwina', range: 'Sep–Oct' },
  { id: 'kartika', name: 'Kartika', range: 'Oct–Nov' },
  { id: 'margashirsha', name: 'Margashirsha', range: 'Nov–Dec' },
  { id: 'pausha', name: 'Pausha', range: 'Dec–Jan' },
  { id: 'magha', name: 'Magha', range: 'Jan–Feb' },
  { id: 'phalguna', name: 'Phalguna', range: 'Feb–Mar' },
] as const

export const TITHI_NAMES = [
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
] as const
