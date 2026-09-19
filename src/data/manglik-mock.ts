import { buildChart } from '@/data/chart-mock'
import type { Chart } from '@/types/astrology'
import type { BirthDetails } from '@/types/user'

/** Houses where Mars commonly marks Manglik / Kuja dosha. */
export const MANGLIK_HOUSES = [1, 2, 4, 7, 8, 12] as const

export interface ManglikResult {
  name: string
  isManglik: boolean
  /** House Mars occupies in D1, or null if Mars is missing from the chart. */
  marsBhava: number | null
  marsRashi: string | null
  summary: string
  detail: string
  caveat: string
}

/** Mangal in bh 1, 2, 4, 7, 8 or 12 is the common reading of manglik. */
export function isManglik(chart: Chart): boolean {
  const mars = chart.grahas.find((g) => g.graha === 'Ma')
  return mars ? MANGLIK_HOUSES.includes(mars.bhava as (typeof MANGLIK_HOUSES)[number]) : false
}

export function marsPlacement(chart: Chart): { bhava: number; rashi: string } | null {
  const mars = chart.grahas.find((g) => g.graha === 'Ma')
  if (!mars) return null
  return { bhava: mars.bhava, rashi: mars.rashi }
}

/**
 * Classical Manglik / Kuja dosha reading from a D1 chart.
 * Same house set Matching already uses, so the two screens agree.
 */
export function buildManglik(
  name: string,
  details: BirthDetails,
  chart: Chart,
): ManglikResult {
  const placement = marsPlacement(chart)
  const manglik = isManglik(chart)
  const label = name.trim() || 'This chart'

  return {
    name: label,
    isManglik: manglik,
    marsBhava: placement?.bhava ?? null,
    marsRashi: placement?.rashi ?? null,
    summary: manglik
      ? `${label} shows Manglik dosha.`
      : `${label} does not show Manglik dosha.`,
    detail: placement
      ? manglik
        ? `Mars sits in house ${placement.bhava} (${placement.rashi}) — one of the houses the tradition reads as Kuja dosha (1, 2, 4, 7, 8, or 12).`
        : `Mars sits in house ${placement.bhava} (${placement.rashi}), outside the classical Manglik houses.`
      : 'Mars could not be placed on this chart.',
    caveat:
      'Manglik is one tradition’s house-based reading of Mars. Schools differ on exceptions, cancellations, and how seriously to weigh it. It is not a verdict on a person or a marriage.',
  }
}

/** Convenience for the calculator page — builds D1 then reads Manglik. */
export function calculateManglik(
  name: string,
  details: BirthDetails,
  profileId?: string,
): ManglikResult {
  const key = profileId ?? `${name}:${details.date}:${details.time}`
  return buildManglik(name, details, buildChart(key, 'D1'))
}
