import { buildAnswer } from '@/data/answer-mock'
import { buildChart } from '@/data/chart-mock'
import { buildDasha } from '@/data/dasha-mock'
import { themeFor, type QuestionTheme } from '@/data/question-themes'
import type { Chart } from '@/types/astrology'
import type { Reading } from '@/types/readings'
import { mockRequest } from './client'

/**
 * The ask flow.
 *
 * Split into two calls on purpose. `prepareAsk` resolves immediately with what
 * the calculating screen needs to show — the chart, the bhava, the grahas, the
 * period — so the wait is spent looking at the real chart rather than a
 * placeholder. `askQuestion` then returns the answer itself.
 *
 * Against a real engine that split is the same: route the question, then read.
 */

export interface AskContext {
  theme: QuestionTheme
  chart: Chart
  bhava: number
  grahas: Reading['source']['grahas']
  dashaPath: string
}

/** POST /ask/prepare — routes the question and returns what it will be read from. */
export function prepareAsk(
  question: string,
  profileId = 'self',
  birthDate = '1994-09-02',
  signal?: AbortSignal,
): Promise<AskContext> {
  return mockRequest<AskContext>(
    () => {
      const chart = buildChart(profileId, 'D1')
      const dasha = buildDasha(chart, birthDate)
      const theme = themeFor(question)
      const bhava = chart.bhavas.find((b) => b.bhava === theme.bhava)!
      const occupants = chart.grahas.filter((g) => g.bhava === theme.bhava).map((g) => g.graha)

      return {
        theme,
        chart,
        bhava: theme.bhava,
        grahas: Array.from(new Set([bhava.lordCode, ...occupants])).slice(0, 3),
        dashaPath: dasha.path,
      }
    },
    { delay: 260, signal },
  )
}

/** POST /ask — the reading itself. */
export function askQuestion(
  question: string,
  profileId = 'self',
  birthDate = '1994-09-02',
  signal?: AbortSignal,
): Promise<Reading> {
  return mockRequest<Reading>(
    () => {
      const chart = buildChart(profileId, 'D1')
      return buildAnswer(question, chart, buildDasha(chart, birthDate))
    },
    // Shorter than the calculating animation, so the answer is always ready
    // when the last stage finishes rather than the other way round.
    { delay: 900, signal },
  )
}
