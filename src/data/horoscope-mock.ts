import type { BhavaNumber, Chart, GrahaCode } from '@/types/astrology'
import type { DashaSummary } from './dasha-mock'
import { BHAVA_SIGNIFIES, bhavaRef } from '@/utils/astro'
import { formatDateLong, formatMonthYear } from '@/utils/format'

/**
 * Every horoscope in the product, from one model.
 *
 * The nine kinds differ in three things only: the span they cover, the bhavas
 * they read, and whether they carry lucky information. Everything else —
 * overview, opportunities, watch-outs, timing — is generated the same way from
 * the same chart, which is why there is one page component rather than nine.
 *
 * As with readings, the prose is templated and the evidence is not: bindus,
 * lords, dignities and the running dasha all come from the chart on screen.
 */

export type HoroscopeKind =
  | 'daily'
  | 'tomorrow'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'yearly-personal'
  | 'daily-personal'
  | 'love'
  | 'career'
  | 'health'
  | 'finance'
  | 'lucky'
  | 'rashifal'

interface KindSpec {
  title: string
  /** One line under the title, saying what this horoscope is. */
  standfirst: string
  /** Days the horoscope covers, from its start. */
  span: number
  /** Days from today the period starts. */
  offset: number
  /** The bhavas it reads. The first is the lead. */
  bhavas: BhavaNumber[]
  lucky?: boolean
  /** True where the reference marks it personalised rather than by sign. */
  personal: boolean
}

const SPECS: Record<HoroscopeKind, KindSpec> = {
  daily: { title: 'Today', standfirst: 'The day read against your chart.', span: 1, offset: 0, bhavas: [1, 10, 2], personal: true, lucky: true },
  tomorrow: { title: 'Tomorrow', standfirst: 'Far enough ahead to plan around.', span: 1, offset: 1, bhavas: [1, 3, 11], personal: true, lucky: true },
  weekly: { title: 'This week', standfirst: 'The shape of the week, with its stronger days marked.', span: 7, offset: 0, bhavas: [1, 10, 7], personal: true },
  monthly: { title: 'This month', standfirst: 'The month as one arc rather than thirty verdicts.', span: 30, offset: 0, bhavas: [1, 4, 10], personal: true },
  yearly: { title: 'This year', standfirst: 'The year by sign, with the transits that shape it.', span: 365, offset: 0, bhavas: [1, 9, 10], personal: false },
  'yearly-personal': {
    title: 'Your year ahead',
    standfirst: 'A full year read from your chart — dasha, houses, and the months that ask more of you.',
    span: 365,
    offset: 0,
    bhavas: [1, 10, 7, 2],
    personal: true,
  },
  'daily-personal': { title: 'Today, from your kundli', standfirst: 'Today read from your own chart rather than your sign.', span: 1, offset: 0, bhavas: [1, 5, 11], personal: true, lucky: true },
  love: { title: 'Love', standfirst: 'Bh 7 and Shukra, read for the period you are in.', span: 30, offset: 0, bhavas: [7, 5, 2], personal: true },
  career: { title: 'Career', standfirst: 'Bh 10, its lord, and who aspects it.', span: 30, offset: 0, bhavas: [10, 6, 11], personal: true },
  health: { title: 'Health', standfirst: 'Bh 6 and bh 1, with what the chart cannot see stated plainly.', span: 30, offset: 0, bhavas: [6, 1, 8], personal: true },
  finance: { title: 'Finance', standfirst: 'Bh 2 and bh 11 against their own means.', span: 30, offset: 0, bhavas: [2, 11, 9], personal: true },
  lucky: { title: 'Lucky today', standfirst: 'Drawn from your chart’s own lords, not a fixed table.', span: 1, offset: 0, bhavas: [1, 11], personal: true, lucky: true },
  rashifal: { title: 'Rashifal', standfirst: 'The same reading, in Hindi and regional languages.', span: 1, offset: 0, bhavas: [1, 10, 2], personal: true, lucky: true },
}

export interface HoroscopeTiming {
  label: string
  note: string
  strong: boolean
}

