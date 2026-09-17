/**
 * Domain types for the chart.
 *
 * These mirror what a real Vedic ephemeris service would return, so the
 * calculation engine can be plugged in behind `src/services` without any
 * component changing shape.
 */

/** The nine grahas, by their conventional two-letter code. */
export type GrahaCode = 'Su' | 'Mo' | 'Ma' | 'Me' | 'Ve' | 'Ju' | 'Sa' | 'Ra' | 'Ke'

/** The twelve rashis in zodiacal order. */
export type RashiName =
  | 'Mesha'
  | 'Vrishabha'
  | 'Mithuna'
  | 'Karka'
  | 'Simha'
  | 'Kanya'
  | 'Tula'
  | 'Vrischika'
  | 'Dhanu'
  | 'Makara'
  | 'Kumbha'
  | 'Meena'

/** Bhava (house) number, 1–12. Kept as a number for arithmetic. */
export type BhavaNumber = number

export type Dignity = 'exalted' | 'own' | 'friendly' | 'neutral' | 'enemy' | 'debilitated' | 'none'

export type Motion = 'direct' | 'retrograde' | 'stationary' | 'node'

/** Divisional chart identifier: D-1 through D-60. */
export type VargaCode =
  | 'D1'
  | 'D2'
  | 'D3'
  | 'D4'
  | 'D7'
  | 'D9'
  | 'D10'
  | 'D12'
  | 'D16'
  | 'D20'
  | 'D24'
  | 'D27'
  | 'D30'
  | 'D40'
  | 'D45'
  | 'D60'

export interface Varga {
  code: VargaCode
  /** e.g. "Rashi", "Navamsa", "Dashamsa" */
  name: RashiName | string
  /** One line on what the varga is read for, e.g. "marriage, real strength". */
  signifies: string
  /** Whether this chart appears in the top-level rail rather than the sheet. */
  primary: boolean
}

/** The three regional chart renderings. */
export type ChartStyle = 'north' | 'south' | 'east'

export interface Nakshatra {
  name: string
  /** Pada within the nakshatra, 1–4. */
  pada: number
  /** The graha that rules it — this seeds the Vimshottari sequence. */
  lord: GrahaCode
}

/** One graha's placement in one chart. */
export interface GrahaPosition {
  graha: GrahaCode
  rashi: RashiName
  /** Longitude within the sign, in degrees. Formatted for display, never here. */
  degree: number
  /** Arc-minutes within the degree. Display is rounded; maths keeps precision. */
  minute: number
  nakshatra: Nakshatra
  bhava: BhavaNumber
  dignity: Dignity
  motion: Motion
  /**
   * A 0–100 read on how well placed the graha is. A UI heuristic combining
   * dignity, motion and the bhava's bindus — not shadbala.
   */
  strength?: number
}

/** One bhava: its cusp, its lord, and where that lord stands. */
export interface BhavaPlacement {
  bhava: BhavaNumber
  rashi: RashiName
  /** Sanskrit name of the ruling graha, e.g. "Budha". */
  lord: string
  lordCode: GrahaCode
  /** The bhava the lord itself occupies. */
  lordSitsIn: BhavaNumber
  /** Grahas standing in this bhava. */
  occupants: GrahaCode[]
  /** Short English gloss, e.g. "work and standing". */
  signifies: string
}

/** One graha's aspects, counted in whole bhavas. */
export interface Drishti {
  graha: GrahaCode
  sitsIn: BhavaNumber
  /** Bhavas this graha aspects. */
  aspects: BhavaNumber[]
  /** Which special aspects apply, e.g. ["4th", "7th", "8th"]. */
  by: string[]
}

export type DashaLevel = 'maha' | 'antar' | 'pratyantar'

export interface DashaPeriod {
  level: DashaLevel
  graha: GrahaCode
  /** Sanskrit display name, e.g. "Guru". */
  name: string
  /** ISO 8601 date. */
  start: string
  end: string
  /** True for the period running today. */
  current: boolean
  children?: DashaPeriod[]
}

/** Sarvashtakavarga: bindu count per sign, read against the mean. */
export interface AshtakavargaEntry {
  bhava: BhavaNumber
  rashi: RashiName
  bindus: number
}

export interface Ashtakavarga {
  entries: AshtakavargaEntry[]
  total: number
  mean: number
}

/**
 * Everything the app used to place the grahas. Shown verbatim in the
 * "Calculation basis" panel — nothing here is ever estimated.
 */
export interface CalculationBasis {
  ephemeris: string
  zodiac: string
  ayanamsa: string
  houseSystem: string
  nodes: string
  timeZone: string
  lmtCorrection: string
  coordinates: string
  julianDay: string
  siderealTime: string
  dashaSystem: string
  rounding: string
}

export interface Lagna {
  rashi: RashiName
  degree: number
  minute: number
}

/** A fully calculated chart for one varga. */
export interface Chart {
  varga: VargaCode
  lagna: Lagna
  grahas: GrahaPosition[]
  bhavas: BhavaPlacement[]
  drishti: Drishti[]
  ashtakavarga: Ashtakavarga
  /** Plain-language observations a reading can cite. */
  notes: string[]
}

/** The panchang line shown on Home. */
export interface Panchang {
  /** ISO date. */
  date: string
  tithi: string
  nakshatra: string
}

export type CalendarEventKind = 'festival' | 'vrat' | 'ekadashi'

/** A festival, vrat or ekadashi on a calendar day. */
export interface CalendarEvent {
  name: string
  kind: CalendarEventKind
}

/** Full panchang for one day in the Hindu calendar view. */
export interface CalendarDay extends Panchang {
  yoga: string
  karana: string
  /** Weekday — e.g. Guruvara. */
  vaar: string
  paksha: 'Shukla' | 'Krishna'
  events: CalendarEvent[]
}
