import type {
  BhavaReadingGroup,
  PeriodReadingGroup,
  Reading,
  SuggestedQuestion,
} from '@/types/readings'

/**
 * Mock readings. Every one carries its source, because the source is what the
 * Readings index is built from — by bhava and by dasha, not by recency.
 */

export const readings: Reading[] = [
  {
    id: 'rd_01',
    question: 'Is this year good for a job change?',
    askedAt: '2026-09-07T14:14:00+05:30',
    replyCount: 4,
    source: {
      bhava: 10,
      grahas: ['Ju', 'Sa'],
      dashaPath: 'Guru — Chandra',
      note: '♃ Jupiter enters bh 10 · 12 Oct 2026',
    },
    answer: {
      verdict: 'After 12 October, not before it.',
      reason:
        'Jupiter enters your tenth house on 12 October 2026 and stays there until August 2027. The tenth house is the one your work sits in.',
      points: [
        'Strongest window: 12 Oct to 20 Dec 2026',
        'Saturn holds your current role until early October',
        'A move signed before that date is likely to be renegotiated',
      ],
      source: {
        bhava: 10,
        grahas: ['Ju', 'Sa'],
        dashaPath: 'Guru — Chandra — Budha',
      },
      window: { start: '2026-10-12', end: '2027-02-28', driver: 'Guru in bh 10' },
      limits:
        'The chart shows when the ground is favourable, not whether a particular offer is a good one. It cannot see the company, the salary or the people.',
      questionBack: 'Do you have an offer in hand, or are you deciding whether to start looking?',
      followUps: ['What kind of work suits this chart?', 'Which months should I avoid?'],
    },
  },
  {
    id: 'rd_02',
    question: 'What does my current dasha mean?',
    askedAt: '2026-09-07T11:02:00+05:30',
    replyCount: 2,
    source: { grahas: ['Ju'], dashaPath: 'Guru — Chandra', note: 'Guru mahadasha' },
    answer: {
      verdict: 'A sixteen-year opening period, now in its middle stretch.',
      reason:
        'Guru mahadasha runs from July 2014 to July 2030. Guru sits in bh 4 in its own sign, which is why this period has widened rather than narrowed things.',
      points: [
        'Guru — Chandra antardasha runs to March 2027',
        'Budha pratyantar closes 8 October 2026',
        'The next mahadasha, Shani, begins July 2030',
      ],
      source: { grahas: ['Ju', 'Mo'], dashaPath: 'Guru — Chandra — Budha' },
      window: { start: '2014-07-01', end: '2030-07-01', driver: 'Guru mahadasha' },
      limits:
        'A dasha describes the weather of a period, not the events inside it. Two people in the same period live very different years.',
      questionBack: 'Is there a decision you are timing against this period?',
      followUps: ['What changes when Shani begins?', 'Which bhavas does Guru activate?'],
    },
  },
  {
    id: 'rd_03',
    question: 'Kaam mein promotion kab milega?',
    askedAt: '2026-08-31T17:40:00+05:30',
    replyCount: 3,
    source: {
      bhava: 10,
      grahas: ['Sa'],
      dashaPath: 'Guru — Shukra',
      note: '♄ Saturn aspects bh 10 · 3rd drishti',
    },
    answer: {
      verdict: 'Recognition arrives late, but it holds.',
      reason:
        'Shani aspects bh 10 by its third drishti. That delays the title rather than the work, and what it does give it rarely takes back.',
      points: [
        'Bh 10 carries 25 bindus, below the mean of 28.1',
        'Bh 10 lord Budha stands in bh 1 — the standing is self-made',
        'The window widens once Guru transits bh 10',
      ],
      source: { bhava: 10, grahas: ['Sa', 'Me'], dashaPath: 'Guru — Shukra' },
      window: { start: '2026-10-01', end: '2027-08-31', driver: 'Guru transiting bh 10' },
      limits:
        'Shani delays; it does not say by how much. The chart cannot see your organisation\u2019s review cycle, which may matter more than the transit.',
      questionBack: 'Has a review already been scheduled?',
      followUps: ['Should I ask, or wait to be offered?'],
    },
  },
  {
    id: 'rd_04',
    question: 'Should I take the offer from Pune?',
    askedAt: '2026-07-14T09:20:00+05:30',
    replyCount: 2,
    source: {
      bhava: 10,
      grahas: ['Me'],
      dashaPath: 'Guru — Shukra',
      note: 'bh 10 lord Budha in bh 1',
    },
    answer: {
      verdict: 'Yes, if the role is yours to shape.',
      reason:
        'Bh 10 lord Budha stands in bh 1. Work in this chart goes well when it is directed by you rather than handed down.',
      points: [
        'Bh 4, home, is strong at 29 bindus — a move is supported',
        'Guru in bh 4 in its own sign steadies the relocation',
        'Ma debilitated in bh 11 — do not count on the promised gains',
      ],
      source: { bhava: 10, grahas: ['Me', 'Ju'], dashaPath: 'Guru — Shukra' },
      window: { start: '2026-07-01', end: '2026-12-31', driver: 'Guru — Shukra antardasha' },
      limits:
        'This reads the shape of the work, not the terms of the contract. Nothing here is a view on the money.',
      followUps: ['What does bh 4 say about moving cities?'],
    },
  },
  {
    id: 'rd_05',
    question: 'Will the loan come through this year?',
    askedAt: '2026-04-02T13:05:00+05:30',
    replyCount: 2,
    source: { bhava: 2, grahas: ['Mo'], dashaPath: 'Guru — Surya' },
    answer: {
      verdict: 'Likely, and sooner than the paperwork suggests.',
      reason: 'Bh 2 carries 31 bindus, well above the mean, and Chandra stands in it.',
      points: [
        'Bh 2 is among the three strongest in the chart',
        'Shukra, its lord, sits in the lagna',
        'Sa aspects bh 12 — keep the repayment plain',
      ],
      source: { bhava: 2, grahas: ['Mo', 'Ve'], dashaPath: 'Guru — Surya' },
      window: { start: '2026-04-01', end: '2026-11-30', driver: 'Guru — Surya antardasha' },
      limits:
        'Bh 2 speaks to resources, not to a lender\u2019s criteria. Your paperwork decides more of this than the chart does.',
      followUps: ['What is the best month to apply?'],
    },
  },
  {
    id: 'rd_06',
    question: 'Which months are good for travel?',
    askedAt: '2026-03-11T08:45:00+05:30',
    replyCount: 1,
    source: { bhava: 3, grahas: ['Ma'], dashaPath: 'Guru — Surya' },
    answer: {
      verdict: 'February and again from late September.',
      reason: 'Bh 3 sits at 26 bindus, under the mean, so travel here rewards timing.',
      points: [
        'Ma rules bh 3 and stands debilitated in bh 11',
        'Sa aspects bh 3 by its third drishti',
        'Short trips read better than long relocations',
      ],
      source: { bhava: 3, grahas: ['Ma', 'Sa'], dashaPath: 'Guru — Surya' },
      window: { start: '2026-02-01', end: '2026-03-15', driver: 'Ma out of Sa\u2019s drishti' },
      limits:
        'Timing only. The chart has no view on where you go or whether the trip is worth taking.',
      followUps: ['Is a long trip advisable this year?'],
    },
  },
  {
    id: 'rd_07',
    question: 'When will I get married?',
    askedAt: '2024-11-22T20:15:00+05:30',
    replyCount: 3,
    source: { bhava: 7, grahas: ['Ju', 'Ke'], dashaPath: 'Guru — Shukra' },
    answer: {
      verdict: 'The period favours it; the chart asks you to choose slowly.',
      reason:
        'Bh 7 is ruled by Guru, which sits in bh 4 in its own sign. Ketu stands in bh 7 itself.',
      points: [
        'Ketu in bh 7 reads as detachment, not absence',
        'D-9 should be read alongside D-1 here',
        'Guru — Shukra was the widest window in this mahadasha',
      ],
      source: { bhava: 7, grahas: ['Ju', 'Ke'], dashaPath: 'Guru — Shukra' },
      window: { start: '2022-05-01', end: '2025-01-01', driver: 'Guru — Shukra antardasha' },
      limits:
        'The chart shows when partnership is supported, never who. It cannot name a person or promise one.',
      followUps: ['What does my D-9 say?'],
    },
  },
  {
    id: 'rd_08',
    question: 'Why did the 2019 role not work out?',
    askedAt: '2026-03-02T19:30:00+05:30',
    replyCount: 5,
    source: {
      bhava: 10,
      grahas: ['Ra'],
      dashaPath: 'Guru — Shukra',
      note: 'Rahu antardasha · to Jul 2014',
    },
    answer: {
      verdict: 'It belonged to a period that had already closed.',
      reason: 'The role was taken under a Rahu antardasha whose terms did not carry into Guru.',
      points: [
        'Ra stands in bh 1 — the ambition was yours, the structure was not',
        'Bh 10 at 25 bindus does not hold what is not chosen deliberately',
        'The same decision now reads differently',
      ],
      source: { bhava: 10, grahas: ['Ra', 'Me'], dashaPath: 'Guru — Shukra' },
      window: { start: '2019-01-01', end: '2020-06-30', driver: 'Rahu antardasha closing' },
      limits:
        'A reading of the period, not of anyone in it. The chart cannot apportion blame and does not try to.',
      followUps: ['What should I look for instead?'],
    },
  },
]

