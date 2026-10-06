import type { Chart } from '@/types/astrology'
import type { BirthDetails } from '@/types/user'
import { GRAHAS, GRAHA_ORDER } from '@/utils/astro'

export interface BasicKundaliDownloadInput {
  chart: Chart
  profileName: string
  birthDetails: BirthDetails
  ayanamsa?: string
}

export function buildBasicKundaliText({
  chart,
  profileName,
  birthDetails,
  ayanamsa = 'Lahiri',
}: BasicKundaliDownloadInput): string {
  const lines = [
    `Cyklos · Janam Kundli`,
    profileName,
    `${birthDetails.date} · ${birthDetails.time} · ${birthDetails.place.label}`,
    `Ayanamsa · ${ayanamsa}`,
    '',
    `Lagna · ${chart.lagna.rashi} ${chart.lagna.degree}°${String(chart.lagna.minute).padStart(2, '0')}′`,
    '',
    'Planetary positions',
    ...GRAHA_ORDER.map((code) => {
      const g = chart.grahas.find((row) => row.graha === code)
      if (!g) return `${GRAHAS[code].english} · —`
      const retro = g.motion === 'retrograde' ? ' R' : ''
      return `${GRAHAS[code].english} · ${g.rashi} ${g.degree}° · house ${g.bhava}${retro}`
    }),
    '',
    'Houses',
    ...chart.bhavas.map(
      (b) =>
        `${b.bhava}. ${b.rashi} · lord ${GRAHAS[b.lordCode].english}` +
        (b.occupants.length ? ` · ${b.occupants.map((c) => GRAHAS[c].code).join(' ')}` : ''),
    ),
  ]
  return lines.join('\n')
}

export function triggerBasicKundaliDownload(input: BasicKundaliDownloadInput): string {
  const slug = input.profileName.toLowerCase().replace(/\s+/g, '-') || 'chart'
  const filename = `cyklos-kundli-${slug}.txt`
  const blob = new Blob([buildBasicKundaliText(input)], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  return filename
}
