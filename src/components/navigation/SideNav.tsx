import { History, MessageCircleHeart, MessageCirclePlus, Telescope } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { AvatarMenu } from '@/components/navigation/AvatarMenu'
import { ThemeQuickToggle } from '@/components/account/ThemeQuickToggle'
import { primaryProductFeatures } from '@/data/features'
import { paths } from '@/routes/paths'
import type { User } from '@/types/user'
import { cn } from '@/utils/cn'

export interface SideNavProps {
  user: User
  className?: string
}

function featureHref(to: string | undefined, slug: string) {
  return to ?? paths.explore(slug)
}

function isFeatureActive(pathname: string, to: string | undefined, slug: string): boolean {
  const href = featureHref(to, slug)
  if (pathname === href || pathname.startsWith(`${href}/`)) return true

  if (slug === 'kundli') {
    return pathname === paths.chart || pathname.startsWith(`${paths.chart}/`)
  }
  if (slug === 'matching') {
    return pathname === paths.matching || pathname.startsWith(`${paths.matching}/`)
  }
  if (slug === 'kundli-matching-profiles') {
    return pathname === paths.compatibility || pathname.startsWith(`${paths.compatibility}/`)
  }
  if (slug === 'horoscope') {
    return pathname.startsWith('/horoscope')
  }
  return pathname === paths.explore(slug)
}

/**
 * Desktop primary navigation — Ask on top, all eight product features below.
 */
export function SideNav({ user, className }: SideNavProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const onAskSection =
    location.pathname === paths.ask || location.pathname.startsWith(`${paths.ask}/`)

  return (
    <aside
      className={cn(
        'sticky top-0 z-30 hidden h-dvh w-52 shrink-0 flex-col',
        'border-r border-border bg-surface px-3 py-5',
        'lg:flex xl:w-56',
        className,
      )}
    >
      <NavLink to={paths.ask} aria-label="Cyklos Ask" className="mb-6 w-fit rounded-xs px-2">
        <Logo size="md" />
      </NavLink>

      <nav aria-label="Primary" className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
        <div>
          <NavLink
            to={paths.ask}
            end
            className={() =>
              cn(
                'flex items-center gap-3 rounded-control px-3 py-2.5 transition-colors duration-150',
                onAskSection
                  ? 'bg-navy-soft font-semibold text-ink'
                  : 'font-medium text-purple hover:bg-navy-soft/70 hover:text-ink',
              )
            }
          >
            <MessageCircleHeart
              className={cn('size-5 shrink-0', onAskSection ? 'text-gold-deep' : 'text-muted')}
              strokeWidth={onAskSection ? 2.25 : 1.75}
              aria-hidden
            />
            <span className="truncate text-sm">Ask</span>
          </NavLink>
          <div className="mt-1 flex flex-col gap-0.5 pl-3">
            <button
              type="button"
              onClick={() => navigate(`${paths.ask}?new=1`)}
              className={cn(
                'flex items-center gap-2.5 rounded-control px-3 py-2 text-left',
                'text-sm font-medium text-purple transition-colors',
                'hover:bg-navy-soft/70 hover:text-ink',
              )}
            >
              <MessageCirclePlus className="size-4 shrink-0 text-gold-deep" aria-hidden />
              New chat
            </button>
            <NavLink
              to={paths.askHistory}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-control px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-navy-soft/80 font-semibold text-ink'
                    : 'font-medium text-purple hover:bg-navy-soft/70 hover:text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <History
                    className={cn(
                      'size-4 shrink-0',
                      isActive ? 'text-gold-deep' : 'text-muted',
                    )}
                    aria-hidden
                  />
                  History
                </>
              )}
            </NavLink>
          </div>
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">
            Features
          </p>
          <ul className="flex flex-col gap-0.5">
            {primaryProductFeatures.map((feature, index) => {
              const href = featureHref(feature.to, feature.slug)
              const active = isFeatureActive(location.pathname, feature.to, feature.slug)
              const Icon = feature.icon
              return (
                <li key={feature.slug}>
                  <NavLink
                    to={href}
                    title={feature.title}
                    className={cn(
                      'flex items-center gap-2.5 rounded-control px-3 py-2 transition-colors duration-150',
                      active
                        ? 'bg-navy-soft font-semibold text-ink'
                        : 'font-medium text-purple hover:bg-navy-soft/70 hover:text-ink',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'w-4 shrink-0 text-right font-mono text-[10px] tabular-nums',
                        active ? 'text-gold-deep' : 'text-faint',
                      )}
                    >
                      {index + 1}
                    </span>
                    {feature.glyph ? (
                      <span
                        aria-hidden
                        className={cn(
                          'inline-flex size-4 shrink-0 items-center justify-center text-sm leading-none',
                          active ? 'text-gold-deep' : 'text-muted',
                        )}
                      >
                        {feature.glyph}
                      </span>
                    ) : (
                      <Icon
                        className={cn(
                          'size-4 shrink-0',
                          active ? 'text-gold-deep' : 'text-muted',
                        )}
                        strokeWidth={active ? 2.25 : 1.75}
                        aria-hidden
                      />
                    )}
                    <span className="min-w-0 truncate text-sm leading-snug">{feature.title}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>

          <NavLink
            to={paths.everything}
            end
            className={({ isActive }) =>
              cn(
                'mt-2 flex items-center gap-2.5 rounded-control px-3 py-2.5 transition-colors duration-150',
                isActive
                  ? 'bg-navy-soft font-semibold text-ink'
                  : 'font-medium text-purple hover:bg-navy-soft/70 hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Telescope
                  className={cn(
                    'size-4 shrink-0',
                    isActive ? 'text-gold-deep' : 'text-muted',
                  )}
                  strokeWidth={isActive ? 2.25 : 1.75}
                  aria-hidden
                />
                <span className="truncate text-sm">All features</span>
              </>
            )}
          </NavLink>
        </div>
      </nav>

      <div className="mt-4 flex items-center gap-1 px-1">
        <ThemeQuickToggle />
        <AvatarMenu user={user} placement="up" />
      </div>
    </aside>
  )
}