/** Extra chapters for the personalised yearly report only. */
export interface YearlyChapter {
  id: string
  title: string
  eyebrow: string
  body: string
  tone: 'open' | 'hold' | 'push'
}

export interface YearlyLifeArea {
  id: string
  label: string
  score: number
  verdict: string
  detail: string
}

export interface YearlyMonthBeat {
  month: string
  beat: string
  peak?: boolean
}

export interface YearlyEnrichment {
  theme: string
  themeWords: string[]
  opening: string
  closing: string
  chapters: YearlyChapter[]
  lifeAreas: YearlyLifeArea[]
  months: YearlyMonthBeat[]
  practices: string[]
}

export interface Horoscope {
  kind: HoroscopeKind
  title: string
  standfirst: string
  personal: boolean
  period: { label: string; start: string; end: string }
  /** The hero line — the whole horoscope in one sentence. */
  summary: string
  overview: string
  opportunities: string[]
  watchOuts: string[]
  timing: HoroscopeTiming[]
  lucky?: { number: number; colour: string; hours: string; direction: string }
  source: { bhavas: BhavaNumber[]; grahas: GrahaCode[]; dashaPath: string }
  limits: string
  /** Present only on yearly-personal. */
  yearly?: YearlyEnrichment
}

const MS_PER_DAY = 86400000
const COLOURS = ['Deep green', 'Ivory', 'Indigo', 'Ochre', 'Maroon', 'Pale gold', 'Slate']

