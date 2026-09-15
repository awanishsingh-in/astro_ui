import { cn } from '@/utils/cn'
import { Skeleton, SkeletonText } from './Skeleton'

export interface LoadingStateProps {
  /** What is being calculated. The product names the work; it never just spins. */
  label?: string
  /** `skeleton` mirrors the content shape; `calculating` is the chart-work state. */
  variant?: 'skeleton' | 'calculating' | 'inline'
  lines?: number
  className?: string
}

export function LoadingState({
  label = 'Loading…',
  variant = 'skeleton',
  lines = 3,
  className,
}: LoadingStateProps) {
  if (variant === 'inline') {
    return (
      <span
        role="status"
        aria-live="polite"
        className={cn('inline-flex items-center gap-2.5 text-sm text-muted', className)}
      >
        <OrbitMark />
        {label}
      </span>
    )
  }

  if (variant === 'calculating') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn('flex flex-col items-center justify-center gap-5 py-16 text-center', className)}
      >
        <OrbitMark size={40} />
        <div className="space-y-1.5">
          <p className="text-body text-ink">{label}</p>
          <p className="font-mono text-label uppercase text-muted">
            Ephemeris · Lahiri ayanamsa
          </p>
        </div>
      </div>
    )
  }

  return (
    <div role="status" aria-busy aria-label={label} className={cn('space-y-4', className)}>
      <Skeleton className="h-4 w-40" />
      <SkeletonText lines={lines} />
      <span className="sr-only">{label}</span>
    </div>
  )
}

/**
 * The calculating mark: a ring with one orbiting point. Restrained motion, and
 * it stops entirely under `prefers-reduced-motion` via the global base rule.
 */
function OrbitMark({ size = 20 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="relative inline-block shrink-0"
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-0 rounded-full border border-gold-border" />
      <span className="absolute inset-0 animate-orbit">
        <span
          className="absolute left-1/2 top-0 block -translate-x-1/2 rounded-full bg-gold"
          style={{ width: size / 5, height: size / 5 }}
        />
      </span>
    </span>
  )
}
