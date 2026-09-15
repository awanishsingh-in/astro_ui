import type { BhavaNumber, GrahaCode } from '@/types/astrology'

/**
 * The themes a question usually belongs to, each tied to the bhava it would be
 * read from.
 *
 * This is not a list of prompts. Every card names the part of the chart the
 * answer would come out of, so choosing one teaches how the product works —
 * a question about work is a question about bh 10, and the card says so.
 */
export interface QuestionTheme {
  id: string
  label: string
  bhava: BhavaNumber
  /** What that bhava reads for, in the card's own words. */
  reads: string
  /** The grahas most often cited for this theme. */
  grahas: GrahaCode[]
  /** Words that route a free-typed question here. */
  keywords: string[]
  /**
   * A qualifier narrows a question rather than being its subject. "Which
   * months suit a property purchase" is about property; the timing words only
   * shape it. Qualifiers therefore lose to any subject that also matches.
   */
  qualifier?: boolean
  /** Ready-made questions, the first of which the card asks on tap. */
  questions: string[]
}

export const questionThemes: QuestionTheme[] = [
  {
    id: 'career',
    label: 'Career',
    bhava: 10,
    reads: 'work and standing',
    grahas: ['Sa', 'Ju'],
    keywords: [
      'job', 'career', 'work', 'promotion', 'boss', 'office', 'resign',
      'appraisal', 'business', 'kaam', 'naukri', 'offer', 'employer',
      'my own', 'venture', 'startup', 'freelance',
    ],
    questions: [
      'Is this year good for a job change?',
      'When will I get the promotion I am due?',
      'Should I start something of my own?',
    ],
  },
  {
    id: 'money',
    label: 'Money',
    bhava: 2,
    reads: 'wealth and speech',
    grahas: ['Ve', 'Ju'],
    keywords: ['money', 'loan', 'salary', 'wealth', 'finance', 'debt', 'savings', 'invest', 'paisa'],
    questions: [
      'Will the loan come through this year?',
      'Is this a good year to invest?',
      'When do my finances steady?',
    ],
  },
  {
    id: 'relationships',
    label: 'Relationships',
    bhava: 7,
    reads: 'partnership',
    grahas: ['Ve', 'Ju'],
    keywords: [
      'marriage', 'married', 'marry', 'partner', 'relationship', 'love', 'wedding',
      'spouse', 'shaadi', 'divorce', 'engaged', 'commitment',
    ],
    questions: [
      'When will I get married?',
      'Is this partnership worth continuing?',
      'What does my chart say about commitment?',
    ],
  },
  {
    id: 'property',
    label: 'Property',
    bhava: 4,
    reads: 'home and mother',
    grahas: ['Ma', 'Ve'],
    keywords: [
      'property', 'house', 'home', 'land', 'flat', 'apartment', 'buy',
      'rent', 'move', 'ghar', 'relocate', 'shift',
    ],
    questions: [
      'Which months suit a property purchase?',
      'Is this the right time to move cities?',
      'Should I buy or keep renting?',
    ],
  },
  {
    id: 'timing',
    label: 'Timing',
    bhava: 9,
    reads: 'fortune and belief',
    grahas: ['Ju', 'Sa'],
    /*
      Deliberately no bare "when": almost every question here starts with it,
      and it would swallow "when will I get married" — a question about bh 7,
      not about timing in the abstract.
    */
    qualifier: true,
    keywords: [
      'timing', 'muhurat', 'auspicious', 'which months', 'best month',
      'best time', 'right time', 'good time', 'avoid', 'launch',
      'start', 'begin',
    ],
    questions: [
      'Which months are strongest for me this year?',
      'When should I start something new?',
      'What should I avoid in the next six months?',
    ],
  },
  {
    id: 'dasha',
    label: 'Current dasha',
    bhava: 1,
    reads: 'the period you are living through',
    grahas: ['Ju', 'Mo'],
    keywords: ['dasha', 'period', 'mahadasha', 'antardasha', 'phase', 'currently'],
    questions: [
      'What does my current dasha mean?',
      'What changes when this period ends?',
      'Which part of life does this period touch?',
    ],
  },
]

/**
 * Route a free-typed question to a theme.
 *
 * Subject first, qualifier second: "which months suit a property purchase" is
 * a property question that happens to ask about months, so `property` wins
 * over `timing`. Within a tier the longest matching keyword wins, so a
 * specific phrase beats an incidental word.
 */
export function themeFor(question: string): QuestionTheme {
  const q = question.toLowerCase()

  const score = (theme: QuestionTheme) => {
    const matched = theme.keywords.filter((word) => q.includes(word))
    if (matched.length === 0) return 0
    return Math.max(...matched.map((word) => word.length)) + matched.length
  }

  const pick = (pool: QuestionTheme[]) =>
    pool.reduce<{ theme: QuestionTheme; score: number } | null>((best, theme) => {
      const value = score(theme)
      if (value === 0) return best
      return !best || value > best.score ? { theme, score: value } : best
    }, null)

  const subject = pick(questionThemes.filter((t) => !t.qualifier))
  if (subject) return subject.theme

  const qualifier = pick(questionThemes.filter((t) => t.qualifier))
  if (qualifier) return qualifier.theme

  // No subject and no qualifier: read it against the period, which every
  // question sits inside whether or not it names one.
  return questionThemes.find((t) => t.id === 'dasha') ?? questionThemes[0]
}
