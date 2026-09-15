import { buildChart } from '@/data/chart-mock'
import { buildDasha } from '@/data/dasha-mock'
import {
  readings,
  readingsByBhava,
  readingsById,
  readingsByPeriod,
  suggestedQuestions,
  unaskedBhavas,
} from '@/data/readings'
import type { Chart } from '@/types/astrology'
import type {
  BhavaReadingGroup,
  PeriodReadingGroup,
  Reading,
  SuggestedQuestion,
} from '@/types/readings'
import { ApiError, mockRequest } from './client'

/** GET /readings */
export function listReadings(signal?: AbortSignal): Promise<Reading[]> {
  return mockRequest(readings, { signal })
}

/** GET /readings/:id */
export function getReading(id: string, signal?: AbortSignal): Promise<Reading> {
  return mockRequest(() => {
    const found = readingsById.get(id)
    if (!found) throw new ApiError('That reading no longer exists.', 'NOT_FOUND', false)
    return found
  }, { signal })
}

/** GET /readings?group=bhava */
export function listReadingsByBhava(signal?: AbortSignal): Promise<BhavaReadingGroup[]> {
  return mockRequest(readingsByBhava, { signal })
}

/** GET /readings?group=period */
export function listReadingsByPeriod(signal?: AbortSignal): Promise<PeriodReadingGroup[]> {
  return mockRequest(readingsByPeriod, { signal })
}

/** GET /questions/suggested */
export function getSuggestedQuestions(signal?: AbortSignal): Promise<SuggestedQuestion[]> {
  return mockRequest(suggestedQuestions, { delay: 150, signal })
}

/**
 * GET /readings/index
 *
 * The three lenses in one response. Readings is a single screen with three
 * views of the same set, so fetching them together means one loading state and
 * no reflow when the lens is switched.
 */
export interface ReadingsIndex {
  all: Reading[]
  byBhava: BhavaReadingGroup[]
  byPeriod: PeriodReadingGroup[]
  /** Bhavas with no readings — surfaced as an invitation. */
  unaskedBhavas: number[]
  runningPath: string
  runningEndsOn: string
  /** The D-1 chart, so the bhava lens can draw the diamond as its index. */
  chart: Chart
}

export function getReadingsIndex(
  seed = 'self',
  birthDate = '1994-09-02',
  signal?: AbortSignal,
): Promise<ReadingsIndex> {
  return mockRequest<ReadingsIndex>(() => {
    const chart = buildChart(seed, 'D1')
    const dasha = buildDasha(chart, birthDate)
    return {
      all: [...readings].sort((a, b) => Date.parse(b.askedAt) - Date.parse(a.askedAt)),
      byBhava: readingsByBhava,
      byPeriod: readingsByPeriod,
      unaskedBhavas,
      runningPath: dasha.path,
      runningEndsOn: dasha.endsOn,
      chart,
    }
  }, { delay: 560, signal })
}
