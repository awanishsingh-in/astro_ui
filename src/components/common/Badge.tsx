import type { ReactNode } from 'react'
import type { Tone } from '@/types/ui'
import { cn } from '@/utils/cn'

export interface BadgeProps {
  children: ReactNode
  tone?: Tone
  /** Selected chip — blue wash + blue border. */
  selected?: boolean
  /** Mono + uppercase + tracked. The product's status voice. */
  mono?: boolean
  className?: string
}

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-accent text-primary-soft border-border/30',
  navy: 'bg-surface-accent text-primary-soft border-primary/25',
  gold: 'bg-surface-accent text-primary-soft border-primary/30',
  positive: 'bg-success-soft text-success border-success/25',
  caution: 'bg-warning-soft text-warning border-warning/25',
  critical: 'bg-error-soft text-error border-error/25',
}

export function Badge({
  children,
  tone = 'neutral',
  selected = false,
  mono = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-control border px-2.5 py-1 whitespace-nowrap',
        mono ? 'font-mono text-label uppercase tracking-[0.15em]' : 'text-xs font-medium',
        selected
          ? 'bg-blue/25 text-text-highlight border-blue'
          : TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
