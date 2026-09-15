import { CelestialScene, type CelestialSceneProps, placementsFromChart } from './CelestialScene'

export type PlanetaryBackdropProps = CelestialSceneProps & {
  /** @deprecated Intensity is handled by the living celestial scene. */
  intensity?: 'soft' | 'medium'
  grahas?: never
}

/**
 * Ask-area celestial backdrop. Kept as the public name used by AskPage;
 * implementation is the living PlanetarySystem inside CelestialScene.
 */
export function PlanetaryBackdrop({
  intensity: _intensity,
  grahas: _grahas,
  ...props
}: PlanetaryBackdropProps) {
  return <CelestialScene {...props} />
}

export { placementsFromChart }
