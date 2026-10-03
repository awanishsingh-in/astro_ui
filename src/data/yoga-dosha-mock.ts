import { isManglik, marsPlacement } from '@/data/manglik-mock'
import type { Chart, GrahaCode } from '@/types/astrology'
import { GRAHAS, RASHIS } from '@/utils/astro'

export type DoshaSeverity = 'Anshik' | 'Poorna' | 'Double'
export type DoshaStatus = 'present' | 'cancelled' | 'absent'

export interface ChartDoshaCard {
  id: string
  title: string
  status: DoshaStatus
  statusLabel: string
  severity: DoshaSeverity
  severities: DoshaSeverity[]
  rule: string
  remediesHint: string
  askPrompt: string
}

export interface ChartYogaItem {
  id: string
  name: string
  family: string
  subtitle: string
  description: string
  fromLabel: string
  fromDetail: string
  toLabel: string
  toDetail: string
  source: string
  askPrompt: string
}

export interface YogaDoshaBundle {
  doshas: ChartDoshaCard[]
  yogas: ChartYogaItem[]
  doshaPresent: number
  doshaAbsent: number
}

function rashiEnglish(name: string): string {
  return RASHIS.find((r) => r.name === name)?.english ?? name
}

function grahaIn(chart: Chart, code: GrahaCode) {
  return chart.grahas.find((g) => g.graha === code)
}

function nodesEncloseAll(chart: Chart): boolean {
  const ra = grahaIn(chart, 'Ra')
  const ke = grahaIn(chart, 'Ke')
  if (!ra || !ke) return false
  const others = chart.grahas.filter((g) => g.graha !== 'Ra' && g.graha !== 'Ke')
  // Demo: treat as present when most planets sit on one side of the axis span.
  const lo = Math.min(ra.bhava, ke.bhava)
  const hi = Math.max(ra.bhava, ke.bhava)
  const inside = others.filter((g) => g.bhava > lo && g.bhava < hi).length
  return inside >= others.length - 1
}

function buildDoshas(chart: Chart): ChartDoshaCard[] {
  const mars = marsPlacement(chart)
  const manglik = isManglik(chart)
  const manglikCancelled =
    manglik && Boolean(grahaIn(chart, 'Ju') && (grahaIn(chart, 'Ju')!.bhava === 1 || grahaIn(chart, 'Ju')!.bhava === 7))

  const kaal = nodesEncloseAll(chart)
  const moon = grahaIn(chart, 'Mo')
  const sa = grahaIn(chart, 'Sa')
  // Demo Sade Sati marker: Saturn within 1 house of Moon.
  const sade =
    moon && sa ? Math.min(Math.abs(moon.bhava - sa.bhava), 12 - Math.abs(moon.bhava - sa.bhava)) <= 1 : false

  const sun = grahaIn(chart, 'Su')
  const pitra =
    Boolean(sun && (sun.bhava === 9 || sun.bhava === 1)) ||
    Boolean(grahaIn(chart, 'Ra') && grahaIn(chart, 'Ra')!.bhava === 9)

  return [
    {
      id: 'mangal',
      title: 'Mangal dosha',
      status: manglikCancelled ? 'cancelled' : manglik ? 'present' : 'absent',
      statusLabel: manglikCancelled ? 'Cancelled' : manglik ? 'Not cancelled' : 'Not present',
      severity: manglik && mars && (mars.bhava === 7 || mars.bhava === 8) ? 'Poorna' : manglik ? 'Anshik' : 'Anshik',
      severities: ['Anshik', 'Poorna', 'Double'],
      rule: mars
        ? manglik
          ? `Mars in house ${mars.bhava} (${rashiEnglish(mars.rashi)}) — classical Kuja houses are 1, 2, 4, 7, 8, 12.`
          : `Mars in house ${mars.bhava} (${rashiEnglish(mars.rashi)}), outside the classical Manglik houses.`
        : 'Mars could not be placed on this chart.',
      remediesHint: 'Remedies',
      askPrompt: `Explain Mangal dosha in my chart${mars ? ` — Mars in house ${mars.bhava}` : ''} and any cancellations.`,
    },
    {
      id: 'kaal-sarp',
      title: 'Kaal Sarp',
      status: kaal ? 'present' : 'absent',
      statusLabel: kaal ? 'Pattern present' : 'Not present',
      severity: kaal ? 'Poorna' : 'Anshik',
      severities: ['Anshik', 'Poorna', 'Double'],
      rule: kaal
        ? 'Grahas sit largely between Rahu and Ketu — schools name many Kaal Sarp subtypes from this axis.'
        : 'Not all grahas are enclosed by the Rahu–Ketu axis in this reading.',
      remediesHint: 'Remedies',
      askPrompt: 'Does my chart show Kaal Sarp yoga, and what does the Rahu–Ketu axis mean here?',
    },
    {
      id: 'sade-sati',
      title: 'Sade Sati',
      status: sade ? 'present' : 'absent',
      statusLabel: sade ? 'In window' : 'Not present',
      severity: sade ? 'Anshik' : 'Anshik',
      severities: ['Anshik', 'Poorna', 'Double'],
      rule: sade
        ? 'Saturn is close to the Moon’s house frame in this demo — treat as a transit window to watch, not a life sentence.'
        : 'Saturn is clear of the Moon triad in this demo transit window.',
      remediesHint: 'Remedies',
      askPrompt: 'What should I know about Sade Sati from my chart — timing, care, and openings?',
    },
    {
      id: 'pitra',
      title: 'Pitra dosha',
      status: pitra ? 'present' : 'absent',
      statusLabel: pitra ? 'Markers present' : 'Not present',
      severity: pitra ? 'Anshik' : 'Anshik',
      severities: ['Anshik', 'Poorna', 'Double'],
      rule: pitra
        ? '9th-house / Sun / node markers appear — read as a call to honour lineage, not a curse.'
        : 'No strong Pitra markers on the 9th-house / Sun / node frame in this reading.',
      remediesHint: 'Remedies',
      askPrompt: 'Does my chart show Pitra dosha, and what would you suggest gently?',
    },
  ]
}

