import type {
  Ashtakavarga,
  BhavaPlacement,
  CalculationBasis,
  Chart,
  Drishti,
  GrahaPosition,
  Panchang,
} from '@/types/astrology'
import { BHAVA_SIGNIFIES } from '@/utils/astro'

/**
 * A calculated D-1 chart. Numbers are taken from the product reference so the
 * tables, the wheel and the reading citations all agree with one another.
 * Replaced by the ephemeris service later — the shape does not change.
 */

const grahas: GrahaPosition[] = [
  { graha: 'Su', rashi: 'Simha',     degree: 20, minute: 41, nakshatra: { name: 'P.Phalguni', pada: 3, lord: 'Ve' }, bhava: 12, dignity: 'own',          motion: 'direct' },
  { graha: 'Mo', rashi: 'Tula',      degree: 3,  minute: 8,  nakshatra: { name: 'Chitra',     pada: 3, lord: 'Ma' }, bhava: 2,  dignity: 'neutral',      motion: 'direct' },
  { graha: 'Ma', rashi: 'Karka',     degree: 2,  minute: 41, nakshatra: { name: 'Punarvasu',  pada: 4, lord: 'Ju' }, bhava: 11, dignity: 'debilitated',  motion: 'direct' },
  { graha: 'Me', rashi: 'Kanya',     degree: 27, minute: 36, nakshatra: { name: 'Chitra',     pada: 2, lord: 'Ma' }, bhava: 1,  dignity: 'own',          motion: 'direct' },
  { graha: 'Ve', rashi: 'Kanya',     degree: 4,  minute: 52, nakshatra: { name: 'U.Phalguni', pada: 3, lord: 'Su' }, bhava: 1,  dignity: 'debilitated',  motion: 'direct' },
  { graha: 'Ju', rashi: 'Dhanu',     degree: 8,  minute: 55, nakshatra: { name: 'Mula',       pada: 3, lord: 'Ke' }, bhava: 4,  dignity: 'own',          motion: 'direct' },
  { graha: 'Sa', rashi: 'Kumbha',    degree: 26, minute: 3,  nakshatra: { name: 'P.Bhadra',   pada: 2, lord: 'Ju' }, bhava: 6,  dignity: 'own',          motion: 'retrograde' },
  { graha: 'Ra', rashi: 'Kanya',     degree: 18, minute: 20, nakshatra: { name: 'Hasta',      pada: 3, lord: 'Mo' }, bhava: 1,  dignity: 'none',         motion: 'node' },
  { graha: 'Ke', rashi: 'Meena',     degree: 18, minute: 20, nakshatra: { name: 'Revati',     pada: 1, lord: 'Me' }, bhava: 7,  dignity: 'none',         motion: 'node' },
]

const bhavas: BhavaPlacement[] = [
  { bhava: 1,  rashi: 'Kanya',     lord: 'Budha',   lordCode: 'Me', lordSitsIn: 1,  occupants: ['Me', 'Ve', 'Ra'], signifies: BHAVA_SIGNIFIES[1] },
  { bhava: 2,  rashi: 'Tula',      lord: 'Shukra',  lordCode: 'Ve', lordSitsIn: 1,  occupants: ['Mo'],             signifies: BHAVA_SIGNIFIES[2] },
  { bhava: 3,  rashi: 'Vrischika', lord: 'Mangal',  lordCode: 'Ma', lordSitsIn: 11, occupants: [],                 signifies: BHAVA_SIGNIFIES[3] },
  { bhava: 4,  rashi: 'Dhanu',     lord: 'Guru',    lordCode: 'Ju', lordSitsIn: 4,  occupants: ['Ju'],             signifies: BHAVA_SIGNIFIES[4] },
  { bhava: 5,  rashi: 'Makara',    lord: 'Shani',   lordCode: 'Sa', lordSitsIn: 6,  occupants: [],                 signifies: BHAVA_SIGNIFIES[5] },
  { bhava: 6,  rashi: 'Kumbha',    lord: 'Shani',   lordCode: 'Sa', lordSitsIn: 6,  occupants: ['Sa'],             signifies: BHAVA_SIGNIFIES[6] },
  { bhava: 7,  rashi: 'Meena',     lord: 'Guru',    lordCode: 'Ju', lordSitsIn: 4,  occupants: ['Ke'],             signifies: BHAVA_SIGNIFIES[7] },
  { bhava: 8,  rashi: 'Mesha',     lord: 'Mangal',  lordCode: 'Ma', lordSitsIn: 11, occupants: [],                 signifies: BHAVA_SIGNIFIES[8] },
  { bhava: 9,  rashi: 'Vrishabha', lord: 'Shukra',  lordCode: 'Ve', lordSitsIn: 1,  occupants: [],                 signifies: BHAVA_SIGNIFIES[9] },
  { bhava: 10, rashi: 'Mithuna',   lord: 'Budha',   lordCode: 'Me', lordSitsIn: 1,  occupants: [],                 signifies: BHAVA_SIGNIFIES[10] },
  { bhava: 11, rashi: 'Karka',     lord: 'Chandra', lordCode: 'Mo', lordSitsIn: 2,  occupants: ['Ma'],             signifies: BHAVA_SIGNIFIES[11] },
  { bhava: 12, rashi: 'Simha',     lord: 'Surya',   lordCode: 'Su', lordSitsIn: 12, occupants: ['Su'],             signifies: BHAVA_SIGNIFIES[12] },
]

