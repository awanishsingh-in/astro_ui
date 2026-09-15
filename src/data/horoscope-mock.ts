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
  'yearly-personal': { title: 'Your year ahead', standfirst: 'A full year read from your chart, not your sign.', span: 365, offset: 0, bhavas: [1, 10, 7, 2], personal: true },
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

  return {
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
