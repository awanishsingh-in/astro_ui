import type { Chart, DashaLevel, DashaPeriod, GrahaCode } from '@/types/astrology'
import { GRAHAS } from '@/utils/astro'
import { VIMSHOTTARI } from './nakshatras'
import { moonNakshatra } from './chart-mock'

/**
 * Vimshottari, built from the Moon's nakshatra.
 *
 * Five nested levels on the running branch: maha → antar → pratyantar →
 * sookshma → prana. Deeper levels only expand for the current path so the
 * tree stays small enough for the dashboard columns.
 */

const MS_PER_YEAR = 365.2425 * 24 * 60 * 60 * 1000

const NEXT_LEVEL: Record<DashaLevel, DashaLevel | null> = {
  maha: 'antar',
  antar: 'pratyantar',
  pratyantar: 'sookshma',
  sookshma: 'prana',
  prana: null,
}

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
  level: DashaLevel,
  now: number,
): DashaPeriod[] {
  let cursor = parentStart
  const childLevel = NEXT_LEVEL[level]

  return sequenceFrom(parentGraha).map(({ graha, years }) => {
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

    if (period.current && childLevel) {
      period.children = buildSubPeriods(graha, start, span, childLevel, now)
    }

    return period
  })
}

export interface DashaSummary {
  periods: DashaPeriod[]
  /** e.g. "Guru — Chandra — Budha". */
  path: string
  /** ISO date the running finest period closes. */
  endsOn: string
  /** ISO date the running antardasha (or finest available) started. */
  startsOn: string
  /** Progress 0–1 through the antardasha when available. */
  progress: number
  /** The nakshatra the sequence was entered at. */
  enteredAt: { name: string; pada: number; lord: GrahaCode }
}

function findCurrentPath(periods: DashaPeriod[]): DashaPeriod[] {
  const path: DashaPeriod[] = []
  let list: DashaPeriod[] | undefined = periods
  while (list) {
    const current = list.find((p) => p.current)
    if (!current) break
    path.push(current)
    list = current.children
  }
  return path
}

export function buildDasha(chart: Chart, birthIso: string, now = Date.now()): DashaSummary {
  const nakshatra = moonNakshatra(chart)
  const birth = Date.parse(birthIso) || Date.parse('1994-09-02')

  const sequence = sequenceFrom(nakshatra.lord)
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
      period.children = buildSubPeriods(graha, start, years, 'antar', now)
    }

    return period
  })

  const pathPeriods = findCurrentPath(periods)
  const antar = pathPeriods.find((p) => p.level === 'antar')
  const finest = pathPeriods[pathPeriods.length - 1]
  const antarStart = antar ? Date.parse(antar.start) : 0
  const antarEnd = antar ? Date.parse(antar.end) : 0
  const progress =
    antar && antarEnd > antarStart
      ? Math.min(1, Math.max(0, (now - antarStart) / (antarEnd - antarStart)))
      : 0

  return {
    periods,
    path: pathPeriods.map((p) => p.name).join(' — ') || 'Outside the calculated range',
    endsOn: finest?.end ?? iso(cursor),
    startsOn: antar?.start ?? finest?.start ?? iso(birth),
    progress,
    enteredAt: nakshatra,
  }
}

/** Ensure children exist for a selected (possibly non-current) period when browsing. */
export function expandDashaChildren(
  parent: DashaPeriod,
  parentYearsHint?: number,
): DashaPeriod[] {
  if (parent.children?.length) return parent.children
  const childLevel = NEXT_LEVEL[parent.level]
  if (!childLevel) return []

  const start = Date.parse(parent.start)
  const end = Date.parse(parent.end)
  const years =
    parentYearsHint ??
    Math.max(0.001, (end - start) / MS_PER_YEAR)

  return buildSubPeriods(parent.graha, start, years, childLevel, Date.now())
}
