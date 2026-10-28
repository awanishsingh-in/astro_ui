/**
 * Hindu Panchang hub — regional / tradition cards shown first on the Panchang tab.
 */

export type PanchangKindId =
  | 'hindi'
  | 'tamil'
  | 'telugu'
  | 'kannada'
  | 'malayalam'
  | 'gujarati'
  | 'marathi'
  | 'bengali'
  | 'odia'
  | 'nepali'
  | 'punjabi'

export interface PanchangHubCard {
  id: PanchangKindId
  title: string
  /** Short mark shown on the card art — English or native script. */
  mark: string
  /** Accent wash for the illustration panel. */
  accent: string
}

export const PANCHANG_HUB_CARDS: PanchangHubCard[] = [
  {
    id: 'hindi',
    title: 'Hindi Panchang',
    mark: 'पञ्चाङ्ग',
    accent: 'from-[#6E4234]/30 to-primary/15',
  },
  {
    id: 'tamil',
    title: 'Tamil Panchangam',
    mark: 'பஞ்சாங்கம்',
    accent: 'from-info/30 to-secondary/15',
  },
  {
    id: 'telugu',
    title: 'Telugu Panchangam',
    mark: 'పంచాంగం',
    accent: 'from-[#BF8466]/25 to-[#6E4234]/20',
  },
  {
    id: 'kannada',
    title: 'Kannada Panchang',
    mark: 'ಪಂಚಾಂಗ',
    accent: 'from-primary/30 to-[#6E4234]/15',
  },
  {
    id: 'malayalam',
    title: 'Malayalam Panchangam',
    mark: 'പഞ്ചാംഗം',
    accent: 'from-[#E6BC9F]/35 to-secondary/15',
  },
  {
    id: 'gujarati',
    title: 'Gujarati Panchang',
    mark: 'પંચાંગ',
    accent: 'from-[#6E4234]/30 to-[#BF8466]/15',
  },
  {
    id: 'marathi',
    title: 'Marathi Panchang',
    mark: 'पंचांग',
    accent: 'from-primary/25 to-[#6E4234]/20',
  },
  {
    id: 'bengali',
    title: 'Bengali Panjika',
    mark: 'পঞ্জিকা',
    accent: 'from-[#6E4234]/35 to-primary/15',
  },
  {
    id: 'odia',
    title: 'Odia Panji',
    mark: 'Oriya Panji',
    accent: 'from-info/30 to-[#6E4234]/15',
  },
  {
    id: 'nepali',
    title: 'Nepali Patro',
    mark: 'पात्रो',
    accent: 'from-primary/30 to-secondary/15',
  },
  {
    id: 'punjabi',
    title: 'Punjabi Panchang',
    mark: 'ਪੰਚਾਂਗ',
    accent: 'from-[#6E4234]/30 to-primary/20',
  },
]

export function parsePanchangKind(raw: string | null): PanchangKindId | null {
  if (!raw) return null
  return PANCHANG_HUB_CARDS.some((c) => c.id === raw) ? (raw as PanchangKindId) : null
}

export function panchangKindTitle(id: PanchangKindId): string {
  return PANCHANG_HUB_CARDS.find((c) => c.id === id)?.title ?? 'Hindu Panchang'
}
