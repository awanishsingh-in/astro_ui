import type { BhavaNumber, Chart, Dignity, GrahaCode, Motion, RashiName } from '@/types/astrology'

/**
 * Text-presentation selector. Chrome renders several of these code points as
 * colour emoji by default — ♈ and ♂ come out as purple tiles rather than
 * typeset glyphs — so every astrological glyph carries U+FE0E.
 */
const TEXT = '\uFE0E'

/**
 * The display vocabulary of the chart: glyphs, names, and the colour role each
 * value carries. Components read from here so a graha is named and coloured
 * identically in the wheel, the tables and a reading's citation.
 */

interface GrahaMeta {
  code: GrahaCode
  /** Sanskrit name used in tables and dasha rows. */
  name: string
  /** English name used in prose and citations. */
  english: string
  glyph: string
  nature: 'benefic' | 'malefic' | 'node' | 'variable'
}

export const GRAHAS: Record<GrahaCode, GrahaMeta> = {
  Su: { code: 'Su', name: 'Surya', english: 'Sun', glyph: '☉' + TEXT, nature: 'malefic' },
  Mo: { code: 'Mo', name: 'Chandra', english: 'Moon', glyph: '☾' + TEXT, nature: 'variable' },
  Ma: { code: 'Ma', name: 'Mangal', english: 'Mars', glyph: '♂' + TEXT, nature: 'malefic' },
  Me: { code: 'Me', name: 'Budha', english: 'Mercury', glyph: '☿' + TEXT, nature: 'variable' },
  Ve: { code: 'Ve', name: 'Shukra', english: 'Venus', glyph: '♀' + TEXT, nature: 'benefic' },
  Ju: { code: 'Ju', name: 'Guru', english: 'Jupiter', glyph: '♃' + TEXT, nature: 'benefic' },
  Sa: { code: 'Sa', name: 'Shani', english: 'Saturn', glyph: '♄' + TEXT, nature: 'malefic' },
  Ra: { code: 'Ra', name: 'Rahu', english: 'Rahu', glyph: '☊' + TEXT, nature: 'node' },
  Ke: { code: 'Ke', name: 'Ketu', english: 'Ketu', glyph: '☋' + TEXT, nature: 'node' },
}

export const GRAHA_ORDER: GrahaCode[] = ['Su', 'Mo', 'Ma', 'Me', 'Ve', 'Ju', 'Sa', 'Ra', 'Ke']

/** The twelve rashis in zodiacal order, with their glyph and English name. */
export const RASHIS: { name: RashiName; english: string; glyph: string }[] = [
  { name: 'Mesha', english: 'Aries', glyph: '♈' + TEXT },
  { name: 'Vrishabha', english: 'Taurus', glyph: '♉' + TEXT },
  { name: 'Mithuna', english: 'Gemini', glyph: '♊' + TEXT },
  { name: 'Karka', english: 'Cancer', glyph: '♋' + TEXT },
  { name: 'Simha', english: 'Leo', glyph: '♌' + TEXT },
  { name: 'Kanya', english: 'Virgo', glyph: '♍' + TEXT },
  { name: 'Tula', english: 'Libra', glyph: '♎' + TEXT },
  { name: 'Vrischika', english: 'Scorpio', glyph: '♏' + TEXT },
  { name: 'Dhanu', english: 'Sagittarius', glyph: '♐' + TEXT },
  { name: 'Makara', english: 'Capricorn', glyph: '♑' + TEXT },
  { name: 'Kumbha', english: 'Aquarius', glyph: '♒' + TEXT },
  { name: 'Meena', english: 'Pisces', glyph: '♓' + TEXT },
]

/** What each bhava is read for. Used in Readings' bhava index and in captions. */
export const BHAVA_SIGNIFIES: Record<BhavaNumber, string> = {
  1: 'self',
  2: 'wealth and speech',
  3: 'siblings and effort',
  4: 'home and mother',
  5: 'children and mind',
  6: 'difficulty and debt',
  7: 'partnership',
  8: 'change and depth',
  9: 'fortune and belief',
  10: 'work and standing',
  11: 'gains',
  12: 'loss and rest',
}

export function rashiGlyph(name: RashiName): string {
  return RASHIS.find((r) => r.name === name)?.glyph ?? ''
}

/** Rashi index, 1-based — Mesha is 1. */
export function rashiIndex(name: RashiName): number {
  return RASHIS.findIndex((r) => r.name === name) + 1
}

/** Tailwind text colour class for a graha, from its natural benefic/malefic role. */
export function grahaToneClass(code: GrahaCode): string {
  switch (GRAHAS[code].nature) {
    case 'benefic':
      return 'text-gold-deep'
    case 'node':
      return 'text-muted'
    default:
      return 'text-purple'
  }
}

/**
 * The same three roles on a celestial surface. The light-surface classes are
 * unreadable on midnight, so dark surfaces get their own set rather than
 * being allowed to drift out of contrast.
 */
export function grahaToneClassDark(code: GrahaCode): string {
  switch (GRAHAS[code].nature) {
    case 'benefic':
      return 'text-gold-soft-line'
    case 'node':
      return 'text-on-celestial-faint'
    default:
      return 'text-on-celestial-muted'
  }
}

/** Tailwind text colour class for a dignity. Only the extremes are coloured. */
export function dignityToneClass(dignity: Dignity): string {
  switch (dignity) {
    case 'exalted':
      return 'text-dignity-exalted'
    case 'own':
      return 'text-dignity-own'
    case 'debilitated':
      return 'text-dignity-debilitated'
    default:
      return 'text-muted'
  }
}

export function dignityLabel(dignity: Dignity): string {
  switch (dignity) {
    case 'exalted':
      return 'Exalted'
    case 'own':
      return 'Own sign'
    case 'friendly':
      return 'Friendly'
    case 'neutral':
      return 'Neutral'
    case 'enemy':
      return 'Enemy'
    case 'debilitated':
      return 'Debilitated'
    default:
      return '—'
  }
}

export function motionLabel(motion: Motion): string {
  switch (motion) {
    case 'retrograde':
      return 'Retrograde'
    case 'stationary':
      return 'Stationary'
    case 'node':
      return 'Node'
    default:
      return 'Direct'
  }
}

/** `℞` is appended to a degree when the graha is retrograde. */
export const RETROGRADE_MARK = '℞'

/** `bh 10` — how a bhava is referenced inline throughout the product. */
export function bhavaRef(bhava: BhavaNumber): string {
  return `bh ${bhava}`
}

/** The three placements every chart is introduced by. */
export interface ChartSummary {
  ascendant: { rashi: RashiName; degree: number; minute: number }
  sun: { rashi: RashiName; degree: number; minute: number }
  moon: { rashi: RashiName; degree: number; minute: number }
}

/**
 * Pull the lagna, Surya and Chandra out of a chart.
 *
 * These three are what a chart is recognised by, so Home leads with them
 * rather than with the whole graha table.
 */
export function summariseChart(chart: Chart): ChartSummary {
  const find = (code: GrahaCode) => chart.grahas.find((g) => g.graha === code)
  const sun = find('Su')
  const moon = find('Mo')

  return {
    ascendant: {
      rashi: chart.lagna.rashi,
      degree: chart.lagna.degree,
      minute: chart.lagna.minute,
    },
    sun: {
      rashi: sun?.rashi ?? chart.lagna.rashi,
      degree: sun?.degree ?? 0,
      minute: sun?.minute ?? 0,
    },
    moon: {
      rashi: moon?.rashi ?? chart.lagna.rashi,
      degree: moon?.degree ?? 0,
      minute: moon?.minute ?? 0,
    },
  }
}
