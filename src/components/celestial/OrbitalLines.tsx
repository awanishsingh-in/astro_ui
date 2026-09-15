import { cn } from '@/utils/cn'

export interface OrbitalLinesProps {
  /** Number of concentric tracks. */
  rings?: number
  /** Where the rings are centred, as a percentage of the box. */
  cx?: number
  cy?: number
  /** Radius of the outermost ring, as a percentage of the box width. */
  spread?: number
  className?: string
}

/**
 * Concentric orbital tracks.
 *
 * The geometry of an orrery rather than a decoration: evenly spaced circles
 * with one marker riding each track, drawn at very low opacity so they read
 * as structure behind the content.
 */
export function OrbitalLines({
  rings = 4,
  cx = 50,
  cy = 50,
  spread = 46,
  className,
}: OrbitalLinesProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className={cn('pointer-events-none absolute inset-0 size-full', className)}
    >
      {Array.from({ length: rings }, (_, i) => {
        const r = spread * ((i + 1) / rings)
        // One point per track, spaced so they never line up into a row.
        const angle = -60 + i * 47
        const rad = (angle * Math.PI) / 180
        return (
          <g key={i}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.18"
              opacity={0.42 - i * 0.06}
            />
            <circle
              cx={cx + r * Math.cos(rad)}
              cy={cy + r * Math.sin(rad)}
              r="0.55"
              fill="currentColor"
              opacity={0.6 - i * 0.08}
            />
          </g>
        )
      })}
    </svg>
  )
}