export function buildHoroscope(
  kind: HoroscopeKind,
  chart: Chart,
  dasha: DashaSummary,
  now = new Date(),
): Horoscope {
  const spec = SPECS[kind]

  const start = new Date(now.getTime() + spec.offset * MS_PER_DAY)
  const end = new Date(start.getTime() + Math.max(0, spec.span - 1) * MS_PER_DAY)

  const entries = chart.ashtakavarga.entries
  const mean = chart.ashtakavarga.mean
  const read = spec.bhavas.map((bhava) => {
    const placement = chart.bhavas.find((b) => b.bhava === bhava)!
    const bindus = entries.find((e) => e.bhava === bhava)!.bindus
    const lord = chart.grahas.find((g) => g.graha === placement.lordCode)!
    return { bhava, placement, bindus, lord, above: bindus >= mean }
  })

  const lead = read[0]
  const strong = read.filter((r) => r.above)
  const weak = read.filter((r) => !r.above)

  const grahas = Array.from(new Set(read.map((r) => r.lord.graha))).slice(0, 4)

  const base: Horoscope = {
    kind,
    title: spec.title,
    standfirst: spec.standfirst,
    personal: spec.personal,
    period: {
      label: periodLabel(spec, start, end),
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    },

    summary: strong.length >= weak.length
      ? `${bhavaRef(lead.bhava)} sits above its mean — this is a stretch that repays being deliberate.`
      : `${bhavaRef(lead.bhava)} sits below its mean — a stretch for holding position rather than pushing.`,

    overview: [
      `${bhavaRef(lead.bhava)} — ${BHAVA_SIGNIFIES[lead.bhava]} — carries ${lead.bindus} bindus against a mean of ${mean}.`,
      `Its lord ${lead.placement.lord} stands in ${bhavaRef(lead.lord.bhava)}${
        lead.lord.dignity === 'debilitated'
          ? ', debilitated'
          : lead.lord.dignity === 'own' || lead.lord.dignity === 'exalted'
            ? `, ${lead.lord.dignity === 'own' ? 'in its own sign' : 'exalted'}`
            : ''
      }.`,
      `You are in ${dasha.path}, which is the period everything below is read against.`,
    ].join(' '),

    opportunities: strong.length
      ? strong.map(
          (r) =>
            `${bhavaRef(r.bhava)} at ${r.bindus} bindus — ${BHAVA_SIGNIFIES[r.bhava]} supports what is tried in it`,
        )
      : [`${dasha.path.split(' — ')[0]} mahadasha is the wider frame — the long arc is steadier than this period`],

    watchOuts: weak.length
      ? weak.map(
          (r) =>
            `${bhavaRef(r.bhava)} at ${r.bindus} bindus, under the mean — ${BHAVA_SIGNIFIES[r.bhava]} costs more effort here`,
        )
      : ['Nothing in the bhavas read here falls under its mean. That is not a guarantee, only an absence of resistance.'],

    timing: buildTiming(spec, start, end, strong.length >= weak.length),

    lucky: spec.lucky
      ? {
          // Drawn from the chart's own lords rather than a fixed per-sign table.
          number: ((lead.lord.bhava + lead.bindus) % 9) + 1,
          colour: COLOURS[(lead.lord.degree + lead.bhava) % COLOURS.length],
          hours: luckyHours(lead.lord.bhava),
          direction: ['North', 'East', 'South', 'West'][lead.bhava % 4],
        }
      : undefined,

    source: { bhavas: spec.bhavas, grahas, dashaPath: dasha.path },

    limits: spec.personal
      ? 'Read from your own chart, so it applies to you and to nobody else. It describes conditions, not events — what happens inside them is still yours.'
      : 'Read from your moon sign rather than your full chart, so it is the broadest reading Cyklos offers. The personalised version reads the same period from your own placements.',
  }

  if (kind === 'yearly-personal') {
    base.yearly = buildYearlyEnrichment(chart, dasha, read, strong.length >= weak.length, start)
    base.overview = [
      `This year opens under ${dasha.path}.`,
      `${bhavaRef(lead.bhava)} — ${BHAVA_SIGNIFIES[lead.bhava]} — leads with ${lead.bindus} bindus (mean ${mean}), so the tone of the year is set from how you hold yourself, not from noise around you.`,
      strong.length >= weak.length
        ? 'The chart favours building something that lasts twelve months rather than chasing every opening that appears.'
        : 'The chart favours protecting what already works, and choosing fewer moves with more care.',
      `Lords in play: ${read.map((r) => r.placement.lord).join(', ')}. Read the chapters below as one arc, not twelve separate verdicts.`,
    ].join(' ')
    base.opportunities = [
      ...base.opportunities,
      'Mid-year windows favour finishing half-done work before opening new fronts.',
      'Alliances formed quietly now tend to hold longer than loud introductions.',
      'Skill you already have compounds faster than skills you only plan to learn.',
    ]
    base.watchOuts = [
      ...base.watchOuts,
      'Do not mistreat a slow quarter as failure — some months are for root, not fruit.',
      'Over-promising in the first ninety days invents pressure the later sky does not support.',
      'Compare yourself to last year, not to someone else’s highlight reel.',
    ]
    base.timing = buildYearlyTiming(start)
  }

  return base
}

