import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface DividerProps {
  /** Optional mono label centred in the rule, e.g. "EARLIER". */
  label?: ReactNode
  className?: string
}

export function Divider({ label, className }: DividerProps) {
  if (!label) {
    return <hr className={cn('border-0 border-t border-border', className)} />
  }
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="h-px flex-1 bg-border" />
      <span className="font-mono text-label uppercase text-muted">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}
