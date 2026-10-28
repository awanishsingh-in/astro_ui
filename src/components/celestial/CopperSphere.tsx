import { cn } from '@/utils/cn'

/**
 * Satin rose-gold sphere — moon, central sun, jewellery accents.
 */
export function CopperSphere({
  className,
  size = 'md',
  bloom = true,
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  bloom?: boolean
}) {
  const dim =
    size === 'sm'
      ? 'h-8 w-8'
      : size === 'md'
        ? 'h-16 w-16'
        : size === 'lg'
          ? 'h-28 w-28'
          : 'h-44 w-44'

  return (
    <div
      aria-hidden
      className={cn('copper-sphere relative rounded-full', dim, className)}
      style={{
        background:
          'radial-gradient(circle at 32% 28%, #FBEFE6 0%, #E6BC9F 22%, #BF8466 52%, #6E4234 82%, #2A1418 100%)',
        boxShadow: bloom
          ? '0 0 80px rgba(201,145,115,0.3), 0 0 160px rgba(184,50,122,0.18), inset -8px -10px 18px rgba(42,20,24,0.55), inset 4px 6px 12px rgba(251,239,230,0.22)'
          : 'inset -6px -8px 14px rgba(42,20,24,0.5), inset 3px 4px 8px rgba(251,239,230,0.18)',
      }}
    />
  )
}
