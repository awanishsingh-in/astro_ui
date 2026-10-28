import { buildChart } from '@/data/chart-mock'
import { NAKSHATRAS } from '@/data/nakshatras'
import type { CalculatorKind } from '@/data/calculator-hub'
import type { BirthDetails } from '@/types/user'

export interface CalculatorRemedyBlock {
  title: string
  body?: string
  items?: string[]
}

export interface CalculatorResult {
  kind: CalculatorKind
  name: string
  title: string
  /** Short status line under the icon, e.g. "Person is not Manglik." */
  statusLine: string
  verdict: string
  tone: 'clear' | 'present' | 'watch'
  summary: string
  /** Closing line for the detail card (reference-style “Hence…”). */
  conclusion: string
  detail: string
  points: string[]
  caveat: string
  remedies?: CalculatorRemedyBlock[]
  askPrompt: string
}

function seedKey(name: string, details: BirthDetails, profileId?: string) {
  return profileId ?? `${name}:${details.date}:${details.time}`
}

function hashTone(key: string): number {
  let n = 0
  for (let i = 0; i < key.length; i++) n = (n + key.charCodeAt(i) * (i + 1)) % 97
  return n
}

/** Demo calculator readings from the same chart seed Matching uses. */
export function buildCalculatorResult(
  kind: CalculatorKind,
  name: string,
  details: BirthDetails,
  profileId?: string,
): CalculatorResult {
  const label = name.trim() || 'This chart'
  const key = seedKey(name, details, profileId)
  const chart = buildChart(key, 'D1')
  const h = hashTone(key + kind)

  if (kind === 'manglik') {
    const mars = chart.grahas.find((g) => g.graha === 'Ma')
    const houses = [1, 2, 4, 7, 8, 12]
    const present = mars ? houses.includes(mars.bhava) : false
    return {
      kind,
      name: label,
      title: 'Mangal Dosha',
      statusLine: present ? 'Person is Manglik.' : 'Person is not Manglik.',
      verdict: present ? 'Manglik indicated' : 'Not Manglik',
      tone: present ? 'present' : 'clear',
      summary: present
        ? `${label} shows Mars in a classical Manglik house.`
        : `${label} does not show classical Manglik dosha.`,
      conclusion: present
        ? 'Hence Mangal Dosha is indicated in the Lagna chart from this Mars placement.'
        : 'Hence Mangal Dosha is present neither in Lagna Chart nor in Moon Chart.',
      detail: mars
        ? `Mars sits in house ${mars.bhava} (${mars.rashi}). Classical reading watches houses 1, 2, 4, 7, 8, and 12 — often called the First, Second, Fourth, Seventh, Eighth, and Twelfth.`
        : 'Mars could not be placed on this chart.',
      points: [
        mars ? `Mars · bh ${mars.bhava} · ${mars.rashi}` : 'Mars placement unavailable',
        present ? 'Partnership timing may need extra care' : 'No classical Kuja house occupied',
        'Schools differ on cancellations and exceptions',
      ],
      caveat:
        'Manglik is a house-based Mars reading. It is not a verdict on a person or a marriage.',
      remedies: [
        {
          title: 'Before marriage (needs to be performed before marriage)',
          body: 'Many traditions suggest fasting on Tuesdays, Mars mantras, and temple visits for Hanuman or Mangal before fixing a date — always with a trusted priest or astrologer.',
        },
        {
          title: 'After marriage (can be performed after marriage)',
          items: [
            'Kumbh Vivah or similar symbolic rites, where the tradition allows',
            'Charity of red lentils, jaggery, or copper on Tuesdays',
            'Calm partnership habits matter more than fear of a label',
          ],
        },
      ],
      askPrompt: `Tell me more about Manglik dosha in ${label}'s chart and what to watch in partnerships.`,
    }
  }

  if (kind === 'kaal') {
    const present = h % 3 === 0
    return {
      kind,
      name: label,
      title: 'Kaal Sarp yoga',
      statusLine: present ? 'Kaal Sarp pattern is present.' : 'No full Kaal Sarp pattern.',
      verdict: present ? 'Kaal Sarp pattern present' : 'No full Kaal Sarp',
      tone: present ? 'watch' : 'clear',
      summary: present
        ? `${label} shows grahas closed between Rahu and Ketu in this demo reading.`
        : `${label} does not show a full Kaal Sarp enclosure in this reading.`,
      conclusion: present
        ? 'Hence the Rahu–Ketu axis appears to enclose the grahas in this reading.'
        : 'Hence a full Kaal Sarp enclosure is not indicated in this reading.',
      detail:
        'Kaal Sarp is read when all planets sit on one side of the Rahu–Ketu axis. Schools name many subtypes; this calculator reports presence, not subtype.',
      points: [
        present ? 'All grahas fall inside the nodal axis' : 'At least one graha sits outside the axis',
        'Nodes mark the seam of the chart',
        'Intensity varies by which houses the nodes occupy',
      ],
      caveat: 'Demo reading. Full Kaal Sarp analysis needs the live nodal longitudes and school rules.',
      askPrompt: `Explain Kaal Sarp for ${label} and what the Rahu–Ketu axis means in this chart.`,
    }
  }

  if (kind === 'sade-sati') {
    const phase = h % 4
    const labels = ['Not in Sade Sati', 'Rising phase', 'Peak phase', 'Setting phase'] as const
    const present = phase > 0
    return {
      kind,
      name: label,
      title: 'Sade Sati',
      statusLine: present
        ? `Person is in the ${labels[phase].toLowerCase()}.`
        : 'Person is not in Sade Sati.',
      verdict: labels[phase],
      tone: present ? (phase === 2 ? 'watch' : 'present') : 'clear',
      summary: present
        ? `${label} is in the ${labels[phase].toLowerCase()} of Saturn’s Sade Sati in this demo.`
        : `${label} is outside Sade Sati in this demo transit window.`,
      conclusion: present
        ? `Hence Saturn’s Sade Sati reads as ${labels[phase].toLowerCase()} in this demo window.`
        : 'Hence Sade Sati is not active in this demo transit window.',
      detail:
        'Sade Sati is Saturn’s transit across the moon sign and the signs before and after — roughly seven and a half years. Phase matters more than a single yes/no.',
      points: [
        `Moon sign frame from the birth chart`,
        present ? `Current demo phase · ${labels[phase]}` : 'Saturn is clear of the moon triad',
        'Daily life still depends on dasha and effort',
      ],
      caveat: 'Transit dates here are illustrative. Confirm against a current ephemeris for planning.',
      askPrompt: `What should ${label} know about Sade Sati right now — timing, care, and openings?`,
    }
  }

  if (kind === 'pitra') {
    const present = h % 5 === 0 || h % 5 === 1
    return {
      kind,
      name: label,
      title: 'Pitra dosha',
      statusLine: present ? 'Pitra markers are present.' : 'No strong Pitra markers.',
      verdict: present ? 'Markers present' : 'No strong Pitra markers',
      tone: present ? 'present' : 'clear',
      summary: present
        ? `${label} shows ancestral / Pitra markers in this demo reading.`
        : `${label} does not show strong Pitra markers in this reading.`,
      conclusion: present
        ? 'Hence ancestral / Pitra markers are flagged in this demo reading.'
        : 'Hence no strong Pitra markers are indicated in this reading.',
      detail:
        'Pitra dosha is read from combinations involving the 9th house, Sun, and nodes — a reminder to honour lineage, not a curse.',
      points: [
        present ? '9th-house / Sun / node pattern flagged' : '9th-house frame looks steady',
        'Rituals and remembrance matter more than fear',
        'Ask for remedies only when the chart truly points there',
      ],
      caveat: 'Traditions disagree on exact yogas. Treat this as a starting note, not a final word.',
      askPrompt: `Does ${label}'s chart show Pitra dosha, and what would you suggest gently?`,
    }
  }

  if (kind === 'birth-time') {
    const sensitivity = 40 + (h % 50)
    const tone: CalculatorResult['tone'] =
      sensitivity > 75 ? 'watch' : sensitivity > 55 ? 'present' : 'clear'
    return {
      kind,
      name: label,
      title: 'Birth time sensitivity',
      statusLine:
        sensitivity > 70
          ? 'Chart is highly time-sensitive.'
          : sensitivity > 55
            ? 'Chart is moderately time-sensitive.'
            : 'Chart holds fairly steady nearby.',
      verdict: `Sensitivity · ${sensitivity}/100`,
      tone,
      summary: `${label}'s lagna and house cusps ${
        sensitivity > 70 ? 'shift quickly' : 'hold fairly steady'
      } when the clock moves a few minutes.`,
      conclusion: `Hence birth-time sensitivity reads about ${sensitivity}/100 in this demo.`,
      detail:
        'Birth-time rectification asks how much the rising sign and house lords change with small time edits. High sensitivity means a verified time matters more.',
      points: [
        `Demo sensitivity score · ${sensitivity}`,
        sensitivity > 70
          ? 'Lagna may flip with a small clock change'
          : 'Lagna looks relatively stable nearby',
        'Use hospital records or family memory when possible',
      ],
      caveat: 'This is a mock sensitivity score, not a full rectification of the birth time.',
      askPrompt: `Help me think about birth-time accuracy for ${label} and what to check first.`,
    }
  }

  // nakshatra
  const moon = chart.grahas.find((g) => g.graha === 'Mo')
  const nak = moon?.nakshatra
  const meta = nak ? NAKSHATRAS.find((n) => n.name === nak.name) : undefined
  return {
    kind,
    name: label,
    title: 'Moon nakshatra',
    statusLine: nak
      ? `Moon nakshatra · ${nak.name}, pada ${nak.pada}.`
      : 'Nakshatra could not be read.',
    verdict: nak ? `${nak.name} · pada ${nak.pada}` : 'Nakshatra unavailable',
    tone: 'clear',
    summary: nak
      ? `${label}'s Moon sits in ${nak.name}, pada ${nak.pada}${meta?.lord ? ` (lord ${meta.lord})` : ''}.`
      : `${label}'s Moon nakshatra could not be read from this chart.`,
    conclusion: nak
      ? `Hence the natal Moon reads from ${nak.name} (pada ${nak.pada}).`
      : 'Hence Moon nakshatra could not be placed on this chart.',
    detail:
      'The natal Moon nakshatra shapes temperament, dasha starts, and muhurat choices. Pada refines the quarter of that mansion.',
    points: [
      nak ? `Nakshatra · ${nak.name}` : 'Nakshatra missing',
      nak ? `Pada · ${nak.pada}` : 'Pada missing',
      moon ? `Moon rashi · ${moon.rashi}` : 'Moon missing',
      meta?.lord ? `Nakshatra lord · ${meta.lord}` : 'Lunar mansion from the birth Moon',
    ],
    caveat: 'Pada and lord come from the mock ephemeris used across Cyklos.',
    askPrompt: `Tell me about ${label}'s Moon nakshatra${nak ? ` (${nak.name})` : ''} and how it colours daily life.`,
  }
}
