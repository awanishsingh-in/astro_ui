import { cn } from '@/utils/cn'

/**
 * Cyklos brand mark — metallic gold glyph only.
 * Sourced from the official lockup artwork (transparent PNG).
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <img
      src="/brand/cyklos-mark.png"
      alt={title ?? ''}
      role={title ? undefined : 'presentation'}
      draggable={false}
      className={cn('size-7 object-contain object-center', className)}
    />
  )
}

export type BrandTone = 'light' | 'dark'

export interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg'
  tone?: BrandTone
  className?: string
}

const NAME_SIZES = {
  sm: 'text-[15px] tracking-[-0.01em]',
  md: 'text-[17px] tracking-[-0.01em]',
  lg: 'text-[22px] tracking-[-0.015em]',
} as const

/** “Cyklos” wordmark — sits to the right of the mark. */
export function Wordmark({ size = 'md', tone = 'light', className }: WordmarkProps) {
  const dark = tone === 'dark'
  return (
    <span
      className={cn(
        'font-sans font-semibold leading-none',
        dark ? 'text-on-celestial' : 'text-ink',
        NAME_SIZES[size],
        className,
      )}
    >
      Cyklos
    </span>
  )
}

export interface LogoProps {
  layout?: 'inline' | 'stacked'
  withTagline?: boolean
  /** Show the “Cyklos” name beside the mark. Default true. */
  withWordmark?: boolean
  size?: 'sm' | 'md' | 'lg'
  tone?: BrandTone
  className?: string
}

const MARK_SIZES = {
  sm: 'size-7',
  md: 'size-9',
  lg: 'size-16',
} as const

/** Mark with “Cyklos” on the right (unless `withWordmark={false}`). */
export function Logo({
  layout = 'inline',
  withWordmark = true,
  size = 'md',
  tone = 'light',
  className,
}: LogoProps) {
  const mark = <LogoMark className={MARK_SIZES[size]} title={withWordmark ? undefined : 'Cyklos'} />
  const name = withWordmark ? <Wordmark size={size} tone={tone} /> : null

  if (layout === 'stacked') {
    return (
      <span className={cn('flex flex-col items-center gap-2', className)}>
        {mark}
        {name}
      </span>
    )
  }

  return (
    <span className={cn('inline-flex shrink-0 items-center gap-2.5', className)}>
      {mark}
      {name}
    </span>
  )
}
