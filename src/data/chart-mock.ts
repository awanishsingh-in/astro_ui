import type {
  Ashtakavarga,
  BhavaPlacement,
  Chart,
  Dignity,
  Drishti,
  GrahaCode,
  GrahaPosition,
  Lagna,
  RashiName,
  VargaCode,
} from '@/types/astrology'
import { BHAVA_SIGNIFIES, GRAHA_ORDER, GRAHAS, RASHIS } from '@/utils/astro'
import { DIGNITY_TABLE, NAKSHATRAS, RASHI_LORDS, SPECIAL_DRISHTI } from './nakshatras'

/**
 * A stand-in for the ephemeris.
 *
 * The *positions* here are invented, not calculated — there is no engine yet.
 * Everything downstream of them, though, is derived by the real rules:
 * nakshatra and pada from the longitude, the bhavas from the lagna, dignity
 * from the sign, and drishti from where each graha actually sits.
 *
 * That matters: it means the six sections of the dashboard always agree with
 * one another, and when a real ephemeris replaces `seedPositions` below,
 * nothing else in this file or above it changes.
 */

/** Deterministic PRNG, so a profile and varga always produce the same chart. */
function seeded(seed: string): () => number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const DEG_PER_RASHI = 30
const DEG_PER_NAKSHATRA = 360 / 27

/** Absolute sidereal longitude, 0–360, for one graha. */
interface RawPosition {
  graha: GrahaCode
  longitude: number
  retrograde: boolean
}

/** The invented part. Replaced wholesale by a real ephemeris call. */
function seedPositions(seed: string): { lagna: number; positions: RawPosition[] } {
  const rand = seeded(seed)

  const lagna = rand() * 360
  const positions: RawPosition[] = []

  // Rahu and Ketu are always exactly opposite, so one draw fixes both.
  const rahu = rand() * 360

  for (const graha of GRAHA_ORDER) {
    if (graha === 'Ra') {
      positions.push({ graha, longitude: rahu, retrograde: false })
      continue
    }
    if (graha === 'Ke') {
      positions.push({ graha, longitude: (rahu + 180) % 360, retrograde: false })
      continue
    }
    positions.push({
      graha,
      longitude: rand() * 360,
      // Surya and Chandra never retrograde; the rest do, roughly a fifth of the time.
      retrograde: graha !== 'Su' && graha !== 'Mo' && rand() < 0.2,
    })
  }

  return { lagna, positions }
}

function rashiIndexOf(longitude: number): number {
  return Math.floor(longitude / DEG_PER_RASHI) % 12
}

function rashiOf(longitude: number): RashiName {
  return RASHIS[rashiIndexOf(longitude)].name
}

/** Nakshatra and pada follow directly from the longitude. */
function nakshatraOf(longitude: number) {
  const index = Math.floor(longitude / DEG_PER_NAKSHATRA) % 27
  const within = longitude % DEG_PER_NAKSHATRA
  const pada = Math.min(4, Math.floor(within / (DEG_PER_NAKSHATRA / 4)) + 1)
  return { name: NAKSHATRAS[index].name, pada, lord: NAKSHATRAS[index].lord }
}

function dignityOf(graha: GrahaCode, rashi: number): Dignity {
  const table = DIGNITY_TABLE[graha]
  if (graha === 'Ra' || graha === 'Ke') return 'none'
  if (table.exalted === rashi) return 'exalted'
  if (table.debilitated === rashi) return 'debilitated'
  if (table.own.includes(rashi)) return 'own'

  // A rough friend/enemy read: the sign's lord being a natural benefic reads
  // friendly, a malefic enemy. Good enough to colour a column honestly.
  const lord = RASHI_LORDS[rashi]
  if (lord === graha) return 'own'
  return GRAHAS[lord].nature === 'benefic' ? 'friendly' : 'neutral'
}

/** Whole-sign bhava: the house a longitude falls in, counted from the lagna. */
function bhavaOf(longitude: number, lagnaRashi: number): number {
  return ((rashiIndexOf(longitude) - lagnaRashi + 12) % 12) + 1
}

/**
 * A 0–100 strength read, combining dignity, motion and the bhava's own
 * bindus. A heuristic for the UI's strength column — not shadbala.
 */
function strengthOf(dignity: Dignity, retrograde: boolean, bindus: number): number {
  const base: Record<Dignity, number> = {
    exalted: 88,
    own: 78,
    friendly: 62,
    neutral: 52,
    enemy: 38,
    debilitated: 26,
    none: 50,
  }
  const fromBindus = (bindus - 28) * 1.6
  const fromMotion = retrograde ? -6 : 0
  return Math.max(4, Math.min(99, Math.round(base[dignity] + fromBindus + fromMotion)))
}

/** Sarvashtakavarga bindus. Seeded, not computed from the eight contributors. */
function buildAshtakavarga(seed: string, lagnaRashi: number): Ashtakavarga {
  const rand = seeded(`${seed}:sav`)
  const entries = Array.from({ length: 12 }, (_, i) => {
    const bhava = i + 1
    const rashi = RASHIS[(lagnaRashi + i) % 12].name
    // Real SAV totals cluster between 22 and 34.
    const bindus = 22 + Math.floor(rand() * 13)
    return { bhava, rashi, bindus }
  })
  const total = entries.reduce((sum, e) => sum + e.bindus, 0)
  return { entries, total, mean: Math.round((total / 12) * 10) / 10 }
}

