import { todayPanchang } from '@/data/chart'
import { buildChart } from '@/data/chart-mock'
import { buildDasha } from '@/data/dasha-mock'
import { readings, readingsByBhava, suggestedQuestions } from '@/data/readings'
import type { BhavaNumber, Chart, GrahaCode, Panchang } from '@/types/astrology'
import type { Reading, SuggestedQuestion } from '@/types/readings'
import {
  BHAVA_SIGNIFIES,
  GRAHAS,
  GRAHA_ORDER,
  summariseChart,
  type ChartSummary,
} from '@/utils/astro'
import { mockRequest } from './client'

/** One bhava, described the way an insight line needs it. */
export interface BhavaHighlight {
  bhava: BhavaNumber
  signifies: string
  /** Bindus for the strength lines; reading count for the "most asked" line. */
  value: number
}

/**
 * The chart's own commentary — what the right-hand panel shows on desktop and
 * what the chart card compresses into one line on mobile.
 */
export interface ChartInsight {
  dashaPath: string
  /** The running mahadasha's lord — the glyph the period is drawn under. */
  dashaGraha: GrahaCode
  /** ISO dates the running mahadasha opens and closes. */
  dashaFrom: string
  dashaTo: string
  /** ISO date the running pratyantar closes. */
  dashaEndsOn: string
  strongest: BhavaHighlight
  weakest: BhavaHighlight
  /** The bhava the user has asked about most. */
  mostAsked: BhavaHighlight
  /** One plain-language observation, drawn from the chart's notes. */
  note: string
  /**
   * The grahas that note is about. The notes are generated from
   * `GRAHAS[code].name`, so reading those names back out recovers exactly the
   * codes that produced the sentence rather than guessing at it.
   */
  noteGrahas: GrahaCode[]
}

/**
 * Everything Home renders, in one response.
 *
 * Home is a dashboard, not five independent widgets: fetching it as one call
 * means one loading state, one error state, and no staggered reflow as pieces
 * land at different times. `GET /home` is the endpoint this becomes.
 */
export interface HomeFeed {
  panchang: Panchang
  chart: Chart
  summary: ChartSummary
  insight: ChartInsight
  suggested: SuggestedQuestion[]
  /** Most recent first, already trimmed to what Home shows. */
  recent: Reading[]
  /** Total across all lenses, for the "Explore everything" count. */
  totalReadings: number
}

/**
 * GET /home
 *
 * Takes the same chart seed the dashboard uses, so Home's wheel and My Chart's
 * wheel are the same chart — they were not, when Home read a fixed example.
 */
export function getHomeFeed(
  seed = 'self',
  birthDate = '1994-09-02',
  signal?: AbortSignal,
): Promise<HomeFeed> {
  return mockRequest<HomeFeed>(
    () => {
      const rashiChart = buildChart(seed, 'D1')
      const dasha = buildDasha(rashiChart, birthDate)
      const { entries, mean } = rashiChart.ashtakavarga

      const strongestEntry = entries.reduce((best, e) => (e.bindus > best.bindus ? e : best))
      const weakestEntry = entries.reduce((worst, e) => (e.bindus < worst.bindus ? e : worst))
      const mostAskedGroup = readingsByBhava.reduce((best, g) =>
        g.readings.length > best.readings.length ? g : best,
      )

      const note = rashiChart.notes[0] ?? ''
      const noteGrahas = GRAHA_ORDER.filter((code) => note.includes(GRAHAS[code].name))
      const maha = dasha.periods.find((p) => p.current) ?? dasha.periods[0]

      void mean

      return {
        panchang: todayPanchang,
        chart: rashiChart,
        summary: summariseChart(rashiChart),
        insight: {
          dashaPath: dasha.path,
          dashaGraha: maha.graha,
          dashaFrom: maha.start,
          dashaTo: maha.end,
          dashaEndsOn: dasha.endsOn,
          strongest: {
            bhava: strongestEntry.bhava,
            signifies: BHAVA_SIGNIFIES[strongestEntry.bhava],
            value: strongestEntry.bindus,
          },
          weakest: {
            bhava: weakestEntry.bhava,
            signifies: BHAVA_SIGNIFIES[weakestEntry.bhava],
            value: weakestEntry.bindus,
          },
          mostAsked: {
            bhava: mostAskedGroup.bhava,
            signifies: mostAskedGroup.signifies,
            value: mostAskedGroup.readings.length,
          },
          note,
          noteGrahas,
        },
        suggested: suggestedQuestions,
        recent: [...readings]
          .sort((a, b) => Date.parse(b.askedAt) - Date.parse(a.askedAt))
          .slice(0, 4),
        totalReadings: readings.length,
      }
    },
    { delay: 620, signal },
  )
}
