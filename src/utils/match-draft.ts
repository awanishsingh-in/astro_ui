import type { ChartProfile } from '@/data/profiles'
import type { PersonDraft } from '@/components/matching/PersonForm'
import { normalizeGender } from '@/types/user'

const DRAFT_KEY = 'cyklos_match_draft'
const PICK_KEY = 'cyklos_match_pick'

export type MatchPersonSlot = 'a' | 'b'

export interface MatchDraftState {
  a: PersonDraft
  b: PersonDraft
  focus: MatchPersonSlot
  /** Where to return after picking a saved profile. Defaults to Matching. */
  returnTo?: string
}

export interface MatchPickResult {
  slot: MatchPersonSlot
  profileId: string
}

export function personFromProfile(profile: ChartProfile): PersonDraft {
  return {
    name: profile.name,
    gender: normalizeGender(profile.birthDetails.gender) ?? '',
    date: profile.birthDetails.date,
    time: profile.birthDetails.timeUnknown ? '12:00' : profile.birthDetails.time,
    place: profile.birthDetails.place,
    profileId: profile.id,
  }
}

export function saveMatchDraft(draft: MatchDraftState) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    /* private mode */
  }
}

export function readMatchDraft(): MatchDraftState | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as MatchDraftState
  } catch {
    return null
  }
}

export function clearMatchDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    /* private mode */
  }
}

export function saveMatchPick(pick: MatchPickResult) {
  try {
    sessionStorage.setItem(PICK_KEY, JSON.stringify(pick))
  } catch {
    /* private mode */
  }
}

export function consumeMatchPick(): MatchPickResult | null {
  try {
    const raw = sessionStorage.getItem(PICK_KEY)
    if (!raw) return null
    sessionStorage.removeItem(PICK_KEY)
    return JSON.parse(raw) as MatchPickResult
  } catch {
    return null
  }
}
