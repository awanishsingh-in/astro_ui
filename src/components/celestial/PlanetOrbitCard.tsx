import type { HTMLAttributes, ReactNode } from 'react'
import type { GrahaCode } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { PlanetOrbit } from './PlanetOrbit'

interface BaseProps {
  /** Which grahas ride the tracks behind the content. */
  grahas?: GrahaCode[]
  /** The one marked in gold — the graha this card is about. */
  activeGraha?: GrahaCode
  tone?: 'light' | 'dark'
  /** Where the orbit sits behind the content. */
  align?: 'right' | 'left' | 'center'
  children?: ReactNode
}

export type PlanetOrbitCardProps = BaseProps & Omit<HTMLAttributes<HTMLDivElement>, keyof BaseProps>

const ALIGN = {
  right: '-right-[18%] top-1/2 -translate-y-1/2',
  left: '-left-[18%] top-1/2 -translate-y-1/2',
  center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
} as const

/**
 * A card with an orrery turning behind its content.
 *
 * For the places where a card is *about* a graha — a running dasha, a
 * planetary note — so the background is the subject rather than wallpaper.
 * The orbit sits at 12% and is clipped by the card, which is what keeps it a
 * texture instead of a picture.
 */
export function PlanetOrbitCard({
  grahas,
  activeGraha,
  tone = 'light',
  align = 'right',
  className,
  children,
  ...rest
}: PlanetOrbitCardProps) {
  const dark = tone === 'dark'

  return (
    <div
      className={cn(
        'relative isolate min-w-0 overflow-hidden rounded-card border p-4',
        dark ? 'border-celestial-line bg-indigo-deep' : 'border-gold-border bg-gold-soft',
        className,
      )}
      {...rest}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute aspect-square w-[62%] opacity-[0.12]',
          ALIGN[align],
        )}
      >
        <PlanetOrbit grahas={grahas} activeGraha={activeGraha} tone={tone} />
      </div>

      <div className="relative min-w-0">{children}</div>
    </div>
  )
}
