import type { Chart, GrahaCode } from '@/types/astrology'
import type { BirthDetails } from '@/types/user'
import { NAKSHATRAS, RASHI_LORDS } from './nakshatras'
import {
  GANA_BY_NAKSHATRA,
  GANA_NAMES,
  GRAHA_FRIENDS,
  KOOTAS,
  NADI_BY_NAKSHATRA,
  NADI_NAMES,
  VARNA_BY_RASHI,
  VARNA_NAMES,
  VASHYA_BY_RASHI,
  YONI_BY_NAKSHATRA,
  YONI_OPPOSED,
  type KootaId,
} from './kootas'
import { isManglik } from './manglik-mock'
import { RASHIS } from '@/utils/astro'

/**
 * Guna Milan.
 *
 * Both charts come from the mock ephemeris, but the scoring itself follows the
 * classical rules against the two Moon positions - so the same pair always
 * produces the same score, and the per-koota breakdown can be checked.
 *
 * What it deliberately does not do is claim more than the tradition does. The
 * score is one system's reading of two birth stars. It is not a measurement,
 * and the copy around it never says otherwise.
 */

export interface KootaResult {
  id: KootaId
  name: string
  score: number
  max: number
  reads: string
  /** What the two charts actually hold for this koota. */
  detail: string
  /** Present when this koota is the reason for a friction. */
  concern?: string
}

export interface MatchProfile {
  name: string
  details: BirthDetails
  moonRashi: string
  moonNakshatra: string
  rashiIndex: number
  nakshatraIndex: number
}

export interface MatchResult {
  a: MatchProfile
  b: MatchProfile
  total: number
  max: number
  kootas: KootaResult[]
  strengths: KootaResult[]
  frictions: KootaResult[]
  /** Plain-language reading of where the total sits. Never a verdict. */
  summary: string
  /** The honest caveat, always shown. */
  caveat: string
  manglik: { a: boolean; b: boolean; note: string }
}

function moonOf(chart: Chart) {
  const moon = chart.grahas.find((g) => g.graha === 'Mo')!
  const rashiIndex = RASHIS.findIndex((r) => r.name === moon.rashi)
  const nakshatraIndex = NAKSHATRAS.findIndex((n) => n.name === moon.nakshatra.name)
  return { moon, rashiIndex, nakshatraIndex: nakshatraIndex === -1 ? 0 : nakshatraIndex }
}

