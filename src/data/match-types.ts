import {
  Heart,
  HeartHandshake,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type MatchRelationType =
  | 'partner'
  | 'friend'
  | 'father'
  | 'mother'
  | 'brother'
  | 'sister'
  | 'relative'
  | 'colleague'
  | 'other'

export interface MatchTypeOption {
  id: MatchRelationType
  label: string
  hint: string
  icon: LucideIcon
}

export const MATCH_TYPES: MatchTypeOption[] = [
  { id: 'partner', label: 'Partner', hint: 'Marriage or life partner', icon: HeartHandshake },
  { id: 'friend', label: 'Friend', hint: 'Friendship and temperament', icon: Users },
  { id: 'father', label: 'Father', hint: 'Parent · father', icon: UserRound },
  { id: 'mother', label: 'Mother', hint: 'Parent · mother', icon: UserRound },
  { id: 'brother', label: 'Brother', hint: 'Sibling · brother', icon: Users },
  { id: 'sister', label: 'Sister', hint: 'Sibling · sister', icon: Users },
  { id: 'relative', label: 'Relative', hint: 'Extended family', icon: Users },
  { id: 'colleague', label: 'Colleague', hint: 'Work and collaboration', icon: UserRound },
  { id: 'other', label: 'Other', hint: 'Any other relationship', icon: Heart },
]

export function matchTypeLabel(id: MatchRelationType): string {
  return MATCH_TYPES.find((t) => t.id === id)?.label ?? id
}
