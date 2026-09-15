import { cn } from '@/utils/cn'
import { initialsOf } from '@/utils/format'

export interface AvatarProps {
  name: string
  /** Overrides the derived monogram if the API supplies one. */
  initials?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'size-8 text-[10px]',
  md: 'size-9 text-[11px]',
  lg: 'size-12 text-data',
} as const

/**
 * A monogram, not a photograph. On mobile this is the only control in the
 * header, so it carries an accessible name of its own.
 */
export function Avatar({ name, initials, size = 'md', className }: AvatarProps) {
  const label = initials ?? initialsOf(name)
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        'bg-navy-soft border border-border font-mono font-semibold text-navy',
        SIZES[size],
        className,
      )}
      aria-hidden
    >
      {label}
    </span>
  )
}
