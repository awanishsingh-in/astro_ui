import type { ReactNode, CSSProperties } from 'react'
import { cn } from '@/utils/cn'

export interface OrbitProps {
  /** Diameter of the track as a percentage of the system. */
  size: number
  /** Full revolution duration in seconds. */
  period: number
  /** Starting angle in degrees (0 = top). */
  start?: number
  direction?: 'cw' | 'ccw'
  /** Elliptical depth via vertical squash. */
  elliptical?: boolean
  squash?: number
  tone?: 'silver' | 'gold'
  className?: string
  children: ReactNode
}

/**
 * One orbital track. A static anchor centres the ring; only the inner spinner
 * rotates so planets stay locked to the visible path.
 */
export function Orbit({
  size,
  period,
  start = 0,
  direction = 'cw',
  elliptical = false,
  squash = 0.78,
  tone = 'silver',
  className,
  children,
}: OrbitProps) {
  const style = {
    '--orbit-size': `${size}%`,
    '--period': `${period}s`,
    '--start': start,
    '--squash': elliptical ? squash : 1,
  } as CSSProperties

  return (
    <div className={cn('orbit-anchor', className)} style={style}>
      <div
        className="orbit-spinner"
        data-direction={direction}
        data-ellipse={elliptical ? 'true' : 'false'}
      >
        <div className="orbit-ring" data-tone={tone} aria-hidden />
        <div className="orbit-planet-slot">
          <div className="orbit-planet-counter">{children}</div>
        </div>
      </div>
    </div>
  )
}
