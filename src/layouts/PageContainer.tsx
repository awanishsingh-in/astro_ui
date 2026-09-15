import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface PageContainerProps {
  children: ReactNode
  /** `reading` is the 760px answer column; `wide` is the chart dashboard. */
  width?: 'reading' | 'content' | 'wide' | 'full'
  /** Remove the default vertical padding when a page manages its own. */
  flush?: boolean
  className?: string
}

const WIDTHS = {
  reading: 'max-w-reading',
  content: 'max-w-content',
  wide: 'max-w-wide',
  full: 'max-w-none',
} as const

/**
 * The one place page gutters and max widths are decided. Mobile uses a 20px
 * gutter (matching the reference artboards); desktop widens to 32px.
 */
export function PageContainer({
  children,
  width = 'content',
  flush = false,
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-5 md:px-6 lg:px-8',
        WIDTHS[width],
        !flush && 'py-6 lg:py-10',
        className,
      )}
    >
      {children}
    </div>
  )
}
