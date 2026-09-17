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
  default:
    'bg-surface/90 border border-border/90 shadow-card backdrop-blur-[2px] [background-image:linear-gradient(165deg,rgba(92,71,80,0.22)_0%,transparent_42%)]',
  gold: 'bg-gold-soft border border-copper/35 shadow-card [box-shadow:0_0_28px_-12px_rgba(220,132,79,0.35)]',
  sunken: 'bg-surface-sunken/80 border border-transparent',
  outline: 'bg-surface/80 border border-border',
  elevated:
    'bg-surface-raised/95 border border-muted-plum/50 shadow-raised backdrop-blur-sm',
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
