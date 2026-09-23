import type { BirthDetails } from '@/types/user'

export interface ChartDetailChapter {
  title: string
  body: string
}

export interface ChartDetailBook {
  personName: string
  title: string
  standfirst: string
  chapters: ChartDetailChapter[]
  closing: string
}

/** Book-style detailed kundli report after payment. */
export function buildChartDetailBook(
  name: string,
  details: BirthDetails,
  lagna?: string,
  moonNakshatra?: string,
): ChartDetailBook {
  const person = name.trim() || 'You'
  const place = details.place.label
  const lagnaLine = lagna ? ` Lagna ${lagna}.` : ''
  const starLine = moonNakshatra ? ` Birth star ${moonNakshatra}.` : ''

  return {
    personName: person,
    title: 'Detailed kundli report',
    standfirst: `A full reading of the birth chart for ${person}, born ${details.date} in ${place}.${lagnaLine}${starLine}`,
    chapters: [
      {
        title: 'The rising frame',
        body: `${person}'s lagna sets the twelve houses. The first house asks for presence before performance — how you meet the day shapes how the rest of the chart is read.`,
      },
      {
        title: 'Moon and the opening dasha',
        body: `Chandra’s nakshatra opens the Vimshottari cycle.${starLine ? ` You enter through ${moonNakshatra}.` : ''} The balance of the first mahadasha colours early habits; later periods inherit that tone.`,
      },
      {
        title: 'Work, standing, and craft',
        body: 'Bhava 10 and its lord reward finished work over loud introductions. Mentors appear when the craft is already warm. Review quarterly, not weekly.',
      },
      {
        title: 'Bond and kinship',
        body: 'Partnership houses ask for clarity over intensity. Name needs early. Shared calendars and shared money talks reduce friction more than grand gestures.',
      },
      {
        title: 'Wealth and speech',
        body: 'Money grows where skill meets consistency. A simple buffer beats an ambitious plan abandoned mid-year. Write agreements when stakes are high.',
      },
      {
        title: 'How to use this report',
        body: 'Treat each chapter as a lens, not a sentence. Revisit when a dasha shifts. What you do inside the conditions remains yours.',
      },
    ],
    closing:
      'This report describes conditions from the chart, not events. Seek care and counsel where life asks for them — astrology is a map, not a verdict.',
  }
}
