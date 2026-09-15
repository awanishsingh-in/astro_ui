import { calculationBasis, todayPanchang } from '@/data/chart'
import { buildChart } from '@/data/chart-mock'
import { buildDasha, type DashaSummary } from '@/data/dasha-mock'
import { savedProfiles, type ChartProfile } from '@/data/profiles'
import { vargas } from '@/data/vargas'
import type { CalculationBasis, Chart, Panchang, Varga, VargaCode } from '@/types/astrology'
import type { BirthDetails } from '@/types/user'
import { formatArc, formatCoordinates, formatDateLong, formatTime12 } from '@/utils/format'
import { mockRequest } from './client'

/**
 * Chart reads. Endpoint paths are noted so the swap is mechanical.
 *
 * Every read is keyed by `profileId` and `varga`, which is what a real API
 * would take — so switching profile or divisional chart is already a fetch,
 * not a client-side filter.
 */

/** GET /charts/:profileId/:varga */
export function getChart(
  profileId = 'self',
  varga: VargaCode = 'D1',
  signal?: AbortSignal,
): Promise<Chart> {
  return mockRequest(() => buildChart(profileId, varga), { delay: 420, signal })
}

/** GET /charts/:profileId/dasha */
export function getDasha(
  profileId = 'self',
  birthDate = '1994-09-02',
  signal?: AbortSignal,
): Promise<DashaSummary> {
  // Vimshottari is entered at the Moon's nakshatra in the rashi chart, so it
  // is read from D-1 regardless of which varga is on screen.
  return mockRequest(() => buildDasha(buildChart(profileId, 'D1'), birthDate), {
    delay: 320,
    signal,
  })
}

/** GET /charts/vargas */
export function getVargas(signal?: AbortSignal): Promise<Varga[]> {
  return mockRequest(vargas, { delay: 160, signal })
}

/** GET /profiles */
export function getProfiles(signal?: AbortSignal): Promise<ChartProfile[]> {
  return mockRequest(savedProfiles, { delay: 200, signal })
}

/**
 * GET /charts/:profileId/basis
 *
 * Built from the profile's own birth details, so the panel reports what was
 * actually used rather than a fixed example.
 */
export function getCalculationBasis(
  details: BirthDetails,
  signal?: AbortSignal,
): Promise<CalculationBasis> {
  return mockRequest(
    () => ({
      ...calculationBasis,
      timeZone: 'IST, UTC +05:30 · India has observed no daylight saving since 1945',
      coordinates: `${formatCoordinates(details.place.latitude, details.place.longitude, 4)} · geocoded from ${details.place.label}`,
      ayanamsa: `Lahiri (Chitrapaksha) — ${formatArc(23, 46, 9)} at this moment`,
      lmtCorrection: lmtCorrection(details.place.longitude),
      rounding: details.timeUnknown
        ? 'Birth time unknown — noon assumed. The lagna and the bhava cusps are the least certain values here.'
        : calculationBasis.rounding,
    }),
    { delay: 260, signal },
  )
}

/** Local mean time against the 82.5°E Indian standard meridian. */
function lmtCorrection(longitude: number): string {
  const minutes = (longitude - 82.5) * 4
  const sign = minutes < 0 ? '−' : '+'
  const whole = Math.floor(Math.abs(minutes))
  const seconds = Math.round((Math.abs(minutes) - whole) * 60)
  return `${sign}${whole}m ${seconds}s, from ${longitude.toFixed(2)}°E against the 82.5°E standard meridian`
}

/** A one-line description of what the chart was built from. */
export function describeBirth(details: BirthDetails): string {
  return [
    formatDateLong(details.date),
    details.timeUnknown ? 'time unknown' : `${formatTime12(details.time)} IST`,
    details.place.label,
  ].join(' · ')
}

/** GET /panchang?date= */
export function getPanchang(signal?: AbortSignal): Promise<Panchang> {
  return mockRequest(todayPanchang, { delay: 200, signal })
}