function buildYearlyEnrichment(
  chart: Chart,
  dasha: DashaSummary,
  read: Array<{
    bhava: BhavaNumber
    bindus: number
    above: boolean
    placement: { lord: string }
  }>,
  favourable: boolean,
  start: Date,
): YearlyEnrichment {
  const lagna = chart.bhavas[0]?.rashi ?? 'Kanya'
  const themeWords = favourable
    ? ['Steady', 'Build', 'Choose']
    : ['Hold', 'Refine', 'Wait']
  const theme = favourable
    ? 'A year that rewards deliberate stretch'
    : 'A year that rewards careful holding'

  const q = (n: number) => {
    const d = new Date(start)
    d.setMonth(d.getMonth() + n * 3)
    return formatMonthYear(d.toISOString())
  }

  return {
    theme,
    themeWords,
    opening: `From ${lagna} lagna and the running ${dasha.path.split(' — ')[0]} mahadasha, the year asks you to measure progress in seasons, not in single weeks. What you plant early only shows its shape after the middle stretch.`,
    closing: `By the closing quarter, the question is not what you started — it is what you kept. Leave the year with fewer open loops and one clear next thread for the sky that follows.`,
    chapters: [
      {
        id: 'q1',
        title: 'Opening stretch',
        eyebrow: q(0),
        tone: 'open',
        body: `Set the frame. Clarify what this year is for — one vocation thread, one relationship thread, one money thread. ${read[0] ? `${bhavaRef(read[0].bhava)} sets the tempo; do not rush past it.` : ''} Small rituals (sleep, review, weekly money glance) matter more than big declarations.`,
      },
      {
        id: 'q2',
        title: 'Pressure and proof',
        eyebrow: q(1),
        tone: favourable ? 'push' : 'hold',
        body: favourable
          ? 'This is the strongest proof window. Commitments made here stick. Show unfinished work to people who can sharpen it. Avoid scattering attention across three new ideas when one is already warm.'
          : 'This stretch tests patience more than ambition. Protect bandwidth. Say no earlier. Finish one thing completely before inviting a second storm.',
      },
      {
        id: 'q3',
        title: 'Correction and craft',
        eyebrow: q(2),
        tone: 'hold',
        body: `Edit what the first half over-promised. ${read[1] ? `${bhavaRef(read[1].bhava)} (${BHAVA_SIGNIFIES[read[1].bhava]}) wants cleaner agreements and clearer roles.` : ''} Travel, study, and quiet recalibration land better than spectacle.`,
      },
      {
        id: 'q4',
        title: 'Harvest and handoff',
        eyebrow: q(3),
        tone: favourable ? 'push' : 'open',
        body: 'Close loops. Document what worked. Hand unfinished threads to a plan for next year rather than forcing them in December. Gratitude and tidy books beat last-minute heroics.',
      },
    ],
    lifeAreas: [
      {
        id: 'self',
        label: 'Self & vitality',
        score: Math.min(95, 55 + (read[0]?.bindus ?? 28) - 20),
        verdict: read[0]?.above ? 'Supported' : 'Needs care',
        detail:
          'Energy follows rhythm. Protect mornings for deep work; evenings for recovery. A body routine you can keep beats an ambitious one you abandon.',
      },
      {
        id: 'work',
        label: 'Work & standing',
        score: Math.min(95, 52 + (read[1]?.bindus ?? 28) - 18),
        verdict: read[1]?.above ? 'Building' : 'Steadying',
        detail:
          'Visibility comes from finished delivery, not louder presence. One signature project this year is enough. Mentors and sponsors matter more than public noise.',
      },
      {
        id: 'love',
        label: 'Love & partnership',
        score: Math.min(95, 50 + (read[2]?.bindus ?? 27) - 18),
        verdict: read[2]?.above ? 'Warming' : 'Tending',
        detail:
          'Partnership rewards clarity over intensity. Name needs early. Shared calendars and shared money talks reduce friction more than grand gestures.',
      },
      {
        id: 'wealth',
        label: 'Wealth & speech',
        score: Math.min(95, 48 + (read[3]?.bindus ?? 28) - 16),
        verdict: read[3]?.above ? 'Compounding' : 'Conserving',
        detail:
          'Income grows where skill meets consistency. Keep a simple buffer. Speak less in heated rooms; write agreements when stakes are high.',
      },
      {
        id: 'mind',
        label: 'Mind & learning',
        score: favourable ? 78 : 66,
        verdict: favourable ? 'Curious' : 'Focused',
        detail:
          'One serious study thread (language, craft, or chart literacy) compounds. Scattered courses dilute the year. Journal monthly — not daily — to see the real arc.',
      },
    ],
    months: buildYearlyMonths(start, favourable),
    practices: [
      'Once a month, review the three threads you named in the opening quarter — keep, cut, or change.',
      'Before any large yes, wait one full night. The chart favours second thoughts that arrive quietly.',
      'Give one evening a week to something that restores you without a scoreboard.',
      `When ${dasha.path.split(' — ')[0]} feels loud, return to breath and a short walk — do not negotiate with urgency.`,
      'Keep a “done” list beside the to-do list. The year looks different when you can see what already landed.',
    ],
  }
}

