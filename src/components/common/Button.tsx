import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'gold'
  | 'danger'
  | 'celestial'
  | 'celestialGhost'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface BaseProps {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Stretch to the container — the default for the mobile sticky action area. */
  fullWidth?: boolean
  loading?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  children?: ReactNode
  className?: string
  /** Soft pulse — hero CTA only (one strong glow per viewport). */
  pulse?: boolean
}

export interface ButtonProps
  extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> {
  /** Render as a router link while keeping the button's appearance. */
  to?: string
}

/** Style A — satin rose-gold (single most important action). */
const PRIMARY = 'btn-primary'

/** Style B — dark with rose-gold rim (repeated / secondary copper actions). */
const COPPER_OUTLINE = 'btn-copper-outline'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: PRIMARY,
  gold: PRIMARY,
  celestial: PRIMARY,
  secondary: COPPER_OUTLINE,
  outline: COPPER_OUTLINE,
  ghost:
    'bg-transparent text-silver-300 hover:bg-white/[0.04] active:bg-white/[0.06] ' +
    'disabled:text-text-disabled',
  danger:
    'bg-transparent text-error border border-error/35 hover:bg-error-soft disabled:text-text-disabled',
  celestialGhost: COPPER_OUTLINE,
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-control-sm min-h-10 px-4 text-sm gap-1.5',
  md: 'h-control-md min-h-11 px-5 text-sub gap-2',
  lg: 'h-control-md min-h-12 px-6 text-body gap-2',
}

/**
 * Astrovate buttons — Style A satin rose-gold primary; Style B copper outline secondary.
 */
export function Button({
  variant = 'primary',
  size = 'lg',
  fullWidth,
  loading = false,
  iconLeft,
  iconRight,
  children,
  className,
  to,
  disabled,
  pulse = false,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center rounded-control font-semibold',
    'whitespace-nowrap',
    'transition-[background-color,border-color,color,transform,box-shadow,filter,background-position]',
    'duration-150 ease-out-soft select-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    pulse && (variant === 'primary' || variant === 'gold' || variant === 'celestial') && 'animate-gold-pulse',
    (disabled || loading) && 'pointer-events-none',
    loading && 'opacity-80',
    className,
  )

  const content = (
    <>
      {loading ? <Spinner /> : iconLeft ? <span className="relative z-[1]">{iconLeft}</span> : null}
      <span className="relative z-[1]">{children}</span>
      {iconRight ? <span className="relative z-[1]">{iconRight}</span> : null}
    </>
  )

  if (to && !disabled && !loading) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  )
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="relative z-[1] size-4 shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin"
    />
  )
}