const drishti: Drishti[] = [
  { graha: 'Su', sitsIn: 12, aspects: [6],        by: ['7th'] },
  { graha: 'Mo', sitsIn: 2,  aspects: [8],        by: ['7th'] },
  { graha: 'Ma', sitsIn: 11, aspects: [2, 5, 6],  by: ['4th', '7th', '8th'] },
  { graha: 'Me', sitsIn: 1,  aspects: [7],        by: ['7th'] },
  { graha: 'Ve', sitsIn: 1,  aspects: [7],        by: ['7th'] },
  { graha: 'Ju', sitsIn: 4,  aspects: [8, 10, 12], by: ['5th', '7th', '9th'] },
  { graha: 'Sa', sitsIn: 6,  aspects: [3, 8, 12], by: ['3rd', '7th', '10th'] },
  { graha: 'Ra', sitsIn: 1,  aspects: [7],        by: ['7th'] },
  { graha: 'Ke', sitsIn: 7,  aspects: [1],        by: ['7th'] },
]

const ashtakavarga: Ashtakavarga = {
  total: 337,
  mean: 28.1,
  entries: [
    { bhava: 1,  rashi: 'Kanya',     bindus: 24 },
    { bhava: 2,  rashi: 'Tula',      bindus: 31 },
    { bhava: 3,  rashi: 'Vrischika', bindus: 26 },
    { bhava: 4,  rashi: 'Dhanu',     bindus: 29 },
    { bhava: 5,  rashi: 'Makara',    bindus: 28 },
    { bhava: 6,  rashi: 'Kumbha',    bindus: 30 },
    { bhava: 7,  rashi: 'Meena',     bindus: 27 },
    { bhava: 8,  rashi: 'Mesha',     bindus: 28 },
    { bhava: 9,  rashi: 'Vrishabha', bindus: 32 },
    { bhava: 10, rashi: 'Mithuna',   bindus: 25 },
    { bhava: 11, rashi: 'Karka',     bindus: 30 },
    { bhava: 12, rashi: 'Simha',     bindus: 27 },
  ],
}

export const rashiChart: Chart = {
  varga: 'D1',
  lagna: { rashi: 'Kanya', degree: 14, minute: 22 },
  grahas,
  bhavas,
  drishti,
  ashtakavarga,
  notes: [
    'Four grahas sit in their own sign, which is unusually strong. Budha rules the lagna and stands in it — the chart is self-directed rather than carried by others.',
    'Mangal and Shukra are debilitated. Effort and comfort both cost more here than the rest of the chart suggests.',
    'Lords of bh 1, 2, 9 and 10 all stand in bh 1.',
  ],
}

export const calculationBasis: CalculationBasis = {
  ephemeris: 'Swiss Ephemeris · DE431',
  zodiac: 'Sidereal — nirayana',
  ayanamsa: 'Lahiri (Chitrapaksha) — 23°46′09″ at this moment',
  houseSystem: 'Equal bhava, measured from the lagna degree',
  nodes: 'Mean — Rahu and Ketu held exactly 180° apart',
  timeZone: 'IST, UTC +05:30 · no daylight saving in India in 1994',
  lmtCorrection: '−8m 34s, from 82.14°E against the 82.5°E standard meridian',
  coordinates: '22.0797°N 82.1409°E · geocoded from Bilaspur, Chhattisgarh',
  julianDay: '2449597.54861',
  siderealTime: '04h 21m 18s',
  dashaSystem: 'Vimshottari, 120 years, entered at Chandra’s nakshatra',
  rounding: 'Degrees displayed to the arc-minute; held at full precision in calculation',
}

export const todayPanchang: Panchang = {
  date: new Date().toISOString(),
  tithi: 'Shukla Saptami',
  nakshatra: 'Chitra',
}
