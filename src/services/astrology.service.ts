import { buildChart } from '@/data/chart-mock'
import { buildCompatibility, type CompatibilityResult } from '@/data/compatibility-mock'
import { buildDasha } from '@/data/dasha-mock'
import { buildHoroscope, type Horoscope, type HoroscopeKind } from '@/data/horoscope-mock'
import { buildMatch, type MatchResult } from '@/data/matching-mock'
import { buildManglik, type ManglikResult } from '@/data/manglik-mock'
import type { BirthDetails } from '@/types/user'
import { mockRequest } from './client'

/**
 * The astrology feature reads: horoscopes, matching and compatibility.
 *
 * Each one builds the charts it needs from the same mock ephemeris the chart
 * dashboard uses, so a horoscope's bindus and a match's moon sign agree with
 * what My Chart shows for the same person.
 */

/** GET /horoscope/:kind */
export function getHoroscope(
  kind: HoroscopeKind,
  profileId = 'self',
  birthDate = '1994-09-02',
  signal?: AbortSignal,
): Promise<Horoscope> {
  return mockRequest(
    () => {
      const chart = buildChart(profileId, 'D1')
      return buildHoroscope(kind, chart, buildDasha(chart, birthDate))
    },
    { delay: 520, signal },
  )
}

/** A person entered into the matching form. */
export interface MatchInput {
  name: string
  details: BirthDetails
  /** Set when the person came from a saved profile rather than the form. */
  profileId?: string
}

/** A chart id that is stable for one set of birth details. */
function chartKeyFor(input: MatchInput): string {
  return input.profileId ?? `${input.name}:${input.details.date}:${input.details.time}`
}

/** POST /matching */
export function getMatch(
  a: MatchInput,
  b: MatchInput,
  signal?: AbortSignal,
): Promise<MatchResult> {
  return mockRequest(
    () =>
      buildMatch(
        a.name,
        a.details,
        buildChart(chartKeyFor(a), 'D1'),
        b.name,
        b.details,
        buildChart(chartKeyFor(b), 'D1'),
      ),
    { delay: 1100, signal },
  )
}

/** POST /compatibility */
export function getCompatibility(
  a: MatchInput,
  b: MatchInput,
  signal?: AbortSignal,
): Promise<CompatibilityResult> {
  return mockRequest(
    () =>
      buildCompatibility(
        a.name,
        buildChart(chartKeyFor(a), 'D1'),
        b.name,
        buildChart(chartKeyFor(b), 'D1'),
      ),
    { delay: 800, signal },
  )
}

/** POST /manglik — Kuja dosha from a single birth chart. */
export function getManglik(input: MatchInput, signal?: AbortSignal): Promise<ManglikResult> {
  return mockRequest(
    () =>
      buildManglik(
        input.name,
        input.details,
        buildChart(chartKeyFor(input), 'D1'),
      ),
    { delay: 700, signal },
  )
}
