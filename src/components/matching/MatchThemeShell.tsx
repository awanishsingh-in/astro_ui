import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

/**
 * Layout wrapper for Matching pages — keeps structure consistent
 * without remapping adventure blue tokens.
 */
export function MatchThemeShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('min-h-full', className)}>{children}</div>
}
