import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

export type IconButtonVariant = 'plain' | 'outline' | 'filled'
export type IconButtonSize = 'sm' | 'md' | 'lg'

interface BaseProps {
  /** Required — an icon alone is never self-describing to a screen reader. */
  label: string
  icon: ReactNode
  variant?: IconButtonVariant
  size?: IconButtonSize
  className?: string
  to?: string
}

export type IconButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>

const VARIANTS: Record<IconButtonVariant, string> = {
  plain: 'text-text-highlight hover:bg-surface-accent hover:text-text active:bg-surface-accent',
  outline:
    'text-text-highlight border border-border/35 bg-bg-secondary/50 hover:border-blue-glow hover:bg-blue/15',
  filled: 'bg-gold-gradient text-on-primary hover:brightness-110',
}

/**
 * Visual size. `hit-44` expands the touch target to 44px for smaller sizes.
 */
const SIZES: Record<IconButtonSize, string> = {
  sm: 'size-10 [&_svg]:size-4',
  md: 'size-11 [&_svg]:size-5',
  lg: 'size-12 [&_svg]:size-5',
}

export function IconButton({
  label,
  icon,
  variant = 'plain',
  size = 'md',
  className,
  to,
  type = 'button',
  ...rest
}: IconButtonProps) {
  const classes = cn(
    'hit-44 inline-flex shrink-0 items-center justify-center rounded-control',
    'transition-[background-color,color,transform,border-color] duration-150 ease-out-soft',
    'active:scale-[0.97] disabled:text-text-disabled disabled:pointer-events-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    VARIANTS[variant],
    SIZES[size],
    className,
  )

  if (to) {
    return (
      <Link to={to} className={classes} aria-label={label} title={label}>
        {icon}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} aria-label={label} title={label} {...rest}>
      {icon}
    </button>
  )
}
