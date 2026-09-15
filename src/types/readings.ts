import type { BhavaNumber, GrahaCode } from './astrology'

/**
 * A reading is a question answered from the chart. The answer always has the
 * same five parts, and it always names what it was read from — that citation
 * is what lets Readings be indexed by bhava and by dasha instead of by time.
 */

/** What a reading was drawn from. Drives both the citation and the index. */
export interface ReadingSource {
  /** The bhava the answer was read from, when there is one. */
  bhava?: BhavaNumber
  /** Grahas cited in the answer. */
  grahas: GrahaCode[]
  /** The dasha running when the question was asked, e.g. "Guru — Chandra — Budha". */
  dashaPath?: string
  /** Free-text note, e.g. "Jupiter enters bh 10 · 12 Oct 2026". */
  note?: string
}

/**
 * The window an answer applies to.
 *
 * Always a range, never a date: a transit turns over days, not at an instant,
 * and saying otherwise would promise a precision the chart does not carry.
 */
export interface ReadingWindow {
  /** ISO date. */
  start: string
  end: string
  /** What opens and closes it, e.g. "Jupiter in bh 10". */
  driver?: string
}

/** The answer's fixed shape: verdict, reason, points, source, one question back. */
export interface Answer {
  /** The direct answer in one sentence, e.g. "After 12 October, not before it." */
  verdict: string
  /** Why the chart says so. */
  reason: string
  /** Three short supporting points. Never more, so the answer stays readable. */
  points: string[]
  source: ReadingSource
  /** When the answer applies. Absent when the question is not about timing. */
  window?: ReadingWindow
  /**
   * What the chart does not show. Every answer carries one, because an answer
   * without its limits reads as certainty the chart cannot support.
   */
  limits: string
  /** The single question the app asks back to narrow the reading. */
  questionBack?: string
  /** Suggested follow-ups the user can tap. */
  followUps: string[]
}

export interface Reading {
  id: string
  question: string
  /** ISO timestamp. */
  askedAt: string
  /** Number of messages in the thread, shown in list rows. */
  replyCount: number
  source: ReadingSource
  answer: Answer
}

/** The three lenses Readings is viewed through. */
export type ReadingLens = 'bhava' | 'period' | 'everything'

/** Readings grouped under one bhava. */
export interface BhavaReadingGroup {
  bhava: BhavaNumber
  /** e.g. "work and standing". */
  signifies: string
  /** e.g. "Mithuna · lord Budha in bh 1 · 25 bindus". */
  context: string
  readings: Reading[]
}

/** Readings grouped under one dasha period. */
export interface PeriodReadingGroup {
  /** e.g. "Guru — Chandra". */
  label: string
  start: string
  end: string
  current: boolean
  readings: Reading[]
}

/** A starter prompt on Home. */
export interface SuggestedQuestion {
  id: string
  text: string
}

/** What the app is doing while an answer is calculated — named, never a spinner. */
export interface AskProgress {
  /** e.g. "Reading your tenth house…" */
  label: string
}
