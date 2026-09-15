import { NavLink } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { AvatarMenu } from '@/components/navigation/AvatarMenu'
import { primaryNav } from '@/routes/navigation'
import { paths } from '@/routes/paths'
import type { User } from '@/types/user'
import { cn } from '@/utils/cn'

export interface TopNavProps {
  user: User
  className?: string
}

/**
 * Desktop chrome, and deliberately minimal: the wordmark anchors the left, the
 * destinations sit to its right, and the avatar is the only account control.
 *
 * `hidden lg:block` keeps it off mobile entirely; the bottom bar takes over.
 */
export function TopNav({ user, className }: TopNavProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 hidden h-topnav shrink-0 border-b border-border bg-surface lg:block',
        className,
      )}
    >
      <div className="mx-auto flex h-full max-w-wide items-center justify-between gap-8 px-8">
        <div className="flex min-w-0 items-center gap-10">
          <NavLink to={paths.ask} aria-label="Cyklos Ask" className="rounded-xs">
            <Logo size="md" />
          </NavLink>

          <nav aria-label="Primary">
            <ul className="flex items-center gap-8">
              {primaryNav.map((item) => (
                <li key={item.id}>
                  <NavLink
                    to={item.to}
                    end={item.id === 'ask'}
                    className={({ isActive }) =>
                      cn(
                        'inline-block border-b-2 pb-1 text-sub transition-colors duration-150',
                        isActive
                          ? 'border-gold font-semibold text-ink'
                          : 'border-transparent font-medium text-purple hover:text-ink',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <AvatarMenu user={user} />
      </div>
    </header>
  )
}
