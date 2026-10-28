import type { NavigateFunction } from 'react-router-dom'
import { paths } from '@/routes/paths'

/** Valid My Chart tab ids used in `?section=`. */
export type ChartReturnSection =
  | 'chart'
  | 'yoga'
  | 'dasha'
  | 'planets'
  | 'vargas'
  | 'transits'
  | 'strength'

export function chartSectionReturn(section: ChartReturnSection = 'chart'): string {
  return `${paths.chart}?section=${section}`
}

export type AskFromChartOptions = {
  q: string
  bhava?: number | string
  /** Tab to restore when leaving Ask (Back / Not now). */
  returnSection?: ChartReturnSection
  /** Extra search params (optional). */
  extra?: Record<string, string>
}

/**
 * My Chart → Ask: open the question with paywall, and seed history so Back
 * returns to the same chart tab the user left (e.g. Strength).
 */
export function navigateAskFromChart(
  navigate: NavigateFunction,
  { q, bhava, returnSection = 'chart', extra }: AskFromChartOptions,
) {
  const returnUrl = chartSectionReturn(returnSection)

  // Swap the current history entry to the return tab before pushing Ask, so
  // browser Back lands on that tab.
  if (typeof window !== 'undefined') {
    window.history.replaceState(window.history.state, '', returnUrl)
  }

  const params = new URLSearchParams({
    q,
    from: 'chart',
    return: returnSection,
    ...extra,
  })
  if (bhava != null) params.set('bhava', String(bhava))

  navigate(`${paths.ask}?${params.toString()}`)
}

export function isAskFromChart(search: URLSearchParams): boolean {
  return search.get('from') === 'chart'
}

const SECTIONS: ChartReturnSection[] = [
  'chart',
  'yoga',
  'dasha',
  'planets',
  'vargas',
  'transits',
  'strength',
]

export function chartReturnFromSearch(search: URLSearchParams): string {
  const raw = search.get('return')
  const section = SECTIONS.includes(raw as ChartReturnSection)
    ? (raw as ChartReturnSection)
    : 'chart'
  return chartSectionReturn(section)
}
