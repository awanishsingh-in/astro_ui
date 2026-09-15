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
  plain: 'text-ink hover:bg-navy-soft active:bg-navy-soft',
  outline: 'text-ink border border-border bg-surface hover:border-border-strong hover:bg-navy-soft',
  filled: 'bg-navy text-on-celestial hover:bg-navy-hover active:bg-navy-active',
}

/**
 * Visual size. `hit-44` below carries the touch target up to 44px for the
 * smaller two, so the glyph can stay tight without the control being fiddly.
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
    'transition-[background-color,color,transform] duration-150 ease-out-soft',
    'active:scale-95 disabled:text-faint disabled:pointer-events-none',
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
