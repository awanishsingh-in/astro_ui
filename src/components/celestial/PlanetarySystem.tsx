import { useState } from 'react'
import type { GrahaCode } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { Orbit } from './Orbit'
import { Planet, type PlanetKind, type PlanetPlacement } from './Planet'
import { ZodiacOrbitRing } from './ZodiacOrbitRing'

export type ChartPlacements = Partial<Record<GrahaCode, PlanetPlacement>>

interface OrbitBody {
  id: string
  kind: PlanetKind
  graha?: GrahaCode
  size: number
  orbit: number
  period: number
  start: number
  direction?: 'cw' | 'ccw'
  elliptical?: boolean
  squash?: number
  tone?: 'silver' | 'gold'
  showGlyph?: boolean
  desktopOnly?: boolean
  depthScale?: number
  depthOpacity?: number
}

const BODIES: OrbitBody[] = [
  {
    id: 'mercury',
    kind: 'mercury',
    graha: 'Me',
    size: 9,
    orbit: 22,
    period: 18,
    start: 40,
    showGlyph: true,
    depthScale: 1.05,
    depthOpacity: 0.95,
  },
  {
    id: 'venus',
    kind: 'venus',
    graha: 'Ve',
    size: 12,
    orbit: 30,
    period: 26,
    start: 210,
    direction: 'ccw',
    tone: 'gold',
    showGlyph: true,
    depthScale: 1.02,
  },
  {
    id: 'earth',
    kind: 'earth',
    size: 13,
    orbit: 38,
    period: 34,
    start: 120,
    elliptical: true,
    squash: 0.8,
    desktopOnly: true,
    depthOpacity: 0.75,
  },
  {
    id: 'moon',
    kind: 'moon',
    graha: 'Mo',
    size: 10,
    orbit: 46,
    period: 22,
    start: 300,
    showGlyph: true,
    tone: 'gold',
    depthScale: 1.08,
    depthOpacity: 0.95,
  },
  {
    id: 'mars',
    kind: 'mars',
    graha: 'Ma',
    size: 11,
    orbit: 56,
    period: 40,
    start: 75,
    elliptical: true,
    squash: 0.76,
    showGlyph: true,
    depthScale: 1,
  },
  {
    id: 'jupiter',
    kind: 'jupiter',
    graha: 'Ju',
    size: 20,
    orbit: 68,
    period: 58,
    start: 160,
    direction: 'ccw',
    tone: 'gold',
    showGlyph: true,
    depthScale: 1.08,
    depthOpacity: 0.92,
  },
  {
    id: 'saturn',
    kind: 'saturn',
    graha: 'Sa',
    size: 16,
    orbit: 80,
    period: 78,
    start: 250,
    elliptical: true,
    squash: 0.72,
    showGlyph: true,
    depthScale: 1.1,
    depthOpacity: 0.9,
  },
  {
    id: 'uranus',
    kind: 'uranus',
    size: 14,
    orbit: 90,
    period: 96,
    start: 20,
    desktopOnly: true,
    depthScale: 0.85,
    depthOpacity: 0.55,
  },
  {
    id: 'neptune',
    kind: 'neptune',
    size: 13,
    orbit: 98,
    period: 110,
    start: 190,
    direction: 'ccw',
    desktopOnly: true,
    depthScale: 0.8,
    depthOpacity: 0.48,
  },
]

export interface PlanetarySystemProps {
  placements?: ChartPlacements
  compact?: boolean
  className?: string
}

/**
 * Sun at the centre, classical grahas on staggered orbits, outer gas giants
 * for depth. Glyphs only on chart-linked bodies.
 */
export function PlanetarySystem({ placements, compact = false, className }: PlanetarySystemProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  const bodies = compact
    ? BODIES.filter((b) => ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'moon'].includes(b.id))
    : BODIES

  return (
    <div className={cn('celestial-system', compact && 'is-compact', className)}>
      <ZodiacOrbitRing />

      {bodies.map((body) => (
        <Orbit
          key={body.id}
          size={body.orbit}
          period={body.period}
          start={body.start}
          direction={body.direction}
          elliptical={body.elliptical}
          squash={body.squash}
          tone={body.tone}
        >
          <Planet
            kind={body.kind}
            size={compact ? Math.max(8, body.size * 0.82) : body.size}
            graha={body.graha}
            showGlyph={body.showGlyph}
            placement={body.graha ? placements?.[body.graha] : undefined}
            desktopOnly={body.desktopOnly}
            depthScale={body.depthScale}
            depthOpacity={body.depthOpacity}
            tipOpen={openId === body.id}
            onTipToggle={() => setOpenId((cur) => (cur === body.id ? null : body.id))}
          />
        </Orbit>
      ))}

      <div className="sun-core">
        <Planet
          kind="sun"
          size={compact ? 22 : 28}
          graha="Su"
          showGlyph
          placement={placements?.Su}
          depthScale={1.1}
          depthOpacity={1}
          tipOpen={openId === 'sun'}
          onTipToggle={() => setOpenId((cur) => (cur === 'sun' ? null : 'sun'))}
        />
      </div>
    </div>
  )
}
