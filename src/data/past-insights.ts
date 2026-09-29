import type { GrahaCode } from '@/types/astrology'

/**
 * Know Your Past — six areas; the user may choose one to three.
 * Mock chart readings only; no real ephemeris engine.
 */

export type PastInsightCategory =
  | 'love'
  | 'career'
  | 'relationships'
  | 'family'
  | 'money'
  | 'health'

export interface PastInsight {
  id: PastInsightCategory
  category: string
  blurb: string
  period: string
  verdict: string
  points: string[]
  planets: GrahaCode[]
  bhava: number
  source: string
}

/** At least one area is enough to continue. */
export const MIN_PAST_SELECTIONS = 1
/** Free tier caps how many areas can be locked in at once. */
export const MAX_PAST_SELECTIONS = 3

export const PAST_INSIGHTS: PastInsight[] = [
  {
    id: 'love',
    category: 'Love',
    blurb:
      'How you fell for people, what made bonds stick, and the emotional patterns your chart held in romance.',
    period: '2016 – 2018',
    verdict: 'A chapter of opening and learning how you attach.',
    points: [
      'Emotional bonds formed quickly, then asked for depth',
      'Attraction tied to shared ideals more than routine',
      'A need to feel seen before committing fully',
    ],
    planets: ['Mo', 'Ve'],
    bhava: 5,
    source: 'Bhava 5 · Shukra antar',
  },
  {
    id: 'career',
    category: 'Career',
    blurb:
      'Job shifts, ambition, and turning points — the work chapters where your chart pushed growth or change.',
    period: '2019 – 2021',
    verdict: 'A period of change and greater responsibility.',
    points: [
      'A shift in professional priorities',
      'Greater responsibility than the role first suggested',
      'Learning through experience rather than titles',
    ],
    planets: ['Sa', 'Me'],
    bhava: 10,
    source: 'Bhava 10 · Shani influence',
  },
  {
    id: 'relationships',
    category: 'Relationships',
    blurb:
      'Partnerships, close ties, and how you showed up for others when connection was tested.',
    period: '2014 – 2017',
    verdict: 'Partnerships asked for honesty before comfort.',
    points: [
      'Close bonds tested by distance or timing',
      'A preference for few deep ties over many light ones',
      'Clarity arriving after a period of ambiguity',
    ],
    planets: ['Ve', 'Mo'],
    bhava: 7,
    source: 'Bhava 7 · Chandra dasha',
  },
  {
    id: 'family',
    category: 'Family',
    blurb:
      'Home, roots, and family roles — the phases that shaped belonging, duty, and support.',
    period: '2012 – 2015',
    verdict: 'Family roles shifted; support and duty traded places.',
    points: [
      'A change in who carried the emotional weight',
      'Moments of care that redefined belonging',
      'Roots strengthening after a period of strain',
    ],
    planets: ['Mo', 'Ju'],
    bhava: 4,
    source: 'Bhava 4 · Guru period',
  },
  {
    id: 'money',
    category: 'Money',
    blurb:
      'Income, spending, and pressure around resources — when money grew, tightened, or taught discipline.',
    period: '2020 – 2022',
    verdict: 'Resources expanded, then asked for discipline.',
    points: [
      'Income opportunities tied to skill, not luck alone',
      'Pressure that taught clearer priorities',
      'Growth arriving after restructuring habits',
    ],
    planets: ['Ju', 'Me'],
    bhava: 2,
    source: 'Bhava 2 · Budha transit',
  },
  {
    id: 'health',
    category: 'Health & Wellbeing',
    blurb:
      'Energy, rest, and balance — past rhythms in body and mind that your chart still echoes.',
    period: '2018 – 2020',
    verdict: 'Energy asked for rhythm more than intensity.',
    points: [
      'Cycles of drive followed by necessary rest',
      'Balance returning when routine was honoured',
      'Vitality linked to mental load as much as body',
    ],
    planets: ['Su', 'Sa'],
    bhava: 1,
    source: 'Bhava 1 · Surya–Shani',
  },
]

export function insightsByIds(ids: PastInsightCategory[]): PastInsight[] {
  return ids
    .map((id) => PAST_INSIGHTS.find((item) => item.id === id))
    .filter((item): item is PastInsight => Boolean(item))
}