export function buildMatch(
  aName: string,
  aDetails: BirthDetails,
  aChart: Chart,
  bName: string,
  bDetails: BirthDetails,
  bChart: Chart,
): MatchResult {
  const A = moonOf(aChart)
  const B = moonOf(bChart)

  const kootas: KootaResult[] = []
  const add = (id: KootaId, score: number, detail: string, concern?: string) => {
    const meta = KOOTAS.find((k) => k.id === id)!
    kootas.push({ id, name: meta.name, max: meta.max, reads: meta.reads, score, detail, concern })
  }

  // ── Varna (1) ──────────────────────────────────────────────────
  const varnaA = VARNA_BY_RASHI[A.rashiIndex]
  const varnaB = VARNA_BY_RASHI[B.rashiIndex]
  add(
    'varna',
    varnaB <= varnaA ? 1 : 0,
    `${VARNA_NAMES[varnaA]} and ${VARNA_NAMES[varnaB]}`,
    varnaB > varnaA ? 'The classical rule withholds this point in this direction.' : undefined,
  )

  // ── Vashya (2) ─────────────────────────────────────────────────
  const vashyaSame = VASHYA_BY_RASHI[A.rashiIndex] === VASHYA_BY_RASHI[B.rashiIndex]
  add(
    'vashya',
    vashyaSame ? 2 : 1,
    vashyaSame ? 'Both fall in the same vashya group' : 'Different vashya groups',
  )

  // ── Tara (3) - counted both ways, remainders 3, 5 and 7 are weak ──
  const forward = ((B.nakshatraIndex - A.nakshatraIndex + 27) % 27) + 1
  const backward = ((A.nakshatraIndex - B.nakshatraIndex + 27) % 27) + 1
  const weak = (n: number) => [3, 5, 7].includes(n % 9)
  const taraScore = (weak(forward) ? 0 : 1.5) + (weak(backward) ? 0 : 1.5)
  add(
    'tara',
    taraScore,
    `Counted ${forward} one way and ${backward} the other`,
    taraScore < 3 ? 'One of the two counts falls on a weak tara.' : undefined,
  )

  // ── Yoni (4) ───────────────────────────────────────────────────
  const yoniA = YONI_BY_NAKSHATRA[A.nakshatraIndex]
  const yoniB = YONI_BY_NAKSHATRA[B.nakshatraIndex]
  const opposed = YONI_OPPOSED.some(
    ([x, y]) => (x === yoniA && y === yoniB) || (y === yoniA && x === yoniB),
  )
  const yoniScore = yoniA === yoniB ? 4 : opposed ? 1 : 3
  add(
    'yoni',
    yoniScore,
    `${yoniA} and ${yoniB}`,
    opposed ? 'These two yonis are classically opposed.' : undefined,
  )

  // ── Graha Maitri (5) ───────────────────────────────────────────
  const lordA = RASHI_LORDS[A.rashiIndex] as GrahaCode
  const lordB = RASHI_LORDS[B.rashiIndex] as GrahaCode
  const friendly =
    lordA === lordB ||
    (GRAHA_FRIENDS[lordA]?.includes(lordB) ?? false) ||
    (GRAHA_FRIENDS[lordB]?.includes(lordA) ?? false)
  const mutual =
    (GRAHA_FRIENDS[lordA]?.includes(lordB) ?? false) &&
    (GRAHA_FRIENDS[lordB]?.includes(lordA) ?? false)
  const maitriScore = lordA === lordB ? 5 : mutual ? 5 : friendly ? 3 : 1
  add(
    'maitri',
    maitriScore,
    `Moon-sign lords ${lordA} and ${lordB}`,
    maitriScore <= 1 ? 'The two sign lords are not natural friends.' : undefined,
  )

  // ── Gana (6) ───────────────────────────────────────────────────
  const ganaA = GANA_BY_NAKSHATRA[A.nakshatraIndex]
  const ganaB = GANA_BY_NAKSHATRA[B.nakshatraIndex]
  const ganaScore =
    ganaA === ganaB ? 6 : (ganaA === 2 && ganaB !== 2) || (ganaB === 2 && ganaA !== 2) ? 0 : 5
  add(
    'gana',
    ganaScore,
    `${GANA_NAMES[ganaA]} and ${GANA_NAMES[ganaB]}`,
    ganaScore === 0 ? 'Rakshasa against another gana is the classical mismatch.' : undefined,
  )

  // ── Bhakoot (7) - 6/8, 5/9 and 2/12 are the doshas ─────────────
  const gap = ((B.rashiIndex - A.rashiIndex + 12) % 12) + 1
  const reverse = ((A.rashiIndex - B.rashiIndex + 12) % 12) + 1
  const pair = [gap, reverse].sort((x, y) => x - y).join('/')
  const bhakootDosha = ['6/8', '5/9', '2/12'].includes(pair)
  add(
    'bhakoot',
    bhakootDosha ? 0 : 7,
    `The moon signs stand ${pair} apart`,
    bhakootDosha ? `A ${pair} bhakoot is the classical dosha.` : undefined,
  )

  // ── Nadi (8) - the same nadi is the one the tradition weighs most ──
  const nadiA = NADI_BY_NAKSHATRA[A.nakshatraIndex]
  const nadiB = NADI_BY_NAKSHATRA[B.nakshatraIndex]
  add(
    'nadi',
    nadiA === nadiB ? 0 : 8,
    `${NADI_NAMES[nadiA]} and ${NADI_NAMES[nadiB]}`,
    nadiA === nadiB ? 'Same nadi - the koota the tradition weighs most heavily.' : undefined,
  )

  const total = Math.round(kootas.reduce((sum, k) => sum + k.score, 0) * 10) / 10
  const strengths = kootas.filter((k) => k.score === k.max && k.max >= 3)
  const frictions = kootas.filter((k) => k.score < k.max * 0.5)

  const profile = (name: string, details: BirthDetails, m: ReturnType<typeof moonOf>): MatchProfile => ({
    name,
    details,
    moonRashi: m.moon.rashi,
    moonNakshatra: m.moon.nakshatra.name,
    rashiIndex: m.rashiIndex,
    nakshatraIndex: m.nakshatraIndex,
  })

  const manglikA = isManglik(aChart)
  const manglikB = isManglik(bChart)

  return {
    a: profile(aName, aDetails, A),
    b: profile(bName, bDetails, B),
    total,
    max: 36,
    kootas,
    strengths,
    frictions,
    summary: summarise(total, frictions),
    caveat:
      'Guna Milan scores two birth stars against a classical checklist. It is one tradition’s reading, not a measurement, and it has nothing to say about how two people actually treat each other. Read the kootas below rather than the number.',
    manglik: {
      a: manglikA,
      b: manglikB,
      note:
        manglikA === manglikB
          ? manglikA
            ? 'Mangal sits in a manglik house for both charts, which the tradition treats as cancelling out.'
            : 'Neither chart is manglik.'
          : `Mangal sits in a manglik house for ${manglikA ? aName : bName} only. Traditions differ sharply on what follows from that.`,
    },
  }
}

/** Where the total sits, without a verdict attached to it. */
function summarise(total: number, frictions: KootaResult[]): string {
  const band =
    total >= 28
      ? 'well above the level most traditions look for'
      : total >= 18
        ? 'above the eighteen points most traditions treat as the working minimum'
        : 'below the eighteen points most traditions treat as the working minimum'

  const friction =
    frictions.length === 0
      ? 'No koota falls badly short.'
      : `${frictions.length === 1 ? 'One koota falls' : `${frictions.length} kootas fall`} well short - ${frictions.map((f) => f.name).join(', ')}.`

  return `${total} of 36 is ${band}. ${friction}`
}
