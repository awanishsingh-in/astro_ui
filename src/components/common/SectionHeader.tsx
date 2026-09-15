import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface SectionHeaderProps {
  /** Small mono label above the title, e.g. "RUNNING DASHA". */
  eyebrow?: string
  title: ReactNode
  /** One line of explanation. The product explains itself rather than decorating. */
  description?: ReactNode
  /** Right-aligned control, e.g. a link or a small button. */
  action?: ReactNode
  as?: 'h1' | 'h2' | 'h3'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const TITLE_SIZES = {
  sm: 'text-heading',
  md: 'text-title',
  lg: 'text-title lg:text-title-lg',
} as const

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  as: Tag = 'h2',
  size = 'md',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0 space-y-1.5">
        {eyebrow && <p className="font-mono text-label uppercase text-muted">{eyebrow}</p>}
        <Tag className={cn('text-ink text-balance', TITLE_SIZES[size])}>{title}</Tag>
        {description && <p className="text-sub text-muted text-pretty">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