/** Viparita Raja and related yogas when dusthana lords sit in dusthanas. */
function buildYogas(chart: Chart): ChartYogaItem[] {
  const dusthana = [6, 8, 12] as const
  const yogas: ChartYogaItem[] = []

  const names: Record<number, { name: string; family: string; blurb: string }> = {
    6: {
      name: 'Harsha yoga',
      family: 'Viparita Raja yoga',
      blurb:
        'When the lord of the 6th sits in a dusthana (6, 8, or 12), tradition reads Harsha — ease after friction, and strength that grows from contests.',
    },
    8: {
      name: 'Sarala yoga',
      family: 'Viparita Raja yoga',
      blurb:
        'Lord of the 8th in a dusthana forms Sarala — clarity through upheaval, and a chart that learns by going through change rather than around it.',
    },
    12: {
      name: 'Vimala yoga',
      family: 'Viparita Raja yoga',
      blurb:
        'Lord of the 12th in a dusthana forms Vimala — spending and release that somehow clarifies the path, often through foreign or private spaces.',
    },
  }

  for (const house of dusthana) {
    const placement = chart.bhavas.find((b) => b.bhava === house)
    if (!placement) continue
    if (!(dusthana as readonly number[]).includes(placement.lordSitsIn)) continue
    const meta = names[house]!
    const lordRashi = chart.bhavas.find((b) => b.bhava === placement.lordSitsIn)?.rashi
    yogas.push({
      id: `viparita-${house}`,
      name: meta.name,
      family: meta.family,
      subtitle: `Lord of ${house} in ${placement.lordSitsIn}`,
      description: meta.blurb,
      fromLabel: `Lord of ${house}${ordinal(house)}`,
      fromDetail: `${placement.lord} (${GRAHAS[placement.lordCode].english})`,
      toLabel: `Sits in ${placement.lordSitsIn}${ordinal(placement.lordSitsIn)}`,
      toDetail: lordRashi ? rashiEnglish(lordRashi) : placement.lordSitsIn.toString(),
      source: 'Classical source · BPHS / Phaladeepika frame',
      askPrompt: `Explain ${meta.name} (${meta.family}) in my chart — lord of ${house} in house ${placement.lordSitsIn}.`,
    })
  }

  // Budha-Aditya when Sun and Mercury share a house
  const su = grahaIn(chart, 'Su')
  const me = grahaIn(chart, 'Me')
  if (su && me && su.bhava === me.bhava) {
    yogas.push({
      id: 'budha-aditya',
      name: 'Budha-Aditya yoga',
      family: 'Planetary yoga',
      subtitle: `Sun & Mercury in house ${su.bhava}`,
      description:
        'Sun and Mercury together sharpen speech, skill, and recognition — watch combustion if Mercury is too close to the Sun.',
      fromLabel: 'Sun',
      fromDetail: `${rashiEnglish(su.rashi)} · bh ${su.bhava}`,
      toLabel: 'Mercury',
      toDetail: `${rashiEnglish(me.rashi)} · same house`,
      source: 'Classical source · planetary yoga',
      askPrompt: `What does Budha-Aditya yoga mean in my chart with Sun and Mercury in house ${su.bhava}?`,
    })
  }

  // Gaja Kesari: Jupiter and Moon in mutual kendras
  const ju = grahaIn(chart, 'Ju')
  const mo = grahaIn(chart, 'Mo')
  if (ju && mo) {
    const diff = Math.abs(ju.bhava - mo.bhava)
    const kendra = diff === 0 || diff === 3 || diff === 6 || diff === 9
    if (kendra) {
      yogas.push({
        id: 'gaja-kesari',
        name: 'Gaja Kesari yoga',
        family: 'Chandra–Guru yoga',
        subtitle: `Moon & Jupiter in kendras`,
        description:
          'Moon and Jupiter in mutual angles support reputation, counsel, and steady mind — one of the most quoted classical yogas.',
        fromLabel: 'Moon',
        fromDetail: `${rashiEnglish(mo.rashi)} · bh ${mo.bhava}`,
        toLabel: 'Jupiter',
        toDetail: `${rashiEnglish(ju.rashi)} · bh ${ju.bhava}`,
        source: 'Classical source · Brihat Parashara',
        askPrompt: 'Explain Gaja Kesari yoga in my chart and how Moon and Jupiter support each other.',
      })
    }
  }

  // Ensure the list is never empty for the UI — soft Raja yoga note from lagna lord.
  if (yogas.length === 0) {
    const lagna = chart.bhavas[0]
    yogas.push({
      id: 'lagna-strength',
      name: 'Lagna lord placement',
      family: 'Chart foundation',
      subtitle: lagna
        ? `Lagna lord in house ${lagna.lordSitsIn}`
        : 'Lagna lord',
      description:
        'No classical Viparita Raja yoga fired on dusthana lords in this chart. Start from where the lagna lord sits — that is the spine of how the native meets life.',
      fromLabel: 'Lagna lord',
      fromDetail: lagna ? `${lagna.lord} (${GRAHAS[lagna.lordCode].english})` : '—',
      toLabel: lagna ? `Sits in ${lagna.lordSitsIn}${ordinal(lagna.lordSitsIn)}` : '—',
      toDetail: lagna
        ? rashiEnglish(chart.bhavas.find((b) => b.bhava === lagna.lordSitsIn)?.rashi ?? '')
        : '—',
      source: 'Reading note · not a named yoga',
      askPrompt: 'Where does my lagna lord sit, and what does that mean for how I meet the world?',
    })
  }

  return yogas
}

function ordinal(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th'
  switch (n % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

/** Dosha cards + named yogas for the Yoga & Dosha tab. */
export function buildYogaDoshaBundle(chart: Chart): YogaDoshaBundle {
  const doshas = buildDoshas(chart)
  const yogas = buildYogas(chart)
  return {
    doshas,
    yogas,
    doshaPresent: doshas.filter((d) => d.status === 'present' || d.status === 'cancelled').length,
    doshaAbsent: doshas.filter((d) => d.status === 'absent').length,
  }
}
