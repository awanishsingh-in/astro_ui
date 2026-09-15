import { cn } from '@/utils/cn'

/**
 * The Cyklos mark from the original lockup — interlocking cycles with the
 * orange return point. Sourced from the brand PNG so geometry stays exact.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <img
      src="/brand/cyklos-mark.png"
      alt={title ?? ''}
      role={title ? undefined : 'presentation'}
      draggable={false}
      className={cn('size-6 object-contain object-center', className)}
    />
  )
}

export type BrandTone = 'light' | 'dark'

export interface WordmarkProps {
  /** Adds the "Beyond the beginning" line under the name. */
  withTagline?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** Which surface the mark sits on. Dark is the celestial lockup. */
  tone?: BrandTone
  className?: string
}

const NAME_SIZES = {
  sm: 'text-[15px] tracking-[-0.01em]',
  md: 'text-[17px] tracking-[-0.01em]',
  lg: 'text-[28px] tracking-[-0.015em]',
} as const

const TAGLINE_SIZES = {
  sm: 'text-[8px] tracking-[0.22em]',
  md: 'text-[9px] tracking-[0.24em]',
  lg: 'text-[11px] tracking-[0.28em]',
} as const

/**
 * Title-case sans wordmark, matching the original lockup — not the serif
 * uppercase treatment used earlier in the UI.
 */
export function Wordmark({
  withTagline = false,
  size = 'md',
  tone = 'light',
  className,
}: WordmarkProps) {
  const dark = tone === 'dark'
  return (
    <span className={cn('flex flex-col', className)}>
      <span
        className={cn(
          'font-sans font-bold leading-none',
          dark ? 'text-on-celestial' : 'text-ink',
          NAME_SIZES[size],
        )}
      >
        Cyklos
      </span>
      {withTagline && (
        <span
          className={cn(
            'mt-1.5 font-sans font-medium uppercase leading-none',
            dark ? 'text-on-celestial-muted' : 'text-muted',
            TAGLINE_SIZES[size],
          )}
        >
          Beyond the beginning
        </span>
      )}
    </span>
  )
}

export interface LogoProps {
  /** Stacked is the landing lockup; inline is the header lockup. */
  layout?: 'inline' | 'stacked'
  withTagline?: boolean
  size?: 'sm' | 'md' | 'lg'
  tone?: BrandTone
  className?: string
}

/** Mark + wordmark. Inline in headers, stacked on the landing screen. */
export function Logo({
  layout = 'inline',
  withTagline = false,
  size = 'md',
  tone = 'light',
  className,
}: LogoProps) {
  const markSize = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-[4.5rem] w-auto',
  }[size]

  if (layout === 'stacked') {
    return (
      <span className={cn('flex flex-col items-center gap-3', className)}>
        <LogoMark className={markSize} title="Cyklos" />
        <Wordmark withTagline={withTagline} size={size} tone={tone} className="items-center text-center" />
      </span>
    )
  }

  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className={markSize} title="Cyklos" />
      <Wordmark withTagline={withTagline} size={size} tone={tone} />
    </span>
  )
}
