import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { CelestialBackground, type CelestialMotif } from './CelestialBackground'

interface BaseProps {
  motifs?: CelestialMotif[]
  tone?: 'midnight' | 'indigo' | 'royal'
  seed?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Adds hover affordance. Use only when the whole card is clickable. */
  interactive?: boolean
  children?: ReactNode
}

export type CelestialCardProps = BaseProps & Omit<HTMLAttributes<HTMLDivElement>, keyof BaseProps>

const PADDINGS = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5 md:p-6',
} as const

/**
 * The dark counterpart of Card — same geometry and padding scale, night sky
 * instead of ivory.
 *
 * Reserved for the moments that are genuinely about the sky: the chart panel,
 * the calculating screen, a hero. A page of these would be a different product.
 */
export function CelestialCard({
  motifs = ['stars'],
  tone = 'indigo',
  seed = 'cyklos',
  padding = 'md',
  interactive = false,
  className,
  children,
  ...rest
}: CelestialCardProps) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-card border border-celestial-line/50 shadow-card',
        interactive &&
          cn(
            'transition-[border-color,box-shadow,transform] duration-200 ease-out-soft',
            'hover:-translate-y-px hover:border-gold/40 hover:shadow-raised',
            'active:translate-y-0 active:shadow-card',
          ),
        className,
      )}
      {...rest}
    >
      <CelestialBackground
        motifs={motifs}
        tone={tone}
        seed={seed}
        className="h-full rounded-card"
        contentClassName={PADDINGS[padding]}
      >
        {children}
      </CelestialBackground>
    </div>
  )
}