export const readingsById = new Map(readings.map((r) => [r.id, r]))

/** The by-bhava lens. Only bhavas that have been asked about appear. */
export const readingsByBhava: BhavaReadingGroup[] = [
  {
    bhava: 10,
    signifies: 'work and standing',
    context: 'Mithuna · lord Budha in bh 1 · 25 bindus',
    readings: [readings[0], readings[2], readings[3], readings[7]],
  },
  {
    bhava: 2,
    signifies: 'wealth and speech',
    context: 'Tula · lord Shukra in bh 1 · 31 bindus',
    readings: [readings[4]],
  },
  {
    bhava: 3,
    signifies: 'siblings and effort',
    context: 'Vrischika · lord Mangal in bh 11 · 26 bindus',
    readings: [readings[5]],
  },
  {
    bhava: 7,
    signifies: 'partnership',
    context: 'Meena · lord Guru in bh 4 · 27 bindus',
    readings: [readings[6]],
  },
]

/** Bhavas with no readings yet — surfaced as an invitation, not an omission. */
export const unaskedBhavas = [5, 8, 11, 12]

/** The by-period lens. */
export const readingsByPeriod: PeriodReadingGroup[] = [
  {
    label: 'Guru — Chandra',
    start: '2025-11-01',
    end: '2027-03-01',
    current: true,
    readings: [readings[0], readings[1]],
  },
  {
    label: 'Guru — Surya',
    start: '2025-01-01',
    end: '2025-11-01',
    current: false,
    readings: [readings[4], readings[5], readings[7]],
  },
  {
    label: 'Guru — Shukra',
    start: '2022-05-01',
    end: '2025-01-01',
    current: false,
    readings: [readings[2], readings[6], readings[3]],
  },
]

/** Home's starter prompts. */
/*
  No glyph or bhava is stored here. Each card reads its own astrology off
  `themeFor`, the same router the Ask flow uses to decide where an answer comes
  from — so what a card promises is what the answer will actually cite.
*/
export const suggestedQuestions: SuggestedQuestion[] = [
  { id: 'sq_01', text: 'Is this year good for a job change?' },
  { id: 'sq_02', text: 'What does my current dasha mean?' },
  { id: 'sq_03', text: 'Kya yeh saal accha rahega?' },
  { id: 'sq_04', text: 'Which months suit a property purchase?' },
]
