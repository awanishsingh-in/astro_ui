import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type CardTone = 'default' | 'gold' | 'sunken' | 'outline' | 'elevated' | 'plain'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

interface BaseProps {
  tone?: CardTone
  padding?: CardPadding
  /** Adds hover affordance. Use only when the whole card is clickable. */
  interactive?: boolean
  children?: ReactNode
}

export type CardProps = BaseProps & Omit<HTMLAttributes<HTMLDivElement>, keyof BaseProps>

const TONES: Record<CardTone, string> = {
  default: 'bg-surface border border-border shadow-card',
  gold: 'bg-gold-soft border border-gold-border',
  sunken: 'bg-surface-sunken border border-transparent',
  /** No shadow — for cards inside an already-elevated surface. */
  outline: 'bg-surface border border-border',
  /** The one lifted surface, for a panel that floats above the page. */
  elevated: 'bg-surface border border-border shadow-raised',
  plain: 'bg-transparent border border-transparent',
}

const PADDINGS: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5 md:p-6',
}

/** The surface everything sits on. One border, one subtle shadow, no glass. */
export function Card({
  tone = 'default',
  padding = 'md',
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        // `min-w-0` matters: as a grid or flex item a card defaults to
        // min-width:auto, so a scroll rail or an SVG inside it would push the
        // whole page wider instead of scrolling within the card.
        'min-w-0 rounded-card',
        TONES[tone],
        PADDINGS[padding],
        interactive &&
          cn(
            'transition-[border-color,box-shadow,transform] duration-200 ease-out-soft',
            'hover:-translate-y-px hover:border-border-strong hover:shadow-raised',
            'active:translate-y-0 active:shadow-card',
          ),
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
