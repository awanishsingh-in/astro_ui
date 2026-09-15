import { cn } from '@/utils/cn'

export interface ConstellationPatternProps {
  className?: string
  /** Draw the hairlines in on mount. */
  animate?: boolean
}

/**
 * A single constellation-like figure — points joined by hairlines.
 *
 * One fixed shape rather than a random scatter, because a constellation is
 * recognisable precisely by being the same every time. Sits at very low
 * opacity in a corner of a celestial surface.
 */
export function ConstellationPattern({ className, animate = false }: ConstellationPatternProps) {
  // A plausible asterism: a bent line with two branches, like Ursa Major.
  const points = [
    [8, 62],
    [22, 54],
    [37, 58],
    [51, 44],
    [66, 40],
    [78, 26],
    [92, 30],
  ]
  const branch = [
    [37, 58],
    [44, 76],
    [60, 82],
  ]

  const path = (pts: number[][]) =>
    pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ')

  const lineClass = animate
    ? 'motion-safe:animate-constellation-draw motion-reduce:[animation:none]'
    : undefined

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className={cn('pointer-events-none absolute inset-0 size-full', className)}
    >
      <g stroke="currentColor" strokeWidth="0.22" fill="none" opacity="0.55">
        <path
          d={path(points)}
          className={lineClass}
          style={animate ? { strokeDasharray: 220 } : undefined}
        />
        <path
          d={path(branch)}
          className={lineClass}
          style={
            animate
              ? { strokeDasharray: 120, animationDelay: '280ms' }
              : undefined
          }
        />
      </g>
      <g fill="currentColor">
        {[...points, ...branch.slice(1)].map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 3 === 0 ? 0.8 : 0.5}
            opacity="0.75"
            className={animate ? 'motion-safe:animate-twinkle' : undefined}
            style={animate ? { animationDelay: `${0.4 + i * 0.35}s` } : undefined}
          />
        ))}
      </g>
    </svg>
  )
}
