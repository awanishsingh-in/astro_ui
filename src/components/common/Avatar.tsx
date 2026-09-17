import { cn } from '@/utils/cn'
import { initialsOf } from '@/utils/format'

export interface AvatarProps {
  name: string
  /** Overrides the derived monogram if the API supplies one. */
  initials?: string
  /** Profile photo — when set, replaces the monogram. */
  src?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZES = {
  sm: 'size-8 text-[10px]',
  md: 'size-9 text-[11px]',
  lg: 'size-12 text-data',
  xl: 'size-20 text-sub',
} as const

/**
 * Profile photo when available; otherwise a monogram.
 * On mobile this is often the only control in the header, so it carries an
 * accessible name of its own via the surrounding control.
 */
export function Avatar({ name, initials, src, size = 'md', className }: AvatarProps) {
  const label = initials ?? initialsOf(name)

  if (src) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 overflow-hidden rounded-full border border-border bg-navy-soft',
          SIZES[size],
          className,
        )}
      >
        <img src={src} alt="" className="size-full object-cover" draggable={false} />
      </span>
    )
  }

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
