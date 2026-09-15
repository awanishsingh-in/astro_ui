import {
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  Clock,
  Coins,
  Compass,
  Crown,
  Eye,
  FileText,
  Flame,
  Gift,
  Heart,
  HeartHandshake,
  HeartPulse,
  Languages,
  LayoutGrid,
  Newspaper,
  Orbit,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  SunMedium,
  TicketPercent,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { paths } from '@/routes/paths'

/**
 * The product catalogue, transcribed from the feature reference.
 *
 * `sourceDecision` is the reference's own wording, kept verbatim so this file
 * can be checked against the spreadsheet without interpretation. Nothing
 * marked "No" or "Need to discuss" appears as a shippable feature — the
 * excluded list at the bottom records what was left out and why, so a future
 * reader does not re-add it by accident.
 */

export type FeatureStatus =
  /** Built and reachable today. */
  | 'live'
  /** Confirmed in the reference, screen not built yet. */
  | 'planned'
  /** Recorded without a decision. Shown disabled, never linked. */
  | 'undecided'

export interface Feature {
  slug: string
  title: string
  description: string
  icon: LucideIcon
  /**
   * An astronomical glyph, used instead of the icon where one carries the
   * meaning better — a graha, a rashi, a chart mark. Deliberately not set on
   * every feature: Notifications is a bell and an offer is a ticket, and
   * dressing those as astrology would be costume rather than language.
   */
  glyph?: string
  status: FeatureStatus
  /** Where it goes. Omitted for `undecided`. */
  to?: string
  /** The reference's verbatim decision, for traceability. */
  sourceDecision: string
  /** What the screen will hold, shown on its placeholder. */
  contents?: string[]
}

export interface FeatureGroup {
  id: string
  title: string
  description: string
  features: Feature[]
}

/** Deep-links into the one chart dashboard rather than separate screens. */
const chartSection = (section: string) => `${paths.chart}?section=${section}`

export const featureGroups: FeatureGroup[] = [
  {
    id: 'chart',
    title: 'My Chart',
    description: 'One dashboard. Every section below is a view of the same chart.',
    features: [
      {
        slug: 'birth-chart',
        title: 'Birth Chart',
        description: 'Your rashi chart and all sixteen divisionals.',
        icon: Compass,
        status: 'live',
        to: paths.chart,
        sourceDecision: 'Janam kundli / birth chart generation',
      },
      {
        slug: 'grahas',
        title: 'Grahas',
        description: 'Sign, degree, nakshatra, pada, dignity and strength.',
        icon: Orbit,
        status: 'live',
        to: chartSection('grahas'),
        sourceDecision: 'Planetary positions table',
      },
      {
        slug: 'bhavas',
        title: 'Bhavas',
        description: 'Twelve cusps, their lords, and where each lord sits.',
        icon: LayoutGrid,
        status: 'live',
        to: chartSection('bhavas'),
        sourceDecision: 'Lagna / ascendant calculator',
      },
      {
        slug: 'drishti',
        title: 'Drishti',
        description: 'Which graha aspects which bhava, with the counting shown.',
        icon: Eye,
        status: 'live',
        to: chartSection('drishti'),
        sourceDecision: 'Planetary positions table',
      },
      {
        slug: 'dasha',
        title: 'Dasha',
        description: 'Vimshottari mahadasha, antardasha and pratyantar.',
        icon: CalendarRange,
        status: 'live',
        to: chartSection('dasha'),
        sourceDecision: 'Dasha table (Vimshottari)',
      },
      {
        slug: 'ashtakavarga',
        title: 'Ashtakavarga',
        description: 'Bindus per sign, read against the mean.',
        icon: BarChart3,
        status: 'live',
        to: chartSection('sav'),
        sourceDecision: 'Divisional charts (D9 and beyond)',
      },
      {
        slug: 'saved-charts',
        title: 'Saved charts',
        description: 'Family, friends and colleagues, each with their own chart.',
        icon: Users,
        status: 'live',
        to: paths.chart,
        sourceDecision:
          'Multiple saved profiles / family charts — “Familiy, Corporates, Friends, relatives”',
      },
      {
        slug: 'birth-time-rectification',
        title: 'Birth time rectification',
        description: 'Narrow an uncertain birth time from events you already know.',
        icon: Clock,
        status: 'planned',
        sourceDecision: 'Birth time rectification — “Yes”',
        contents: [
          'Enter events with known dates — marriage, a move, a job change',
          'The app proposes the birth times that fit them',
          'Recalculates the chart against the chosen time',
        ],
      },
      {
        slug: 'celebrity-charts',
        title: 'Celebrity charts',
        description: 'Read a public chart the same way you read your own.',
        icon: Star,
        status: 'planned',
        sourceDecision: 'Celebrity kundli database — “Only with us”',
        contents: [
          'A curated set of public charts',
          'The same six sections as your own chart',
          'Compare a celebrity chart against yours',
        ],
      },
    ],
  },

  {
    id: 'horoscopes',
    title: 'Horoscopes',
    description:
      'Written against your own chart wherever the reference says personalised — never a generic sign column.',
    features: [
      horoscope(
        'daily',
        'Daily Horoscope',
        'What today reads like, from your chart.',
        Sun,
        'Daily horoscope',
      ),
      horoscope(
        'tomorrow',
        'Tomorrow',
        'The next day, far enough ahead to plan around.',
        SunMedium,
        'Tomorrow’s horoscope',
      ),
      horoscope(
        'weekly',
        'Weekly',
        'The shape of the week, with its stronger days marked.',
        CalendarDays,
        'Weekly horoscope',
      ),
      horoscope(
        'monthly',
        'Monthly',
        'The month as one arc rather than thirty verdicts.',
        Calendar,
        'Monthly horoscope',
      ),
      horoscope(
        'yearly',
        'Yearly',
        'The year by sign, with the transits that shape it.',
        CalendarCheck,
        'Yearly horoscope by sign (generic)',
      ),
      horoscope(
        'yearly-personal',
        'Personalised yearly report',
        'A full year read from your chart, not your sign.',
        FileText,
        'Personalised yearly horoscope report',
      ),
      horoscope(
        'love',
        'Love',
        'Bh 7 and Shukra, read for the period you are in.',
        Heart,
        'Love horoscope',
      ),
      horoscope(
        'career',
        'Career',
        'Bh 10, its lord, and who aspects it.',
        Briefcase,
        'Career horoscope',
      ),
      horoscope(
        'health',
        'Health',
        'Bh 6 and bh 1, with what the chart cannot see stated plainly.',
        HeartPulse,
        'Health horoscope',
      ),
      horoscope(
        'finance',
        'Finance',
        'Bh 2 and bh 11 against their own means.',
        Coins,
        'Finance / money horoscope',
      ),
      horoscope(
        'lucky',
        'Lucky number, colour & hours',
        'Drawn from your chart’s own lords, not a fixed table.',
        Sparkles,
        'Lucky number / colour / auspicious hours',
      ),
      horoscope(
        'daily-personal',
        'Personalised daily prediction',
        'Today, read from your kundli rather than your sign.',
        UserCheck,
        'Personalised daily prediction from own kundli',
      ),
      horoscope(
        'rashifal',
        'Rashifal — Hindi & regional',
        'The same readings in Hindi and regional languages.',
        Languages,
        'Rashifal in Hindi and regional languages',
      ),
    ],
  },

  {
    id: 'matching',
    title: 'Matching',
    description: 'Two charts read against each other, in the house style.',
    features: [
      {
        slug: 'kundli-matching',
        title: 'Kundli Matching',
        description: 'Guna Milan across thirty-six points, with each koota shown.',
        icon: HeartHandshake,
        status: 'live',
        to: paths.matching,
        sourceDecision: 'Kundli matching / guna milan (36 points) — “As per our style”',
        contents: [
          'Thirty-six points across the eight kootas, each one explained',
          'Manglik position stated for both charts',
          'What the score does and does not decide',
        ],
      },
      {
        slug: 'love-compatibility',
        title: 'Love compatibility',
        description: 'A quick read between two charts — temperament, pace, mind and distance.',
        icon: Heart,
        status: 'live',
        to: paths.compatibility,
        /*
          The reference marks "Zodiac love compatibility" as No. It is built
          here at the product owner's explicit instruction, which overrides the
          sheet — recorded rather than quietly reversed so the exception stays
          visible.
        */
        sourceDecision:
          'Zodiac love compatibility — “No” in the reference; built on explicit instruction, overriding it',
        contents: [
          'Two saved charts read against each other',
          'Element, mode, sign lords and the distance between moon signs',
          'Points at Guna Milan for the full eight kootas',
        ],
      },
      {
        slug: 'compatibility',
        title: 'Compatibility between saved charts',
        description: 'Compare any two charts you have saved.',
        icon: Users,
        status: 'live',
        to: paths.compatibility,
        // The reference bundles "Love calculator / FLAMES" into row 13,
        // which is Multiple saved profiles — so it is a comparison between
        // saved charts rather than a standalone toy.
        sourceDecision:
          'Love calculator / FLAMES — “include with 13” (row 13 = Multiple saved profiles / family charts)',
        contents: [
          'Pick two saved charts and read them against each other',
          'Bhava-by-bhava, using the same citations as a reading',
          'A quick compatibility read, bundled with saved profiles',
        ],
      },
    ],
  },

  {
    id: 'platform',
    title: 'Platform',
    description: 'How Cyklos reaches you, and what a subscription changes.',
    features: [
      {
        slug: 'notifications',
        title: 'Notifications',
        description: 'A daily alert at a time you choose.',
        icon: Bell,
        status: 'planned',
        sourceDecision: 'Push notifications and daily alerts — “yes”',
        contents: ['A single daily alert', 'Timed to your morning', 'Nothing else is ever pushed'],
      },
      {
        slug: 'streaks',
        title: 'Streaks',
        description: 'A quiet count of the days you have checked in.',
        icon: Flame,
        status: 'planned',
        sourceDecision: 'Streaks / daily check-in rewards — “yes”',
        contents: ['A day count, kept quiet', 'Rewards that do not nag', 'No loss framing'],
      },
      {
        slug: 'referrals',
        title: 'Refer a friend',
        description: 'Share Cyklos and both of you get something back.',
        icon: Gift,
        status: 'planned',
        sourceDecision: 'Referral rewards — “yes”',
        contents: ['A link of your own', 'What each side receives', 'Where your referrals stand'],
      },
      {
        slug: 'signup-reward',
        title: 'Signup reward',
        description: 'What a new account starts with.',
        icon: TicketPercent,
        status: 'planned',
        sourceDecision: 'Signup wallet credit — “yes”',
        contents: [
          'Credit applied at signup',
          'What it can be spent on',
          'When it expires, stated up front',
        ],
      },
      {
        slug: 'subscription',
        title: 'Subscription',
        description: 'What a plan unlocks, and what stays free.',
        icon: Crown,
        status: 'planned',
        sourceDecision: 'Subscription plan — “yes”',
        contents: [
          'Plans and what each includes',
          'What remains free forever',
          'Cancel in one step',
        ],
      },
      {
        slug: 'ad-free',
        title: 'Ad-free',
        description: 'No advertising anywhere in the product.',
        icon: Eye,
        status: 'planned',
        sourceDecision: 'Ad-free experience — “yes”',
        contents: ['Included with a subscription', 'No trackers sold to third parties'],
      },
      {
        slug: 'blog',
        title: 'Articles',
        description: 'Writing on how the calculations actually work.',
        icon: Newspaper,
        status: 'planned',
        sourceDecision: 'Blog and articles — “yes”',
        contents: [
          'How a chart is calculated',
          'What each bhava reads for',
          'Why an answer carries its limits',
        ],
      },
      {
        slug: 'widget',
        title: 'Home-screen widget',
        description: 'Today’s reading without opening the app.',
        icon: Smartphone,
        status: 'planned',
        sourceDecision: 'Home-screen widget — “yes”',
        contents: ['Today’s line on your home screen', 'The running dasha at a glance'],
      },
    ],
  },
]

/**
 * Recorded in the reference with no decision against them.
 *
 * Shown disabled and never linked. They are listed rather than hidden because
 * these are the ones people ask for, and saying "not decided" is more honest
 * than saying nothing.
 */
/**
 * The eight capabilities the product leads with — shown first on Tools,
 * and mirrored in primary navigation where a direct route exists.
 */
export const primaryProductFeatures: Feature[] = [
  {
    slug: 'kundli',
    title: 'Kundli',
    description: 'Your chart, section by section — planets, houses, dasha and more.',
    icon: Orbit,
    status: 'live',
    to: paths.chart,
    sourceDecision: 'Primary product — Kundli with section-wise chart reading',
    contents: [
      'Birth chart with the six house-style sections',
      'Planets, houses, yogas and dasha timelines',
      'Switch between saved family and friend profiles',
    ],
  },
  {
    slug: 'birth-time-rectification',
    title: 'Birth time rectification',
    description: 'Narrow an uncertain birth time from events you already know.',
    icon: Clock,
    status: 'planned',
    sourceDecision: 'Birth time rectification — “Yes”',
    contents: [
      'Enter events with known dates — marriage, a move, a job change',
      'The app proposes the birth times that fit them',
      'Recalculates the chart against the chosen time',
    ],
  },
  {
    slug: 'matching',
    title: 'Matching',
    description: 'Match making — Guna Milan across thirty-six points.',
    icon: HeartHandshake,
    status: 'live',
    to: paths.matching,
    sourceDecision: 'Kundli matching / guna milan (36 points) — “As per our style”',
  },
  {
    slug: 'kundli-matching-profiles',
    title: 'Kundli Matching with different profiles',
    description: 'Compare charts across your saved profiles — family, friends, partners.',
    icon: Users,
    status: 'live',
    to: paths.compatibility,
    sourceDecision: 'Primary product — matching against multiple saved profiles',
  },
  {
    slug: 'horoscope',
    title: 'Horoscope',
    description: 'Daily and personalised readings written against your own chart.',
    icon: Sun,
    status: 'live',
    to: paths.horoscope('daily'),
    sourceDecision: 'Primary product — horoscope suite',
  },
  {
    slug: 'panchang',
    title: 'Panchang',
    description: 'Tithi, nakshatra, choghadiya and auspicious hours.',
    icon: CalendarDays,
    status: 'planned',
    sourceDecision: 'Section D — promoted to primary product surface',
    contents: [
      'Today’s panchang for your location',
      'Tithi, nakshatra, yoga and karana',
      'Muhurat windows worth planning around',
    ],
  },
  {
    slug: 'dosha',
    title: 'Dosha calculator',
    description: 'Mangal, Kaal Sarp, Sade Sati and Pitra dosha.',
    icon: Flame,
    status: 'planned',
    sourceDecision: 'Section E — promoted to primary product surface',
    contents: [
      'Mangal dosha position in the chart',
      'Kaal Sarp, Sade Sati and Pitra checks',
      'Plain-language what each finding means',
    ],
  },
  {
    slug: 'reports',
    title: 'Reports',
    description: 'Long-form life, career, marriage and finance reports.',
    icon: FileText,
    status: 'planned',
    sourceDecision: 'Section G — promoted to primary product surface',
    contents: [
      'Life, career, marriage and finance reports',
      'Written against your chart, not a generic template',
      'Save or share when you want a lasting read',
    ],
  },
]

export const undecidedFeatures: Feature[] = [
  {
    slug: 'kundli-pdf',
    title: 'Kundli PDF',
    description: 'Your full chart as a document you can keep.',
    icon: FileText,
    status: 'undecided',
    sourceDecision: 'Kundli PDF download — no decision recorded',
  },
]

/**
 * Left out on purpose.
 *
 * Every one of these is marked "No" or "Need to discuss" in the reference.
 * The list exists so the exclusion is a decision on record rather than an
 * omission somebody later "fixes".
 */
export const excludedFromProduct = [
  { title: 'Chinese horoscope', reason: 'No' },
  { title: 'Zodiac love compatibility', reason: 'No' },
  { title: 'Tarot, palmistry, face reading, numerology, dream interpretation', reason: 'No' },
  { title: 'Vastu consultation and reports', reason: 'No' },
  { title: 'Devotional content, temple directory, live darshan', reason: 'No' },
  { title: 'Astrology learning content', reason: 'No' },
  { title: 'WhatsApp delivery of reports', reason: 'No' },
  { title: 'Astrologer calls, video, live sessions, wallet and recharge', reason: 'No' },
  { title: 'Gemstone, rudraksha and puja commerce', reason: 'Need to discuss' },
]

/** Every feature that has a slug, for the `/explore/:slug` route. */
export const allFeatures: Feature[] = (() => {
  const bySlug = new Map<string, Feature>()
  for (const feature of [
    ...featureGroups.flatMap((group) => group.features),
    ...undecidedFeatures,
    ...primaryProductFeatures,
  ]) {
    bySlug.set(feature.slug, feature)
  }
  return [...bySlug.values()]
})()

export function featureBySlug(slug: string): Feature | undefined {
  return (
    primaryProductFeatures.find((feature) => feature.slug === slug) ??
    allFeatures.find((feature) => feature.slug === slug)
  )
}

/** Horoscopes share a shape, so they are built rather than repeated. */
/**
 * The astronomical glyph each feature is marked with, by slug.
 *
 * One table rather than a field on every literal, so the decisions can be read
 * against each other — and so the omissions are visible. Notifications is a
 * bell and a referral is a gift: dressing those as astrology would be costume,
 * not language, so they keep their icons and are simply absent here.
 */
const GLYPH_BY_SLUG: Record<string, string> = {
  // My Chart — the instrument itself.
  'birth-chart': '\u2295',
  grahas: '\u2609\uFE0E',
  bhavas: '\u2302',
  drishti: '\u21C4',
  dasha: '\u263D\uFE0E',
  ashtakavarga: '\u2058',
  'saved-charts': '\u25CC',
  'birth-time-rectification': '\u29D6',
  'celebrity-charts': '\u2726',

  // Horoscopes — the graha or sign each one is actually read from.
  'horoscope-daily': '\u2609\uFE0E',
  'horoscope-tomorrow': '\u2609\uFE0E',
  'horoscope-weekly': '\u2726',
  'horoscope-monthly': '\u263D\uFE0E',
  'horoscope-yearly': '\u2648\uFE0E',
  'horoscope-yearly-personal': '\u2295',
  'horoscope-love': '\u2640\uFE0E',
  'horoscope-career': '\u2644\uFE0E',
  'horoscope-health': '\u2649\uFE0E',
  'horoscope-finance': '\u2643\uFE0E',
  'horoscope-lucky': '\u2727',
  'horoscope-daily-personal': '\u2295',
  'horoscope-rashifal': '\u264B\uFE0E',

  // Matching — the nodes, which is where a union is read.
  'kundli-matching': '\u260A',
  'love-compatibility': '\u2640\uFE0E',
  compatibility: '\u260B',

  // Recorded without a decision, but astrological all the same.
  kundli: '\u2652',
  matching: '\u260A',
  'kundli-matching-profiles': '\u260B',
  horoscope: '\u2609\uFE0E',
  panchang: '\u263E\uFE0E',
  dosha: '\u2642\uFE0E',
  reports: '\u2295',
  'kundli-pdf': '\u2295',
}

/*
  Stamped on once, here, rather than threaded through every literal and the
  `horoscope` helper. A feature with no entry keeps its Lucide icon.
*/
for (const group of featureGroups) {
  for (const feature of group.features) {
    feature.glyph = GLYPH_BY_SLUG[feature.slug]
  }
}
for (const feature of primaryProductFeatures) {
  feature.glyph = GLYPH_BY_SLUG[feature.slug]
}
for (const feature of undecidedFeatures) {
  feature.glyph = GLYPH_BY_SLUG[feature.slug]
}

function horoscope(
  slug: string,
  title: string,
  description: string,
  icon: LucideIcon,
  sourceRow: string,
): Feature {
  return {
    slug: `horoscope-${slug}`,
    title,
    description,
    icon,
    status: 'live',
    to: paths.horoscope(slug),
    sourceDecision: `${sourceRow} — “Yes, need to work on Self”`,
    contents: [
      'Written by Cyklos rather than syndicated',
      'Names the bhava and grahas it was read from',
      'A range rather than a single promise',
    ],
  }
}
