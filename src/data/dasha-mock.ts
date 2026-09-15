import type { Chart, DashaPeriod, GrahaCode } from '@/types/astrology'
import { GRAHAS } from '@/utils/astro'
import { VIMSHOTTARI } from './nakshatras'
import { moonNakshatra } from './chart-mock'

/**
 * Vimshottari, built from the Moon's nakshatra.
 *
 * The sequence, the 120-year total and each graha's share are fixed rules, so
 * this is arithmetic rather than invention: the only mock input is the Moon's
 * position, which comes from `chart-mock`. Balance at birth is the unelapsed
 * part of the first nakshatra, which is why the opening mahadasha is short.
 */

const MS_PER_YEAR = 365.2425 * 24 * 60 * 60 * 1000

function addYears(from: number, years: number): number {
  return from + years * MS_PER_YEAR
}

function iso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

/** Rotate the fixed sequence so it opens at the given graha. */
function sequenceFrom(graha: GrahaCode) {
  const start = VIMSHOTTARI.findIndex((v) => v.graha === graha)
  const index = start === -1 ? 0 : start
  return [...VIMSHOTTARI.slice(index), ...VIMSHOTTARI.slice(0, index)]
}

function buildSubPeriods(
  parentGraha: GrahaCode,
  parentStart: number,
  parentYears: number,
  level: 'antar' | 'pratyantar',
  now: number,
  addChildren: boolean,
): DashaPeriod[] {
  let cursor = parentStart

  return sequenceFrom(parentGraha).map(({ graha, years }) => {
    // A sub-period's share of its parent mirrors its share of the 120 years.
    const span = (years / 120) * parentYears
    const start = cursor
    const end = addYears(start, span)
    cursor = end

    const period: DashaPeriod = {
      level,
      graha,
      name: GRAHAS[graha].name,
      start: iso(start),
      end: iso(end),
      current: now >= start && now < end,
    }

    if (addChildren && period.current) {
      period.children = buildSubPeriods(graha, start, span, 'pratyantar', now, false)
    }

    return period
  })
}

export interface DashaSummary {
  periods: DashaPeriod[]
  /** e.g. "Guru — Chandra — Budha". */
  path: string
  /** ISO date the running pratyantar closes. */
  endsOn: string
  /** The nakshatra the sequence was entered at. */
  enteredAt: { name: string; pada: number; lord: GrahaCode }
}

export function buildDasha(chart: Chart, birthIso: string, now = Date.now()): DashaSummary {
  const nakshatra = moonNakshatra(chart)
  const birth = Date.parse(birthIso) || Date.parse('1994-09-02')

  const sequence = sequenceFrom(nakshatra.lord)
  // Balance at birth: the pada tells us roughly how far into the nakshatra the
  // Moon had travelled, so the opening mahadasha runs only what is left of it.
  const elapsedFraction = (nakshatra.pada - 0.5) / 4
  let cursor = addYears(birth, -sequence[0].years * elapsedFraction)

  const periods: DashaPeriod[] = sequence.map(({ graha, years }) => {
    const start = cursor
    const end = addYears(start, years)
    cursor = end

    const period: DashaPeriod = {
      level: 'maha',
      graha,
      name: GRAHAS[graha].name,
      start: iso(start),
      end: iso(end),
      current: now >= start && now < end,
    }

    if (period.current) {
      period.children = buildSubPeriods(graha, start, years, 'antar', now, true)
    }

    return period
  })

  const maha = periods.find((p) => p.current)
  const antar = maha?.children?.find((p) => p.current)
  const pratyantar = antar?.children?.find((p) => p.current)

  const path = [maha?.name, antar?.name, pratyantar?.name].filter(Boolean).join(' — ')

  return {
    periods,
    path: path || 'Outside the calculated range',
    endsOn: pratyantar?.end ?? antar?.end ?? maha?.end ?? iso(cursor),
    enteredAt: nakshatra,
  }
}
