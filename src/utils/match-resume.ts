import type { MatchRelationType } from '@/data/match-types'
import type { MatchResult } from '@/data/matching-mock'
import type { PersonDraft } from '@/components/matching/PersonForm'

const KEY = 'cyklos_match_resume'

export interface MatchResumeState {
  a: PersonDraft
  b: PersonDraft
  matchType: MatchRelationType | null
  result: MatchResult
}

export function saveMatchResume(state: MatchResumeState) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* private mode */
  }
}

export function consumeMatchResume(): MatchResumeState | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    sessionStorage.removeItem(KEY)
    return JSON.parse(raw) as MatchResumeState
  } catch {
    return null
  }
}
