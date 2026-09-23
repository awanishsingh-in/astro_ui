import type { ReportId } from '@/data/reports-hub'
import type { BirthDetails } from '@/types/user'

export interface ReportChapter {
  title: string
  body: string
}

export interface PaidReportContent {
  id: ReportId
  personName: string
  title: string
  standfirst: string
  chapters: ReportChapter[]
  closing: string
}

/** Demo long-form report copy for the book view. */
export function buildPaidReport(
  id: ReportId,
  title: string,
  name: string,
  details: BirthDetails,
): PaidReportContent {
  const person = name.trim() || 'You'
  const place = details.place.label

  const sharedClose =
    'This report describes conditions from the chart, not events. What you do inside them remains yours.'

  const packs: Record<ReportId, Omit<PaidReportContent, 'id' | 'personName' | 'title'>> = {
    life: {
      standfirst: `A year-spanning life path for ${person}, born ${details.date} in ${place}.`,
      chapters: [
        {
          title: 'The opening of the path',
          body: `${person}'s chart opens with a steady first house. Early chapters favour building habits over chasing spectacle. The dasha frame asks for patience in the first third of major cycles.`,
        },
        {
          title: 'Work and standing',
          body: 'Bhava 10 and its lord reward craft that compounds. Visibility grows from finished work more than from loud introductions. Mentors appear when the craft is already warm.',
        },
        {
          title: 'Bond and kinship',
          body: 'Partnership houses ask for clarity over intensity. Name needs early. Shared calendars and shared money talks reduce friction more than grand gestures.',
        },
        {
          title: 'Closing stretch of the cycle',
          body: 'Later dashas favour harvest and handoff. Document what worked. Leave fewer open loops. The sky that follows needs one clean thread, not twelve unfinished starts.',
        },
      ],
      closing: sharedClose,
    },
    career: {
      standfirst: `Vocation and standing for ${person} — read from bh 10, its lord, and the running dasha.`,
      chapters: [
        {
          title: 'The vocation thread',
          body: `${person} does best with one signature project at a time. Scattered launches dilute the year. Skill already held compounds faster than skills only planned.`,
        },
        {
          title: 'Timing at work',
          body: 'Mid-cycle windows favour finishing half-done work. Alliances formed quietly hold longer than loud introductions. Review quarterly, not weekly.',
        },
        {
          title: 'Standing and sponsors',
          body: 'Visibility comes from delivery. Sponsors matter more than public noise. Keep a simple record of wins — the chart looks different when you can see what already landed.',
        },
      ],
      closing: sharedClose,
    },
    marriage: {
      standfirst: `Partnership notes for ${person} from bh 7, Shukra, and the supporting houses.`,
      chapters: [
        {
          title: 'The bond',
          body: 'Clarity beats intensity. Name needs before they harden into resentment. Shared ritual — a weekly walk, a money talk — steadines the house more than spectacle.',
        },
        {
          title: 'Timing',
          body: 'Stronger windows favour agreements and introductions. Weaker windows favour listening and repair. Do not force a yes when the chart asks for a pause.',
        },
        {
          title: 'Care',
          body: 'Compare this bond to last year, not to someone else’s highlight reel. Protect evenings that restore both people.',
        },
      ],
      closing: sharedClose,
    },
    finance: {
      standfirst: `Wealth and speech for ${person} — bh 2 and bh 11 against their means.`,
      chapters: [
        {
          title: 'Income',
          body: 'Money grows where skill meets consistency. A simple buffer beats an ambitious plan abandoned mid-year.',
        },
        {
          title: 'Speech and agreements',
          body: 'Write agreements when stakes are high. Speak less in heated rooms. Clarity in speech protects the second house.',
        },
        {
          title: 'Watch',
          body: 'Over-promising in the first ninety days invents pressure later months do not support. Trim what does not earn.',
        },
      ],
      closing: sharedClose,
    },
    health: {
      standfirst: `Vitality notes for ${person}. Chart conditions — not a medical diagnosis.`,
      chapters: [
        {
          title: 'Rhythm',
          body: 'Energy follows routine. Protect mornings for deep work; evenings for recovery. A body practice you can keep beats one you abandon.',
        },
        {
          title: 'Load',
          body: 'Vitality links to mental load as much as body. Name one watch-out and one opening — leave the rest.',
        },
        {
          title: 'Limits',
          body: 'This report cannot see lab results or clinical history. Seek care when the body asks. Astrology describes conditions, not prescriptions.',
        },
      ],
      closing: sharedClose,
    },
    education: {
      standfirst: `Learning and children for ${person} from the supporting houses.`,
      chapters: [
        {
          title: 'Study',
          body: 'One serious study thread compounds. Scattered courses dilute the year. Journal monthly to see the real arc.',
        },
        {
          title: 'Children and care',
          body: 'Where the chart touches children, patience and presence matter more than force. Keep rituals small and keepable.',
        },
      ],
      closing: sharedClose,
    },
    gemstone: {
      standfirst: `Stone suggestions for ${person} from chart lords — not a medical or financial prescription.`,
      chapters: [
        {
          title: 'Primary suggestion',
          body: 'A pale stone linked to the chart’s supportive lord. Wear only after personal comfort and professional advice where needed.',
        },
        {
          title: 'Secondary',
          body: 'A quieter support stone for daily rhythm. Prefer metals and settings you already trust.',
        },
        {
          title: 'Caution',
          body: 'Gemstone advice in astrology is cultural guidance. It is not a substitute for medical, financial, or jewellery expertise.',
        },
      ],
      closing: sharedClose,
    },
    numerology: {
      standfirst: `Numbers beside the chart for ${person}, drawn from name and birth date.`,
      chapters: [
        {
          title: 'Life path',
          body: `From ${details.date}, the path number favours steady craft over sudden turns.`,
        },
        {
          title: 'Name tone',
          body: `The name ${person} carries a tone that rewards clear speech and kept promises.`,
        },
        {
          title: 'Together with the chart',
          body: 'Use numbers as a second lens, not a replacement for graha and bhava.',
        },
      ],
      closing: sharedClose,
    },
  }

  const pack = packs[id]
  return {
    id,
    personName: person,
    title,
    ...pack,
  }
}
