import type { BirthDetails } from '@/types/user'

/**
 * Saved charts.
 *
 * The product feature reference marks multiple profiles as in scope — "family,
 * corporates, friends, relatives" — so the chart dashboard reads for more than
 * the account holder. `self` is always first and cannot be removed.
 */
export type ProfileRelation = 'self' | 'family' | 'friend' | 'other'

export interface ChartProfile {
  id: string
  name: string
  relation: ProfileRelation
  /** e.g. "Mother", "Brother", "Colleague" — shown under the name. */
  note?: string
  birthDetails: BirthDetails
}

export const RELATION_LABEL: Record<ProfileRelation, string> = {
  self: 'You',
  family: 'Family',
  friend: 'Friends',
  other: 'Other',
}

/** The order the picker groups them in. */
export const RELATION_ORDER: ProfileRelation[] = ['self', 'family', 'friend', 'other']

const kolkata = (label: string, latitude: number, longitude: number) => ({
  label,
  latitude,
  longitude,
  timeZone: 'Asia/Kolkata',
})

export const savedProfiles: ChartProfile[] = [
  {
    id: 'pr_mother',
    name: 'Sunita Satish',
    relation: 'family',
    note: 'Mother',
    birthDetails: {
      fullName: 'Sunita Satish',
      date: '1968-04-17',
      time: '21:05',
      place: kolkata('Raipur, Chhattisgarh', 21.2514, 81.6296),
    },
  },
  {
    id: 'pr_brother',
    name: 'Aditya Satish',
    relation: 'family',
    note: 'Brother',
    birthDetails: {
      fullName: 'Aditya Satish',
      date: '1997-12-30',
      time: '04:50',
      place: kolkata('Bilaspur, Chhattisgarh', 22.0797, 82.1409),
    },
  },
  {
    id: 'pr_friend',
    name: 'Nikhil Verma',
    relation: 'friend',
    note: 'Asked me to check his D-10',
    birthDetails: {
      fullName: 'Nikhil Verma',
      date: '1991-07-09',
      time: '13:40',
      timeUnknown: true,
      place: kolkata('Lucknow, Uttar Pradesh', 26.8467, 80.9462),
    },
  },
  {
    id: 'pr_colleague',
    name: 'Rhea Menon',
    relation: 'other',
    note: 'Business partner',
    birthDetails: {
      fullName: 'Rhea Menon',
      date: '1986-02-23',
      time: '07:12',
      place: kolkata('Kochi, Kerala', 9.9312, 76.2673),
    },
  },
]

/** The account holder's own profile, built from their signup details. */
export function selfProfile(fullName: string, birthDetails: BirthDetails): ChartProfile {
  return { id: 'self', name: fullName, relation: 'self', note: 'Your chart', birthDetails }
}

/**
 * The key a chart is generated from.
 *
 * It includes the birth details, not just the profile id — so editing a date
 * or a time genuinely produces a different chart, which is what the account
 * screen promises when it says "changing these recalculates your chart".
 * Every screen that renders a chart must seed from this, or two screens will
 * quietly show two different charts for the same person.
 */
export function chartSeedFor(profile: { id: string; birthDetails: BirthDetails }): string {
  const { date, time, timeUnknown, place } = profile.birthDetails
  return [
    profile.id,
    date,
    timeUnknown ? 'unknown' : time,
    place.latitude.toFixed(2),
    place.longitude.toFixed(2),
  ].join(':')
}
