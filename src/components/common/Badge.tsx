import type { ReactNode } from 'react'
import type { Tone } from '@/types/ui'
import { cn } from '@/utils/cn'

export interface BadgeProps {
  children: ReactNode
  tone?: Tone
  /** Mono + uppercase + tracked. The product's status voice. */
  mono?: boolean
  className?: string
}

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-sunken text-muted border-border',
  navy: 'bg-navy-soft text-navy border-navy/15',
  gold: 'bg-gold-soft text-gold-deep border-gold-border',
  positive: 'bg-positive-soft text-positive border-positive/20',
  caution: 'bg-caution-soft text-caution border-gold-border',
  critical: 'bg-critical-soft text-critical border-critical/20',
}

export function Badge({ children, tone = 'neutral', mono = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-xs border px-2 py-0.5 whitespace-nowrap',
        mono ? 'font-mono text-label uppercase' : 'text-xs font-medium',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
