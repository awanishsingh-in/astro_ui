import {
  Clock,
  Flame,
  Moon,
  Orbit,
  Sparkles,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'

export type CalculatorKind =
  | 'manglik'
  | 'kaal'
  | 'sade-sati'
  | 'pitra'
  | 'birth-time'
  | 'nakshatra'

export interface CalculatorCard {
  id: CalculatorKind
  title: string
  hint: string
  icon: LucideIcon
}

/** Six calculators on the Calculator hub. */
export const CALCULATOR_CARDS: CalculatorCard[] = [
  {
    id: 'manglik',
    title: 'Manglik',
    hint: 'Mars in the classical Kuja houses',
    icon: Flame,
  },
  {
    id: 'kaal',
    title: 'Kaal Sarp',
    hint: 'Rahu–Ketu axis closing the grahas',
    icon: Orbit,
  },
  {
    id: 'sade-sati',
    title: 'Sade Sati',
    hint: 'Saturn’s seven-and-a-half year transit',
    icon: TriangleAlert,
  },
  {
    id: 'pitra',
    title: 'Pitra dosha',
    hint: 'Ancestral markers in the chart',
    icon: Sparkles,
  },
  {
    id: 'birth-time',
    title: 'Birth time',
    hint: 'How sensitive this chart is to the clock',
    icon: Clock,
  },
  {
    id: 'nakshatra',
    title: 'Nakshatra',
    hint: 'Moon’s lunar mansion and pada',
    icon: Moon,
  },
]

export function calculatorById(id: string): CalculatorCard | undefined {
  return CALCULATOR_CARDS.find((c) => c.id === id)
}

export const CALCULATOR_KINDS = CALCULATOR_CARDS.map((c) => c.id)