/** Every graha aspects the seventh from itself; three add their own. */
function buildDrishti(grahas: GrahaPosition[]): Drishti[] {
  return grahas.map((g) => {
    const offsets = [7, ...(SPECIAL_DRISHTI[g.graha] ?? [])].sort((a, b) => a - b)
    return {
      graha: g.graha,
      sitsIn: g.bhava,
      aspects: offsets.map((o) => (((g.bhava - 1 + o - 1) % 12) + 1)),
      by: offsets.map(ordinal),
    }
  })
}

function ordinal(n: number): string {
  const suffix = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'
  return `${n}${suffix}`
}

function buildBhavas(lagnaRashi: number, grahas: GrahaPosition[]): BhavaPlacement[] {
  return Array.from({ length: 12 }, (_, i) => {
    const bhava = i + 1
    const rashiIndex = (lagnaRashi + i) % 12
    const lordCode = RASHI_LORDS[rashiIndex]
    const lordPosition = grahas.find((g) => g.graha === lordCode)

    return {
      bhava,
      rashi: RASHIS[rashiIndex].name,
      lord: GRAHAS[lordCode].name,
      lordCode,
      lordSitsIn: lordPosition?.bhava ?? bhava,
      occupants: grahas.filter((g) => g.bhava === bhava).map((g) => g.graha),
      signifies: BHAVA_SIGNIFIES[bhava],
    }
  })
}

function buildNotes(grahas: GrahaPosition[], bhavas: BhavaPlacement[], sav: Ashtakavarga): string[] {
  const notes: string[] = []

  const own = grahas.filter((g) => g.dignity === 'own' || g.dignity === 'exalted')
  if (own.length >= 2) {
    notes.push(
      `${own.map((g) => GRAHAS[g.graha].name).join(', ')} sit in their own or exalted sign — that part of the chart carries itself.`,
    )
  }

  const weak = grahas.filter((g) => g.dignity === 'debilitated')
  if (weak.length > 0) {
    notes.push(
      `${weak.map((g) => GRAHAS[g.graha].name).join(' and ')} ${weak.length === 1 ? 'is' : 'are'} debilitated. What ${weak.length === 1 ? 'it governs costs' : 'they govern cost'} more effort here than the rest of the chart suggests.`,
    )
  }

  const retro = grahas.filter((g) => g.motion === 'retrograde')
  if (retro.length > 0) {
    notes.push(
      `${retro.map((g) => GRAHAS[g.graha].name).join(', ')} retrograde — those themes return rather than resolve first time.`,
    )
  }

  const strongest = sav.entries.reduce((best, e) => (e.bindus > best.bindus ? e : best))
  notes.push(
    `Bhava ${strongest.bhava} carries ${strongest.bindus} bindus against a mean of ${sav.mean} — ${BHAVA_SIGNIFIES[strongest.bhava]} is where this chart supports what is tried.`,
  )

  const lagnaLord = bhavas[0]
  if (lagnaLord.lordSitsIn === 1) {
    notes.push(
      `${lagnaLord.lord} rules the lagna and stands in it — the chart is self-directed rather than carried by others.`,
    )
  }

  return notes
}

/**
 * Build a complete, internally consistent chart for one profile and varga.
 *
 * Seeding on `profileId:varga` means D-9 genuinely differs from D-1 and each
 * saved profile has its own chart, while both stay stable across reloads.
 */
export function buildChart(profileId: string, varga: VargaCode): Chart {
  const seed = `${profileId}:${varga}`
  const { lagna: lagnaLongitude, positions } = seedPositions(seed)

  const lagnaRashi = rashiIndexOf(lagnaLongitude)
  const sav = buildAshtakavarga(seed, lagnaRashi)
  const bindusByBhava = new Map(sav.entries.map((e) => [e.bhava, e.bindus]))

  const grahas: GrahaPosition[] = positions.map((p) => {
    const rashi = rashiIndexOf(p.longitude)
    const bhava = bhavaOf(p.longitude, lagnaRashi)
    const dignity = dignityOf(p.graha, rashi)
    const degree = Math.floor(p.longitude % DEG_PER_RASHI)
    const minute = Math.floor(((p.longitude % DEG_PER_RASHI) - degree) * 60)

    return {
      graha: p.graha,
      rashi: RASHIS[rashi].name,
      degree,
      minute,
      nakshatra: nakshatraOf(p.longitude),
      bhava,
      dignity,
      motion: p.graha === 'Ra' || p.graha === 'Ke' ? 'node' : p.retrograde ? 'retrograde' : 'direct',
      strength: strengthOf(dignity, p.retrograde, bindusByBhava.get(bhava) ?? 28),
    }
  })

  const bhavas = buildBhavas(lagnaRashi, grahas)
  const lagnaDegree = Math.floor(lagnaLongitude % DEG_PER_RASHI)

  const lagna: Lagna = {
    rashi: rashiOf(lagnaLongitude),
    degree: lagnaDegree,
    minute: Math.floor(((lagnaLongitude % DEG_PER_RASHI) - lagnaDegree) * 60),
  }

  return {
    varga,
    lagna,
    grahas,
    bhavas,
    drishti: buildDrishti(grahas),
    ashtakavarga: sav,
    notes: buildNotes(grahas, bhavas, sav),
  }
}

/** The Moon's nakshatra lord — where the Vimshottari sequence is entered. */
export function moonNakshatra(chart: Chart) {
  const moon = chart.grahas.find((g) => g.graha === 'Mo')
  return moon?.nakshatra ?? { name: NAKSHATRAS[0].name, pada: 1, lord: 'Ke' as GrahaCode }
}
