import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface BaseProps {
  children: ReactNode
  selected?: boolean
  /** Mono chips carry chart data (D-1, bh 10); sans chips carry words. */
  mono?: boolean
  size?: 'sm' | 'md'
}

export type ChipProps = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>

/**
 * A single-select token. Gold marks the selected one — the one place gold is
 * allowed to fill a surface.
 */
export function Chip({
  children,
  selected = false,
  mono = false,
  size = 'md',
  className,
  type = 'button',
  ...rest
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-control border whitespace-nowrap',
        'transition-[background-color,border-color,color,transform] duration-150 ease-out-soft',
        'active:scale-[0.97]',
        'disabled:text-faint disabled:border-border disabled:bg-surface disabled:pointer-events-none',
        mono ? 'font-mono text-data' : 'text-sm font-medium',
        size === 'sm' ? 'h-9 px-3.5' : 'h-11 px-4',
        selected
          ? 'bg-gold-soft border-gold text-gold-deep font-semibold'
          : 'bg-surface border-border text-purple hover:border-border-strong hover:bg-navy-soft',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export interface ChipGroupProps {
  children: ReactNode
  /** Scrolls horizontally on mobile. The rail bleeds to the screen edge. */
  scrollable?: boolean
  label: string
  className?: string
}

/** A horizontal rail of chips — the mobile pattern for varga and lens switching. */
export function ChipGroup({ children, scrollable = true, label, className }: ChipGroupProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'flex min-w-0 items-center gap-2',
        scrollable && 'no-scrollbar rail-bleed overflow-x-auto',
        className,
      )}
    >
      {children}
    </div>
  )
}
