import { cn } from '@/utils/cn'

/**
 * Cyklos brand mark — metallic gold glyph only (no wordmark / tagline).
 * Sourced from the official lockup artwork.
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

export interface LogoProps {
  /** Kept for call-site compatibility; the mark is always icon-only. */
  layout?: 'inline' | 'stacked'
  withTagline?: boolean
  size?: 'sm' | 'md' | 'lg'
  tone?: BrandTone
  className?: string
}

const MARK_SIZES = {
  sm: 'size-7',
  md: 'size-9',
  lg: 'size-16',
} as const

/** Brand mark only — no “Cyklos” text or tagline. */
export function Logo({
  size = 'md',
  className,
}: LogoProps) {
  return (
    <span className={cn('inline-flex shrink-0 items-center', className)}>
      <LogoMark className={MARK_SIZES[size]} title="Cyklos" />
    </span>
  )
}

/** @deprecated Prefer Logo / LogoMark — wordmark text is not used in the UI. */
export function Wordmark(_props: {
  withTagline?: boolean
  size?: 'sm' | 'md' | 'lg'
  tone?: BrandTone
  className?: string
}) {
  return null
}
