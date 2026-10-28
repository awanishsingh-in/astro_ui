import { cn } from '@/utils/cn'

export interface GlowOrbProps {
  /** Blue glow (default) or soft gold — max one strong glow per viewport. */
  tone?: 'blue' | 'gold'
  size?: 'md' | 'lg' | 'xl'
  /** Slow drift; disabled under prefers-reduced-motion via CSS. */
  drift?: boolean
  className?: string
}

const SIZES = {
  md: 'h-[28vmin] w-[28vmin]',
  lg: 'h-[40vmin] w-[40vmin]',
  xl: 'h-[56vmin] w-[56vmin]',
} as const

/**
 * Large blurred glow orb behind key sections (15–30% opacity).
 */
export function GlowOrb({
  tone = 'blue',
  size = 'lg',
  drift = true,
  className,
}: GlowOrbProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute rounded-full blur-3xl',
        SIZES[size],
        tone === 'blue' ? 'bg-nebula-core/40' : 'bg-nebula-spark/25',
        drift && 'motion-safe:animate-[orb-drift_28s_ease-in-out_infinite]',
        className,
      )}
    />
  )
}
