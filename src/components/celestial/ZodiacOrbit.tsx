import { cn } from '@/utils/cn'
import type { GrahaCode, RashiName } from '@/types/astrology'
import { PlanetOrbit } from './PlanetOrbit'
import { ZodiacRing } from './ZodiacRing'

export interface ZodiacOrbitProps {
  /** Highlight one rashi on the ring, 1-based from Mesha. */
  activeRashi?: number
  /** Highlight one graha on the tracks. */
  activeGraha?: GrahaCode
  tone?: 'light' | 'dark'
  animate?: boolean
  /** Faster zodiac drift on heroes. */
  pace?: 'calm' | 'hero'
  className?: string
  /** Named for screen readers — the figure itself is decorative geometry. */
  label?: string
  /** Optional caption rendered at the centre, e.g. the lagna. */
  center?: RashiName
}

/**
 * The full figure: the zodiac ring with the planetary system turning inside
 * it, the ring drifting one way and the tracks the other.
 *
 * This is the product's signature image — the cosmos as a measured instrument.
 * Used on the landing hero and the calculating screen, never as wallpaper.
 */
export function ZodiacOrbit({
  activeRashi,
  activeGraha,
  tone = 'dark',
  animate = true,
  pace = 'calm',
  className,
  label,
}: ZodiacOrbitProps) {
  return (
    <div
      className={cn('relative aspect-square w-full', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <ZodiacRing
        tone={tone}
        activeRashi={activeRashi}
        ticks
        spin={animate}
        pace={pace}
        className="absolute inset-0"
      />
      <div className="absolute inset-[16%]">
        <PlanetOrbit tone={tone} activeGraha={activeGraha} animate={animate} />
      </div>
    </div>
  )
}
