import { createContext, useContext } from 'react'
import type { ChartProfile, ProfileRelation } from '@/data/profiles'
import type { BirthDetails } from '@/types/user'

export interface NewProfile {
  name: string
  relation: ProfileRelation
  note?: string
  birthDetails: BirthDetails
}

export interface ProfilesApi {
  /** The account holder's own chart first, then everything saved. */
  profiles: ChartProfile[]
  /** Saved charts only — what the account screen manages. */
  saved: ChartProfile[]
  /** The chart currently being read, shared across every chart screen. */
  selectedId: string
  selected: ChartProfile
  select: (id: string) => void

  add: (profile: NewProfile) => ChartProfile
  update: (id: string, patch: Partial<NewProfile>) => void
  remove: (id: string) => void

  /** How many additional (non-self) profiles are saved. */
  additionalCount: number
  /** Free-tier cap for additional profiles. */
  freeAdditionalLimit: number
  /** Whether another additional profile can be created right now. */
  canAddAdditional: boolean
}

export const ProfilesContext = createContext<ProfilesApi | null>(null)

export function useProfiles(): ProfilesApi {
  const api = useContext(ProfilesContext)
  if (!api) throw new Error('useProfiles must be used inside <ProfilesProvider>.')
  return api
}
