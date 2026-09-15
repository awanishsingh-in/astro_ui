import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface EmptyStateProps {
  /** A lucide icon, sized by this component. */
  icon?: ReactNode
  title: string
  /** Say what would fill this space and how to get there. */
  description?: ReactNode
  action?: ReactNode
  /** `inline` fits inside a card; `page` centres in a full region. */
  variant?: 'page' | 'inline'
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'page',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center text-center',
        variant === 'page' ? 'gap-4 px-6 py-16' : 'gap-3 px-4 py-10',
        className,
      )}
    >
      {icon && (
        <span
          aria-hidden
          className={cn(
            'inline-flex items-center justify-center rounded-full',
            'border border-border bg-surface text-muted',
            variant === 'page' ? 'size-14 [&_svg]:size-6' : 'size-11 [&_svg]:size-5',
          )}
        >
          {icon}
        </span>
      )}
      <div className="max-w-sm space-y-1.5">
        <p className={cn('font-semibold text-ink', variant === 'page' ? 'text-heading' : 'text-sub')}>
          {title}
        </p>
        {description && <p className="text-sm text-muted text-pretty">{description}</p>}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  )
}
