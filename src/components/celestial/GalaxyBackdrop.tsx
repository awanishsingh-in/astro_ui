import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import Galaxy from './Galaxy'

export interface GalaxyBackdropProps {
  children?: ReactNode
  className?: string
  contentClassName?: string
  /**
   * `full` — calculating / hero moments
   * `soft` — content screens with light sky
   * `quiet` — editorial screens; stars support, never compete
   */
  intensity?: 'full' | 'soft' | 'quiet'
}

/**
 * Full-bleed animated starfield with brand wash — shared by calculating and
 * know-your-past so those night screens feel like one continuous sky.
 */
export function GalaxyBackdrop({
  children,
  className,
  contentClassName,
  intensity = 'full',
}: GalaxyBackdropProps) {
  const soft = intensity === 'soft'
  const quiet = intensity === 'quiet'
  const muted = soft || quiet

  return (
    <div
      className={cn(
        'relative isolate overflow-hidden bg-midnight',
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          'absolute inset-0',
          muted && 'pointer-events-none',
          quiet && 'opacity-[0.28]',
          soft && 'opacity-[0.55]',
        )}
      >
        <Galaxy
          mouseRepulsion={!muted}
          mouseInteraction={!muted}
          density={quiet ? 0.55 : soft ? 0.85 : 1.1}
          glowIntensity={quiet ? 0.1 : soft ? 0.2 : 0.28}
          saturation={0}
          hueShift={220}
          twinkleIntensity={quiet ? 0.12 : soft ? 0.28 : 0.4}
          rotationSpeed={quiet ? 0.02 : soft ? 0.045 : 0.08}
          repulsionStrength={2}
          autoCenterRepulsion={0}
          starSpeed={quiet ? 0.25 : soft ? 0.4 : 0.55}
          speed={quiet ? 0.4 : soft ? 0.6 : 0.85}
          transparent={false}
        />
      </div>

      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0',
          quiet ? 'opacity-55' : soft ? 'opacity-40 mix-blend-soft-light' : 'opacity-50 mix-blend-soft-light',
        )}
        style={{
          background: quiet
            ? 'radial-gradient(90% 70% at 50% 0%, rgba(42, 36, 96, 0.45) 0%, transparent 58%), radial-gradient(70% 55% at 80% 80%, rgba(20, 18, 46, 0.5) 0%, transparent 60%)'
            : 'radial-gradient(120% 90% at 18% 0%, var(--color-indigo-royal) 0%, transparent 62%)',
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: quiet
            ? 'radial-gradient(ellipse 65% 50% at 50% 28%, rgba(8, 7, 17, 0.55) 0%, transparent 70%)'
            : soft
              ? 'radial-gradient(ellipse 70% 60% at 50% 35%, color-mix(in srgb, var(--color-midnight) 48%, transparent) 0%, transparent 72%)'
              : 'radial-gradient(ellipse 48% 50% at 50% 40%, color-mix(in srgb, var(--color-midnight) 55%, transparent) 0%, transparent 68%)',
        }}
      />

      {children !== undefined && (
        <div className={cn('relative z-10', contentClassName)}>{children}</div>
      )}
    </div>
  )
}
