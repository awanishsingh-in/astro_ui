import type { ReactNode } from 'react'
import { Logo } from '@/components/brand/Logo'
import { AvatarMenu } from '@/components/navigation/AvatarMenu'
import type { User } from '@/types/user'
import { cn } from '@/utils/cn'

export interface MobileHeaderProps {
  /** Shown in place of the logo on secondary screens. */
  title?: string
  /**
   * The bar title is normally the page's heading. Pass `'p'` where the page
   * body carries its own <h1> — a reading's question, for instance — so the
   * document never has two.
   */
  titleAs?: 'h1' | 'p'
  /** Replaces the logo / title on the left — e.g. a hamburger. */
  leading?: ReactNode
  /** Replaces the avatar when a screen needs a different trailing control. */
  action?: ReactNode
  /** Omit to render no trailing control at all. */
  user?: User
  className?: string
}

/**
 * The compact mobile bar: one thing on the left, at most one control on the
 * right. Bottom nav carries primary destinations; the avatar carries account.
 *
 * `lg:hidden` keeps it off desktop; the side nav takes over there.
 */
export function MobileHeader({
  title,
  titleAs: TitleTag = 'h1',
  leading,
  action,
  user,
  className,
}: MobileHeaderProps) {
  return (
    <header
      className={cn(
        'mobile-header sticky top-0 z-30 flex h-mobilebar shrink-0 items-center justify-between gap-3 pt-safe',
        'border-b border-border bg-surface px-3 lg:hidden',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-1">
        {leading ??
          (title ? (
            <TitleTag className="truncate px-1 text-heading font-semibold text-ink">
              {title}
            </TitleTag>
          ) : (
            <Logo size="sm" className="pl-1" />
          ))}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {action ?? (user && <AvatarMenu user={user} size="sm" />)}
      </div>
    </header>
  )
}
