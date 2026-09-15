import type { CSSProperties } from 'react'
import { cn } from '@/utils/cn'
import type { GrahaCode } from '@/types/astrology'
import { GRAHAS } from '@/utils/astro'

export type PlanetKind =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'moon'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'

export interface PlanetPlacement {
  rashi: string
  degree: number
  minute: number
}

export interface PlanetProps {
  kind: PlanetKind
  /** Pixel diameter of the sphere (rings extend beyond for Saturn). */
  size: number
  /** Optional Vedic graha for glyph + chart tip. */
  graha?: GrahaCode
  showGlyph?: boolean
  placement?: PlanetPlacement
  /** Hide on small screens to keep the mobile field quiet. */
  desktopOnly?: boolean
  depthScale?: number
  depthOpacity?: number
  className?: string
  /** Controlled tip for mobile tap. */
  tipOpen?: boolean
  onTipToggle?: () => void
}

const KIND_CLASS: Record<PlanetKind, string> = {
  sun: 'planet-sun',
  mercury: 'planet-mercury',
  venus: 'planet-venus',
  earth: 'planet-earth',
  moon: 'planet-moon',
  mars: 'planet-mars',
  jupiter: 'planet-jupiter',
  saturn: 'planet-saturn',
  uranus: 'planet-uranus',
  neptune: 'planet-neptune',
}

/**
 * Stylised astronomical body — gradients and rings, never emoji or flat icons.
 */
export function Planet({
  kind,
  size,
  graha,
  showGlyph = false,
  placement,
  desktopOnly = false,
  depthScale = 1,
  depthOpacity = 0.9,
  className,
  tipOpen,
  onTipToggle,
}: PlanetProps) {
  const label = graha ? GRAHAS[graha].english.toUpperCase() : kind.toUpperCase()
  const glyph = graha ? GRAHAS[graha].glyph : undefined
  const hasTip = Boolean(placement && graha)

  return (
    <button
      type="button"
      className={cn('planet-hit group/planet', desktopOnly && 'planet-desktop-only', className)}
      style={
        {
          '--depth-scale': depthScale,
          '--depth-opacity': depthOpacity,
          width: size + (kind === 'saturn' ? size * 0.6 : 8),
          height: size + (kind === 'saturn' ? size * 0.35 : 8),
        } as CSSProperties
      }
      aria-label={
        placement && graha
          ? `${GRAHAS[graha].english}, ${placement.degree}°${String(placement.minute).padStart(2, '0')}', ${placement.rashi}`
          : label
      }
      onClick={(event) => {
        if (!hasTip || !onTipToggle) return
        event.stopPropagation()
        onTipToggle()
      }}
    >
      {kind === 'saturn' ? (
        <span className="planet-saturn-wrap" style={{ width: size, height: size }}>
          <span className="planet-saturn-rings" aria-hidden />
          <span
            className={cn('planet-body', KIND_CLASS.saturn)}
            style={{ width: size, height: size }}
          />
        </span>
      ) : (
        <span
          className={cn('planet-body', KIND_CLASS[kind])}
          style={{ width: size, height: size }}
        />
      )}

      {showGlyph && glyph && (
        <span className="planet-glyph" aria-hidden>
          {glyph}
        </span>
      )}

      {hasTip && placement && (
        <span
          className={cn(
            'planet-tip',
            tipOpen ? 'opacity-100' : 'opacity-0 group-hover/planet:opacity-100',
            'transition-opacity duration-200',
          )}
          aria-hidden={!tipOpen}
        >
          <span className="planet-tip-name">
            {glyph} {label}
          </span>
          <span className="planet-tip-deg">
            {placement.degree}°{String(Math.round(placement.minute)).padStart(2, '0')}'
          </span>
          <span className="planet-tip-rashi">{placement.rashi}</span>
        </span>
      )}
    </button>
  )
}
