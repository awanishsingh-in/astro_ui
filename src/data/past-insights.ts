import type { GrahaCode } from '@/types/astrology'

/**
 * Know Your Past — six areas; the user may choose up to three.
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

export const MAX_PAST_SELECTIONS = 3

export const PAST_INSIGHTS: PastInsight[] = [
  {
    id: 'love',
    category: 'Love',
    blurb: 'Patterns in love and emotional connection from your past.',
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
    blurb: 'Work phases, changes and turning points your chart carried.',
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
    blurb: 'Patterns in close relationships and partnerships.',
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
    blurb: 'Family dynamics and meaningful phases from your past.',
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
    blurb: 'Times of financial growth, pressure and change.',
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
    blurb: 'Past patterns around energy, balance and wellbeing.',
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
