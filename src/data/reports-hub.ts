import {
  Baby,
  Briefcase,
  Coins,
  FileText,
  Gem,
  HeartHandshake,
  HeartPulse,
  type LucideIcon,
} from 'lucide-react'

export type ReportId =
  | 'life'
  | 'career'
  | 'marriage'
  | 'finance'
  | 'health'
  | 'education'
  | 'gemstone'
  | 'numerology'

export interface ReportTopic {
  id: ReportId
  title: string
  blurb: string
  /** Longer explanation shown after Get on the hub. */
  about: string
  /** Chapters / themes covered in this report. */
  covers: string[]
  price: number
  icon: LucideIcon
}

/** Paid report catalogue on the Reports hub. */
export const REPORT_TOPICS: ReportTopic[] = [
  {
    id: 'life',
    title: 'Life / Brihat',
    blurb: 'Full life-path reading from the birth chart.',
    about:
      'A wide life-path reading from lagna, moon, and the major dashas. It walks the opening of the path, work and standing, bond and kinship, and the closing stretch of the current cycle — written as a book you can keep.',
    covers: [
      'The opening of the path',
      'Work and standing',
      'Bond and kinship',
      'Closing stretch of the cycle',
    ],
    price: 999,
    icon: FileText,
  },
  {
    id: 'career',
    title: 'Career',
    blurb: 'Work, standing, and timing for vocation.',
    about:
      'Focused on vocation and standing — bhava 10, its lord, and the running dasha. It names the vocation thread, when work timing is stronger, and how sponsors and delivery shape standing — without career guarantees.',
    covers: ['The vocation thread', 'Timing at work', 'Standing and sponsors'],
    price: 699,
    icon: Briefcase,
  },
  {
    id: 'marriage',
    title: 'Marriage',
    blurb: 'Partnership houses and timing notes.',
    about:
      'Partnership notes from bhava 7, Shukra, and supporting houses. Clarity over intensity, stronger and quieter windows for agreements, and care habits that steady the bond — not a dating promise.',
    covers: ['The bond', 'Timing', 'Care'],
    price: 799,
    icon: HeartHandshake,
  },
  {
    id: 'finance',
    title: 'Finance / wealth',
    blurb: 'Wealth yogas and money houses.',
    about:
      'Wealth and speech from bhava 2 and 11 against your means. Income rhythm, agreements and clarity in speech, and what to watch so early over-promising does not invent pressure later.',
    covers: ['Income', 'Speech and agreements', 'Watch'],
    price: 699,
    icon: Coins,
  },
  {
    id: 'health',
    title: 'Health',
    blurb: 'Vitality markers with clear caveats.',
    about:
      'Vitality markers from the chart — rhythm, load, and clear limits. This describes conditions for energy and recovery. It is not a medical diagnosis and never replaces clinical care.',
    covers: ['Rhythm', 'Load', 'Limits'],
    price: 599,
    icon: HeartPulse,
  },
  {
    id: 'education',
    title: 'Education / child',
    blurb: 'Learning and children from the chart.',
    about:
      'Learning and children from the supporting houses. One serious study thread versus scattered courses, and where the chart touches children — patience and small rituals over force.',
    covers: ['Study', 'Children and care'],
    price: 599,
    icon: Baby,
  },
  {
    id: 'gemstone',
    title: 'Gemstone',
    blurb: 'Stones suggested from the chart — not a prescription.',
    about:
      'Stone suggestions from chart lords — primary and quieter supports, with cultural caution. Guidance only: not a medical, financial, or jewellery prescription.',
    covers: ['Primary suggestion', 'Secondary', 'Caution'],
    price: 499,
    icon: Gem,
  },
  {
    id: 'numerology',
    title: 'Numerology',
    blurb: 'Life path and name numbers beside the chart.',
    about:
      'Numbers beside the chart from name and birth date — life path, name tone, and how to use them as a second lens next to graha and bhava, not a replacement.',
    covers: ['Life path', 'Name tone', 'Together with the chart'],
    price: 499,
    icon: FileText,
  },
]

export function reportById(id: string): ReportTopic | undefined {
  return REPORT_TOPICS.find((r) => r.id === id)
}

export function formatInr(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}
