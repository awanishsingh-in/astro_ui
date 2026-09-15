import type { GrahaCode } from '@/types/astrology'

/**
 * The twenty-seven nakshatras in order, each with the graha that rules it.
 *
 * The rulership sequence (Ketu → Shukra → Surya → Chandra → Mangal → Rahu →
 * Guru → Shani → Budha) repeats three times across the zodiac, and it is what
 * the Vimshottari dasha is entered at.
 */
export const NAKSHATRAS: { name: string; lord: GrahaCode }[] = [
  { name: 'Ashwini', lord: 'Ke' },
  { name: 'Bharani', lord: 'Ve' },
  { name: 'Krittika', lord: 'Su' },
  { name: 'Rohini', lord: 'Mo' },
  { name: 'Mrigashira', lord: 'Ma' },
  { name: 'Ardra', lord: 'Ra' },
  { name: 'Punarvasu', lord: 'Ju' },
  { name: 'Pushya', lord: 'Sa' },
  { name: 'Ashlesha', lord: 'Me' },
  { name: 'Magha', lord: 'Ke' },
  { name: 'P.Phalguni', lord: 'Ve' },
  { name: 'U.Phalguni', lord: 'Su' },
  { name: 'Hasta', lord: 'Mo' },
  { name: 'Chitra', lord: 'Ma' },
  { name: 'Swati', lord: 'Ra' },
  { name: 'Vishakha', lord: 'Ju' },
  { name: 'Anuradha', lord: 'Sa' },
  { name: 'Jyeshtha', lord: 'Me' },
  { name: 'Mula', lord: 'Ke' },
  { name: 'P.Ashadha', lord: 'Ve' },
  { name: 'U.Ashadha', lord: 'Su' },
  { name: 'Shravana', lord: 'Mo' },
  { name: 'Dhanishta', lord: 'Ma' },
  { name: 'Shatabhisha', lord: 'Ra' },
  { name: 'P.Bhadra', lord: 'Ju' },
  { name: 'U.Bhadra', lord: 'Sa' },
  { name: 'Revati', lord: 'Me' },
]

/** Vimshottari: the fixed order and each graha's share of the 120 years. */
export const VIMSHOTTARI: { graha: GrahaCode; years: number }[] = [
  { graha: 'Ke', years: 7 },
  { graha: 'Ve', years: 20 },
  { graha: 'Su', years: 6 },
  { graha: 'Mo', years: 10 },
  { graha: 'Ma', years: 7 },
  { graha: 'Ra', years: 18 },
  { graha: 'Ju', years: 16 },
  { graha: 'Sa', years: 19 },
  { graha: 'Me', years: 17 },
]

/** Which graha rules each rashi, by zodiacal index (0 = Mesha). */
export const RASHI_LORDS: GrahaCode[] = [
  'Ma', // Mesha
  'Ve', // Vrishabha
  'Me', // Mithuna
  'Mo', // Karka
  'Su', // Simha
  'Me', // Kanya
  'Ve', // Tula
  'Ma', // Vrischika
  'Ju', // Dhanu
  'Sa', // Makara
  'Sa', // Kumbha
  'Ju', // Meena
]

/** Exaltation, debilitation and own signs, by rashi index. */
export const DIGNITY_TABLE: Record<GrahaCode, { exalted?: number; debilitated?: number; own: number[] }> = {
  Su: { exalted: 0, debilitated: 6, own: [4] },
  Mo: { exalted: 1, debilitated: 7, own: [3] },
  Ma: { exalted: 9, debilitated: 3, own: [0, 7] },
  Me: { exalted: 5, debilitated: 11, own: [2, 5] },
  Ve: { exalted: 11, debilitated: 5, own: [1, 6] },
  Ju: { exalted: 3, debilitated: 9, own: [8, 11] },
  Sa: { exalted: 6, debilitated: 0, own: [9, 10] },
  Ra: { own: [] },
  Ke: { own: [] },
}

/**
 * Special aspects beyond the seventh, which every graha casts.
 * Mangal adds the 4th and 8th, Guru the 5th and 9th, Shani the 3rd and 10th.
 */
export const SPECIAL_DRISHTI: Partial<Record<GrahaCode, number[]>> = {
  Ma: [4, 8],
  Ju: [5, 9],
  Sa: [3, 10],
}
