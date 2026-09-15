import { useMemo } from 'react'
import type { GrahaCode } from '@/types/astrology'
import { useTheme } from '@/theme/ThemeProvider'
import { cn } from '@/utils/cn'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { StarField } from './StarField'
import { PlanetarySystem, type ChartPlacements } from './PlanetarySystem'
import './celestial-scene.css'

export interface CelestialSceneProps {
  placements?: ChartPlacements
  /** Composer focus — orbits brighten and slow slightly. */
  attentive?: boolean
  /** Normalised pointer offset from centre, roughly −0.5…0.5. */
  parallax?: { x: number; y: number }
  className?: string
  starSeed?: string
}

/**
 * Background celestial layer for Ask: stars + living planetary system.
 * Dark mode only — light mode stays a clean canvas.
 */
export function CelestialScene({
  placements,
  attentive = false,
  parallax = { x: 0, y: 0 },
  className,
  starSeed = 'ask-celestial',
}: CelestialSceneProps) {
  const desktop = useIsDesktop()
  const { resolved } = useTheme()

  const starsStyle = useMemo(
    () => ({ transform: `translate3d(${parallax.x * 3}px, ${parallax.y * 2}px, 0)` }),
    [parallax.x, parallax.y],
  )
  const systemStyle = useMemo(
    () => ({ transform: `translate3d(${parallax.x * 9}px, ${parallax.y * 6}px, 0)` }),
    [parallax.x, parallax.y],
  )

  if (resolved === 'light') return null

  return (
    <div
      aria-hidden
      className={cn('celestial-scene absolute inset-0 overflow-hidden', className)}
      data-attentive={attentive ? 'true' : 'false'}
    >
      <div className="celestial-parallax absolute inset-0" style={starsStyle}>
        <StarField seed={starSeed} count={desktop ? 64 : 40} className="opacity-[0.28]" />
      </div>

      <div className="celestial-parallax absolute inset-0" style={systemStyle}>
        <PlanetarySystem placements={placements} compact={!desktop} />
      </div>
    </div>
  )
}

export function placementsFromChart(
  grahas: { graha: GrahaCode; rashi: string; degree: number; minute: number }[],
): ChartPlacements {
  const map: ChartPlacements = {}
  for (const g of grahas) {
    map[g.graha] = { rashi: g.rashi, degree: g.degree, minute: g.minute }
  }
  return map
}
