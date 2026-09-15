import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

export type ButtonVariant =
  'primary' | 'secondary' | 'ghost' | 'gold' | 'danger' | 'celestial' | 'celestialGhost'
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
}

export interface ButtonProps
  extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> {
  /** Render as a router link while keeping the button's appearance. */
  to?: string
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-navy text-midnight hover:bg-navy-hover active:bg-navy-active active:text-warm-white disabled:bg-border-strong disabled:text-muted',
  secondary:
    'bg-surface text-ink border border-border-strong hover:bg-navy-soft hover:border-navy active:bg-navy-soft disabled:border-border disabled:text-faint',
  ghost: 'bg-transparent text-ink hover:bg-navy-soft active:bg-navy-soft disabled:text-faint',
  gold: 'bg-gold-soft text-gold-deep border border-gold-border hover:bg-gold-border/40 active:bg-gold-border/55 disabled:text-faint',
  danger:
    'bg-transparent text-critical border border-critical/35 hover:bg-critical-soft disabled:text-faint',
  /*
    Gold on midnight for full-bleed celestial screens — reads as the brand
    accent rather than a white slab on the night sky.
  */
  celestial:
    'bg-gold text-midnight hover:bg-gold-soft-line active:bg-gold-deep active:text-midnight disabled:bg-celestial-line disabled:text-on-celestial-faint focus-visible:outline-gold-soft-line',
  celestialGhost:
    'bg-transparent text-on-celestial border border-gold-soft-line/45 hover:border-gold-soft-line hover:bg-gold/10 disabled:text-on-celestial-faint focus-visible:outline-gold-soft-line',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-control-sm px-4 text-sm gap-1.5',
  md: 'h-control-md px-5 text-sub gap-2',
  lg: 'h-control-lg px-6 text-body gap-2',
}

/**
 * The product's one button. Primary is copper; gold/copper soft is reserved
 * for accent actions and never becomes the dominant colour on a screen.
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
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center rounded-control font-semibold',
    // A button label never wraps: it is a target, and a two-line target reads
    // as broken layout rather than as emphasis.
    'whitespace-nowrap',
    'transition-[background-color,border-color,color,transform,box-shadow]',
    'duration-150 ease-out-soft select-none',
    // A press should be felt, not watched: a 1% dip, no bounce.
    'active:scale-[0.985]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    (disabled || loading) && 'pointer-events-none',
    loading && 'opacity-80',
    className,
  )

  const content = (
    <>
      {loading ? <Spinner /> : iconLeft}
      {children}
      {iconRight}
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
      className="size-4 shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin"
    />
  )
}
