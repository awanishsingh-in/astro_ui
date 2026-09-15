import type { Chart, GrahaCode } from '@/types/astrology'
import type { Reading } from '@/types/readings'
import type { DashaSummary } from './dasha-mock'
import { themeFor } from './question-themes'
import { BHAVA_SIGNIFIES, bhavaRef, GRAHAS } from '@/utils/astro'
import { formatMonthYear } from '@/utils/format'

/**
 * A stand-in for the reading engine.
 *
 * The *prose* is assembled from templates, but every fact inside it is read
 * out of the chart that is actually on screen — the bhava's bindus against its
 * own mean, the lord's placement, each graha's dignity, who aspects the bhava,
 * and the dasha running today. Change the profile or the varga and the answer
 * changes with it.
 *
 * That is the difference between this and a chatbot: the sentences are
 * generated, the evidence is not.
 */

const MS_PER_DAY = 86400000

/** A window that opens after the current pratyantar and runs a few months. */
function windowFrom(dasha: DashaSummary, months: number) {
  const start = Date.parse(dasha.endsOn) || Date.now()
  return {
    start: new Date(start).toISOString().slice(0, 10),
    end: new Date(start + months * 30 * MS_PER_DAY).toISOString().slice(0, 10),
  }
}

export function buildAnswer(question: string, chart: Chart, dasha: DashaSummary): Reading {
  const theme = themeFor(question)
  const bhava = chart.bhavas.find((b) => b.bhava === theme.bhava)!
  const entry = chart.ashtakavarga.entries.find((e) => e.bhava === theme.bhava)!
  const mean = chart.ashtakavarga.mean
  const above = entry.bindus >= mean

  const lord = chart.grahas.find((g) => g.graha === bhava.lordCode)!
  const occupants = chart.grahas.filter((g) => g.bhava === theme.bhava)
  const aspecting = chart.drishti.filter((d) => d.aspects.includes(theme.bhava))

  /** The grahas this answer is actually built on — the citation, not decoration. */
  const cited: GrahaCode[] = Array.from(
    new Set<GrahaCode>([
      bhava.lordCode,
      ...occupants.map((o) => o.graha),
      ...aspecting.slice(0, 2).map((a) => a.graha),
    ]),
  ).slice(0, 4)

  const window = windowFrom(dasha, above ? 5 : 9)
  const windowText = `${formatMonthYear(window.start)} – ${formatMonthYear(window.end)}`

  // ── Verdict: the direction, and when ──────────────────────────────
  const verdict = above
    ? `Supported — and the clearest stretch is ${windowText}.`
    : `Possible, but this is not the part of your chart that carries you.`

  // ── Reason: why the chart says so ─────────────────────────────────
  const reason = [
    `${bhavaRef(theme.bhava)} — ${BHAVA_SIGNIFIES[theme.bhava]} — carries ${entry.bindus} bindus against a mean of ${mean},`,
    above ? 'which puts it above the line.' : 'which puts it below the line.',
    `Its lord ${bhava.lord} stands in ${bhavaRef(lord.bhava)}${lord.dignity === 'debilitated' ? ', debilitated' : lord.dignity === 'exalted' || lord.dignity === 'own' ? `, ${lord.dignity === 'own' ? 'in its own sign' : 'exalted'}` : ''},`,
    occupants.length > 0
      ? `and ${occupants.map((o) => GRAHAS[o.graha].name).join(', ')} ${occupants.length === 1 ? 'sits' : 'sit'} in the bhava itself.`
      : 'and no graha occupies the bhava, so the lord decides most of it.',
  ].join(' ')

  // ── Three points, each one a fact from the chart ──────────────────
  const points: string[] = [
    above
      ? `${bhavaRef(theme.bhava)} is above its own mean at ${entry.bindus} bindus — the ground supports what is tried here`
      : `${bhavaRef(theme.bhava)} sits at ${entry.bindus} bindus against ${mean} — effort here costs more than elsewhere in the chart`,
    lord.dignity === 'debilitated'
      ? `${bhava.lord}, the bhava lord, is debilitated in ${lord.rashi} — what it governs arrives late rather than not at all`
      : `${bhava.lord}, the bhava lord, stands in ${bhavaRef(lord.bhava)} — ${lord.bhava === theme.bhava ? 'the matter is self-contained' : `this reads through ${BHAVA_SIGNIFIES[lord.bhava]}`}`,
    aspecting.length > 0
      ? `${aspecting
          .slice(0, 2)
          .map((a) => `${GRAHAS[a.graha].name} aspects it by its ${a.by[a.aspects.indexOf(theme.bhava)] ?? '7th'} drishti`)
          .join('; ')}`
      : `No graha aspects ${bhavaRef(theme.bhava)} — nothing outside it is pulling on the result`,
  ]

  // ── What the chart cannot see ─────────────────────────────────────
  const limits = above
    ? `The chart shows when conditions favour this, not whether any particular choice inside that window is a good one. It cannot see the people or the terms involved.`
    : `A below-mean bhava describes resistance, not refusal. The chart has no view on how hard you are willing to work against it.`

  return {
    id: `rd_new_${Date.now()}`,
    question,
    askedAt: new Date().toISOString(),
    replyCount: 1,
    source: { bhava: theme.bhava, grahas: cited, dashaPath: dasha.path },
    answer: {
      verdict,
      reason,
      points,
      source: { bhava: theme.bhava, grahas: cited, dashaPath: dasha.path },
      window: { ...window, driver: `after ${dasha.path.split(' — ').pop()} closes` },
      limits,
      questionBack: questionBackFor(theme.id, windowText),
      followUps: followUpsFor(theme.id),
    },
  }
}

function questionBackFor(themeId: string, windowText: string): string {
  switch (themeId) {
    case 'career':
      return `Are you considering a move inside ${windowText}, or waiting to be approached?`
    case 'money':
      return 'Is there a specific amount and date you are planning against?'
    case 'relationships':
      return 'Is this about someone already in your life, or about whether to look?'
    case 'property':
      return 'Would this be to live in, or to hold?'
    case 'timing':
      return 'What is the decision you are trying to time?'
    default:
      return 'Is there a decision you are timing against this period?'
  }
}

function followUpsFor(themeId: string): string[] {
  switch (themeId) {
    case 'career':
      return [
        'What happens if I wait until next year?',
        'Which months are strongest?',
        'What kind of work suits this chart?',
      ]
    case 'money':
      return ['Which months are strongest?', 'What does my current dasha mean?']
    case 'relationships':
      return ['What does my D-9 say?', 'Which months are strongest?']
    case 'property':
      return ['What happens if I wait until next year?', 'What does bh 4 say about moving cities?']
    case 'timing':
      return ['What does my current dasha mean?', 'Which months should I avoid?']
    default:
      return ['What changes when this period ends?', 'Which months are strongest?']
  }
}
