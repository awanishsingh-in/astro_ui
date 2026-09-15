import { cn } from '@/utils/cn'

/**
 * Occasional shooting stars across a celestial field.
 *
 * Sparse on purpose — two trails, long gaps — so it reads as night sky, not a
 * particle effect. Disabled under prefers-reduced-motion via motion-safe.
 */
export function ShootingStars({ className }: { className?: string }) {
  const meteors = [
    { top: '12%', left: '68%', delay: '0.6s', duration: '5.2s' },
    { top: '28%', left: '88%', delay: '3.4s', duration: '6.1s' },
    { top: '8%', left: '52%', delay: '7.8s', duration: '5.6s' },
  ]

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {meteors.map((meteor, i) => (
        <span
          key={i}
          className="absolute h-px w-24 origin-right motion-safe:animate-meteor"
          style={{
            top: meteor.top,
            left: meteor.left,
            animationDelay: meteor.delay,
            animationDuration: meteor.duration,
            background:
              'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-gold-soft-line) 75%, transparent) 55%, var(--color-on-celestial) 100%)',
          }}
        />
      ))}
    </div>
  )
}
