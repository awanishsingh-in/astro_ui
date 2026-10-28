import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface SectionHeaderProps {
  /** Small gold uppercase label above the title. */
  eyebrow?: string
  title: ReactNode
  /** One line of explanation. */
  description?: ReactNode
  /** Right-aligned control, e.g. a link or a small button. */
  action?: ReactNode
  as?: 'h1' | 'h2' | 'h3'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const TITLE_SIZES = {
  sm: 'font-serif text-heading',
  md: 'font-serif text-title lg:text-title-lg',
  lg: 'font-serif text-display lg:text-display-lg',
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
      <div className="min-w-0 space-y-2">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Tag className={cn('text-text-primary text-balance', TITLE_SIZES[size])}>{title}</Tag>
        {description && (
          <p className="text-body text-text-secondary text-pretty max-w-prose">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