function buildYearlyMonths(start: Date, favourable: boolean): YearlyMonthBeat[] {
  const beats = favourable
    ? [
        'Clarify the year’s one vocation thread',
        'Quiet alliances form — listen more than pitch',
        'First proof of skill; share a draft',
        'Money review; trim what does not earn',
        'Strongest push for work that needs courage',
        'Partnership talks deepen — name needs',
        'Travel or study resets perspective',
        'Edit commitments; close soft loops',
        'Harvest early wins; document process',
        'Visibility without overexposure',
        'Gratitude and tidy books',
        'Handoff to next year — one clear thread',
      ]
    : [
        'Name what you will protect this year',
        'Reduce noise; keep three priorities only',
        'Steady craft over new launches',
        'Money: conserve and clarify',
        'Workable window — move carefully',
        'Tend partnerships; avoid ultimatums',
        'Rest and recalibrate; learn in private',
        'Cut what drains without return',
        'Finish rather than begin',
        'Quiet visibility among the right people',
        'Review the year without self-blame',
        'Plant one seed for the sky that follows',
      ]
  return beats.map((beat, i) => {
    const d = new Date(start)
    d.setMonth(d.getMonth() + i)
    const month = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    const peak = favourable ? i === 4 || i === 8 : i === 4 || i === 7
    return { month, beat, peak }
  })
}

function buildYearlyTiming(start: Date): HoroscopeTiming[] {
  const at = (months: number) => {
    const d = new Date(start)
    d.setMonth(d.getMonth() + months)
    return formatDateLong(d.toISOString())
  }
  return [
    {
      label: `${at(0)} – ${at(2)}`,
      note: 'Opening frame. Name the year’s three threads and refuse the fourth.',
      strong: false,
    },
    {
      label: `${at(3)} – ${at(5)}`,
      note: 'Proof window. Show work, tighten agreements, let results speak.',
      strong: true,
    },
    {
      label: `${at(6)} – ${at(8)}`,
      note: 'Correction stretch. Edit, study, travel lightly, repair what the push strained.',
      strong: false,
    },
    {
      label: `${at(9)} – ${at(11)}`,
      note: 'Harvest and handoff. Close loops; leave one clean thread for next year.',
      strong: true,
    },
  ]
}

function periodLabel(spec: KindSpec, start: Date, end: Date): string {
  if (spec.span === 1) {
    return formatDateLong(start.toISOString())
  }
  if (spec.span <= 31) {
    return `${formatDateLong(start.toISOString())} – ${formatDateLong(end.toISOString())}`
  }
  return `${formatMonthYear(start.toISOString())} – ${formatMonthYear(end.toISOString())}`
}

/** Sub-windows inside the period, so even a day says when it is strongest. */
function buildTiming(spec: KindSpec, start: Date, end: Date, favourable: boolean): HoroscopeTiming[] {
  if (spec.span === 1) {
    return [
      { label: 'Morning', note: 'Steadiest stretch for anything that needs concentration.', strong: favourable },
      { label: 'Afternoon', note: 'Better for conversations than for decisions.', strong: false },
      { label: 'Evening', note: favourable ? 'Good for settling something that has been open.' : 'Leave anything binding until tomorrow.', strong: favourable },
    ]
  }

  const third = (end.getTime() - start.getTime()) / 3
  const at = (n: number) => new Date(start.getTime() + third * n).toISOString()

  return [
    { label: `${formatDateLong(start.toISOString())} –`, note: 'Opening stretch. Set things up rather than conclude them.', strong: false },
    { label: `${formatDateLong(at(1))} –`, note: favourable ? 'The strongest window in this period.' : 'The most workable window, though not an easy one.', strong: favourable },
    { label: `${formatDateLong(at(2))} –`, note: 'Closing stretch. Finish rather than begin.', strong: false },
  ]
}

function luckyHours(bhava: number): string {
  const startHour = (6 + bhava) % 24
  const endHour = (startHour + 2) % 24
  const fmt = (h: number) => `${String(h % 12 === 0 ? 12 : h % 12).padStart(2, '0')}:00 ${h < 12 ? 'am' : 'pm'}`
  return `${fmt(startHour)} – ${fmt(endHour)}`
}

/** Everything the horoscope routes serve, for the nav and the router. */
export const HOROSCOPE_KINDS = Object.keys(SPECS) as HoroscopeKind[]
