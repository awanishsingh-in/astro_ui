import type { Chart } from '@/types/astrology'
import { RASHIS } from '@/utils/astro'
import { RASHI_LORDS } from './nakshatras'
import { GRAHA_FRIENDS } from './kootas'

/**
 * The lighter compatibility read.
 *
 * Where Guna Milan runs eight kootas against two birth stars, this reads two
 * moon signs — their element, their mode, and whether their lords get on. It
 * is a sketch, and the UI says so: the full reading is the matching screen.
 */

export type Element = 'Fire' | 'Earth' | 'Air' | 'Water'
export type Mode = 'Movable' | 'Fixed' | 'Dual'

/** Element by rashi index, repeating Fire · Earth · Air · Water from Mesha. */
export const ELEMENT_BY_RASHI: Element[] = [
  'Fire', 'Earth', 'Air', 'Water',
  'Fire', 'Earth', 'Air', 'Water',
  'Fire', 'Earth', 'Air', 'Water',
]

/** Mode by rashi index, repeating Movable · Fixed · Dual from Mesha. */
export const MODE_BY_RASHI: Mode[] = [
  'Movable', 'Fixed', 'Dual',
  'Movable', 'Fixed', 'Dual',
  'Movable', 'Fixed', 'Dual',
  'Movable', 'Fixed', 'Dual',
]

export interface CompatibilityDimension {
  label: string
  /** 0–100. A sketch, not a measurement. */
  value: number
  detail: string
}

export interface CompatibilityResult {
  a: { name: string; rashi: string; element: Element; mode: Mode }
  b: { name: string; rashi: string; element: Element; mode: Mode }
  /** 0–100, the mean of the dimensions below. */
  overall: number
  dimensions: CompatibilityDimension[]
  strengths: string[]
  frictions: string[]
  summary: string
  caveat: string
}

/** Fire warms Air; Earth holds Water. The other pairings ask more of both. */
function elementScore(a: Element, b: Element): number {
  if (a === b) return 85
  const easy: [Element, Element][] = [
    ['Fire', 'Air'],
    ['Earth', 'Water'],
  ]
  if (easy.some(([x, y]) => (x === a && y === b) || (y === a && x === b))) return 78
  return 52
}

function modeScore(a: Mode, b: Mode): number {
  if (a === b) return a === 'Fixed' ? 58 : 70
  return 74
}

export function buildCompatibility(
  aName: string,
  aChart: Chart,
  bName: string,
  bChart: Chart,
): CompatibilityResult {
  const moon = (chart: Chart) => {
    const m = chart.grahas.find((g) => g.graha === 'Mo')!
    const index = RASHIS.findIndex((r) => r.name === m.rashi)
    return { rashi: m.rashi, index }
  }

  const A = moon(aChart)
  const B = moon(bChart)

  const elementA = ELEMENT_BY_RASHI[A.index]
  const elementB = ELEMENT_BY_RASHI[B.index]
  const modeA = MODE_BY_RASHI[A.index]
  const modeB = MODE_BY_RASHI[B.index]

  const lordA = RASHI_LORDS[A.index]
  const lordB = RASHI_LORDS[B.index]
  const mutual =
    lordA === lordB ||
    ((GRAHA_FRIENDS[lordA]?.includes(lordB) ?? false) &&
      (GRAHA_FRIENDS[lordB]?.includes(lordA) ?? false))
  const oneWay =
    (GRAHA_FRIENDS[lordA]?.includes(lordB) ?? false) ||
    (GRAHA_FRIENDS[lordB]?.includes(lordA) ?? false)

  // Distance between the two moon signs — 7 apart is the classical opposition.
  const gap = ((B.index - A.index + 12) % 12) + 1
  const distanceScore = gap === 1 ? 80 : gap === 7 ? 72 : [6, 8, 12].includes(gap) ? 48 : 66

  const dimensions: CompatibilityDimension[] = [
    {
      label: 'Temperament',
      value: elementScore(elementA, elementB),
      detail: `${elementA} and ${elementB}${elementA === elementB ? ' — the same element, which reads as easy recognition' : ''}`,
    },
    {
      label: 'Pace',
      value: modeScore(modeA, modeB),
      detail: `${modeA} and ${modeB}${modeA === modeB && modeA === 'Fixed' ? ' — both hold position, so neither gives way first' : ''}`,
    },
    {
      label: 'Mind',
      value: mutual ? 84 : oneWay ? 66 : 45,
      detail: `Moon-sign lords ${lordA} and ${lordB} — ${mutual ? 'natural friends both ways' : oneWay ? 'friendly in one direction' : 'not natural friends'}`,
    },
    {
      label: 'Distance',
      value: distanceScore,
      detail: `The moon signs stand ${gap} apart${gap === 7 ? ', the classical opposition — attraction with tension in it' : ''}`,
    },
  ]

  const overall = Math.round(dimensions.reduce((sum, d) => sum + d.value, 0) / dimensions.length)

  return {
    a: { name: aName, rashi: A.rashi, element: elementA, mode: modeA },
    b: { name: bName, rashi: B.rashi, element: elementB, mode: modeB },
    overall,
    dimensions,
    strengths: dimensions.filter((d) => d.value >= 70).map((d) => `${d.label} — ${d.detail}`),
    frictions: dimensions.filter((d) => d.value < 60).map((d) => `${d.label} — ${d.detail}`),
    summary:
      overall >= 72
        ? 'The two moon signs sit comfortably together on most of what this reads.'
        : overall >= 58
          ? 'A workable pairing with one or two places that will take deliberate effort.'
          : 'This pairing asks more of both people than an easy one would.',
    caveat:
      'This reads two moon signs — their element, their pace and their lords. It is a sketch, not a reading of two people. Kundli Matching runs the full eight kootas against both birth stars, and even that is a tradition’s checklist rather than a prediction.',
  }
}
