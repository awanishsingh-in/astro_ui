import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type CardTone = 'default' | 'gold' | 'sunken' | 'outline' | 'elevated' | 'plain' | 'glass'
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
  default: 'card',
  glass: 'card',
  gold: 'card card-premium',
  sunken: 'bg-[#140E1B] border border-transparent',
  outline: 'card',
  elevated: 'card',
  plain: 'bg-transparent border border-transparent',
}

const PADDINGS: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5 md:p-6',
}

/** Cosmos AI glass card — gradient, blur, optional lift on hover. */
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
        'min-w-0 rounded-card',
        TONES[tone],
        PADDINGS[padding],
        interactive &&
          cn(
            'transition-[border-color,box-shadow,transform] duration-[250ms] ease-out-soft',
            'hover:-translate-y-1 hover:border-blue-glow hover:shadow-card-hover',
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
