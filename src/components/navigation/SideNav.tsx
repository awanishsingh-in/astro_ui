import {
  BookMarked,
  LayoutGrid,
  ScrollText,
  Sparkles,
  SquarePen,
  WandSparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Logo, LogoMark } from '@/components/brand/Logo'
import { AvatarMenu } from '@/components/navigation/AvatarMenu'
import { ThemeQuickToggle } from '@/components/account/ThemeQuickToggle'
import { livePrimaryFeatures } from '@/data/features'
import { paths } from '@/routes/paths'
import type { User } from '@/types/user'
import { cn } from '@/utils/cn'

export interface SideNavProps {
  user: User
  collapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
}

function featureHref(to: string | undefined, slug: string) {
  return to ?? paths.explore(slug)
}

function isFeatureActive(pathname: string, to: string | undefined, slug: string): boolean {
  const href = featureHref(to, slug)
  if (pathname === href || pathname.startsWith(`${href}/`)) return true

  if (slug === 'my-chart' || slug === 'kundli') {
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
  if (slug === 'calendar') {
    return pathname === paths.calendar || pathname.startsWith(`${paths.calendar}/`)
  }
  return pathname === paths.explore(slug)
}

/**
 * Desktop primary navigation — Ask on top, Your Past, then product features.
 * Collapses to an icon rail so the page can take the full width.
 */
export function SideNav({
  user,
  collapsed = false,
  onToggleCollapse,
  className,
}: SideNavProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const onAsk =
    location.pathname === paths.ask ||
    (location.pathname.startsWith(`${paths.ask}/`) &&
      location.pathname !== paths.askHistory &&
      !location.pathname.startsWith(`${paths.askHistory}/`))

  if (collapsed) {
    return (
      <aside
        className={cn(
          'sticky top-0 z-30 hidden h-dvh w-14 shrink-0 flex-col items-center',
          'border-r border-border/70 bg-surface/75 px-1.5 py-4 backdrop-blur-xl',
          'lg:flex',
          className,
        )}
      >
        <NavLink
          to={paths.ask}
          aria-label="Cyklos Ask"
          className="mb-4 inline-flex size-9 items-center justify-center rounded-control"
        >
          <LogoMark className="size-7" title="Cyklos" />
        </NavLink>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Open sidebar"
            title="Open sidebar"
            className="mb-4 inline-flex size-9 items-center justify-center rounded-control text-muted transition-colors hover:bg-navy-soft hover:text-ink"
          >
            <PanelLeftOpen className="size-4" strokeWidth={1.75} />
          </button>
        )}

        <nav aria-label="Primary" className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto no-scrollbar">
          <NavLink
            to={paths.ask}
            end
            title="Ask"
            aria-label="Ask"
            className={() =>
              cn(
                'inline-flex size-9 items-center justify-center rounded-control transition-colors',
                onAsk ? 'bg-copper/20 text-copper' : 'text-muted hover:bg-navy-soft/70 hover:text-ink',
              )
            }
          >
            <WandSparkles className="size-5" strokeWidth={onAsk ? 2.25 : 1.75} aria-hidden />
          </NavLink>

          <button
            type="button"
            title="New chat"
            aria-label="New chat"
            onClick={() => navigate(`${paths.ask}?new=1`)}
            className="inline-flex size-9 items-center justify-center rounded-control text-gold-deep transition-colors hover:bg-navy-soft/70"
          >
            <SquarePen className="size-4" aria-hidden />
          </button>

          <NavLink
            to={paths.askHistory}
            title="History"
            aria-label="History"
            className={({ isActive }) =>
              cn(
                'inline-flex size-9 items-center justify-center rounded-control transition-colors',
                isActive ? 'bg-navy-soft text-gold-deep' : 'text-muted hover:bg-navy-soft/70 hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <ScrollText className="size-5" strokeWidth={isActive ? 2.25 : 1.75} aria-hidden />
            )}
          </NavLink>

          <NavLink
            to={paths.yourPast}
            title="Your Past"
            aria-label="Your Past"
            className={({ isActive }) =>
              cn(
                'inline-flex size-9 items-center justify-center rounded-control transition-colors',
                isActive ? 'bg-navy-soft text-gold-deep' : 'text-muted hover:bg-navy-soft/70 hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <BookMarked className="size-5" strokeWidth={isActive ? 2.25 : 1.75} aria-hidden />
            )}
          </NavLink>

          <span className="my-2 h-px w-6 bg-border" aria-hidden />

          {livePrimaryFeatures.slice(0, 4).map((feature) => {
            const href = featureHref(feature.to, feature.slug)
            const active = isFeatureActive(location.pathname, feature.to, feature.slug)
            const Icon = feature.icon
            return (
              <NavLink
                key={feature.slug}
                to={href}
                title={feature.title}
                aria-label={feature.title}
                className={cn(
                  'inline-flex size-9 items-center justify-center rounded-control transition-colors',
                  active ? 'bg-navy-soft text-gold-deep' : 'text-muted hover:bg-navy-soft/70 hover:text-ink',
                )}
              >
                <Icon className="size-4" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
              </NavLink>
            )
          })}

          <NavLink
            to={paths.everything}
            title="All features"
            aria-label="All features"
            className={({ isActive }) =>
              cn(
                'inline-flex size-9 items-center justify-center rounded-control transition-colors',
                isActive ? 'bg-navy-soft text-gold-deep' : 'text-muted hover:bg-navy-soft/70 hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <LayoutGrid className="size-4" strokeWidth={isActive ? 2.25 : 1.75} aria-hidden />
            )}
          </NavLink>
        </nav>

        <div className="mt-3 flex flex-col items-center gap-1">
          <AvatarMenu user={user} placement="up" />
          <ThemeQuickToggle />
        </div>
      </aside>
    )
  }

  return (
    <aside
      className={cn(
        'sticky top-0 z-30 hidden h-dvh w-60 shrink-0 flex-col',
        'border-r border-border/60 bg-surface/80 px-3.5 py-5 backdrop-blur-xl',
        'lg:flex xl:w-64',
        'shadow-[inset_-1px_0_0_0_rgba(232,168,78,0.06)]',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-copper/10 blur-3xl" />
        <div className="absolute -right-8 bottom-24 h-36 w-36 rounded-full bg-deep-burgundy/50 blur-3xl" />
      </div>

      <div className="mb-5 flex items-center justify-between gap-2 px-1">
        <NavLink to={paths.ask} aria-label="Cyklos Ask" className="w-fit rounded-xs">
          <Logo size="md" />
        </NavLink>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Close sidebar"
            title="Close sidebar"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-control text-muted transition-colors hover:bg-navy-soft hover:text-ink"
          >
            <PanelLeftClose className="size-4" strokeWidth={1.75} />
          </button>
        )}
      </div>

      <nav aria-label="Primary" className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-1 rounded-card border border-border/50 bg-surface-sunken/35 p-1.5">
          <NavLink
            to={paths.ask}
            end
            className={() =>
              cn(
                'flex items-center gap-3 rounded-control px-3 py-2.5 transition-[background-color,color,box-shadow] duration-150',
                onAsk
                  ? 'bg-gradient-to-r from-copper/25 via-copper/10 to-transparent font-semibold text-ink shadow-[inset_3px_0_0_0_var(--color-copper)]'
                  : 'font-medium text-purple hover:bg-navy-soft/70 hover:text-ink',
              )
            }
          >
            <WandSparkles
              className={cn('size-5 shrink-0', onAsk ? 'text-gold-deep' : 'text-muted')}
              strokeWidth={onAsk ? 2.25 : 1.75}
              aria-hidden
            />
            <span className="truncate text-sm">Ask</span>
          </NavLink>

          <div className="flex flex-col gap-0.5 pl-2">
            <button
              type="button"
              onClick={() => navigate(`${paths.ask}?new=1`)}
              className={cn(
                'flex items-center gap-2.5 rounded-control px-3 py-2 text-left',
                'text-sm font-medium text-purple transition-colors',
                'hover:bg-navy-soft/70 hover:text-ink',
              )}
            >
              <SquarePen className="size-4 shrink-0 text-gold-deep" aria-hidden />
              New chat
            </button>
          </div>

          <NavLink
            to={paths.askHistory}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-control px-3 py-2.5 transition-[background-color,color,box-shadow] duration-150',
                isActive
                  ? 'bg-gradient-to-r from-copper/25 via-copper/10 to-transparent font-semibold text-ink shadow-[inset_3px_0_0_0_var(--color-copper)]'
                  : 'font-medium text-purple hover:bg-navy-soft/70 hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <>
                <ScrollText
                  className={cn('size-5 shrink-0', isActive ? 'text-gold-deep' : 'text-muted')}
                  strokeWidth={isActive ? 2.25 : 1.75}
                  aria-hidden
                />
                <span className="truncate text-sm">History</span>
              </>
            )}
          </NavLink>

          <NavLink
            to={paths.yourPast}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-control px-3 py-2.5 transition-[background-color,color,box-shadow] duration-150',
                isActive
                  ? 'bg-gradient-to-r from-copper/25 via-copper/10 to-transparent font-semibold text-ink shadow-[inset_3px_0_0_0_var(--color-copper)]'
                  : 'font-medium text-purple hover:bg-navy-soft/70 hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <>
                <BookMarked
                  className={cn('size-5 shrink-0', isActive ? 'text-gold-deep' : 'text-muted')}
                  strokeWidth={isActive ? 2.25 : 1.75}
                  aria-hidden
                />
                <span className="truncate text-sm">Your Past</span>
              </>
            )}
          </NavLink>
        </div>

        <div className="mt-5">
          <p className="mb-2.5 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
            Features
          </p>
          <ul className="flex flex-col gap-0.5">
            {livePrimaryFeatures.map((feature) => {
              const href = featureHref(feature.to, feature.slug)
              const active = isFeatureActive(location.pathname, feature.to, feature.slug)
              const Icon = feature.icon
              return (
                <li key={feature.slug}>
                  <NavLink
                    to={href}
                    title={feature.title}
                    className={cn(
                      'group flex items-center gap-3 rounded-control px-3 py-2.5 transition-[background-color,color,box-shadow] duration-150',
                      active
                        ? 'bg-gradient-to-r from-copper/22 via-copper/8 to-transparent font-semibold text-ink shadow-[inset_3px_0_0_0_var(--color-copper)]'
                        : 'font-medium text-purple hover:bg-navy-soft/70 hover:text-ink',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'inline-flex size-8 shrink-0 items-center justify-center rounded-control border transition-colors',
                        active
                          ? 'border-copper/35 bg-copper/15 text-gold-deep'
                          : 'border-border/70 bg-surface-sunken/50 text-muted group-hover:border-border-strong group-hover:text-ink',
                      )}
                    >
                      <Icon className="size-4" strokeWidth={active ? 2.25 : 1.75} />
                    </span>
                    <span className="min-w-0 text-sm leading-snug text-pretty">{feature.title}</span>
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
                'mt-2 flex items-center gap-3 rounded-control px-3 py-2.5 transition-[background-color,color,box-shadow] duration-150',
                isActive
                  ? 'bg-gradient-to-r from-copper/22 via-copper/8 to-transparent font-semibold text-ink shadow-[inset_3px_0_0_0_var(--color-copper)]'
                  : 'font-medium text-purple hover:bg-navy-soft/70 hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  aria-hidden
                  className={cn(
                    'inline-flex size-8 shrink-0 items-center justify-center rounded-control border',
                    isActive
                      ? 'border-copper/35 bg-copper/15 text-gold-deep'
                      : 'border-border/70 bg-surface-sunken/50 text-muted',
                  )}
                >
                  <Sparkles className="size-4" strokeWidth={isActive ? 2.25 : 1.75} />
                </span>
                <span className="truncate text-sm">All features</span>
              </>
            )}
          </NavLink>
        </div>
      </nav>

      <div className="mt-4 flex items-center gap-2 rounded-card border border-border/60 bg-surface-sunken/40 px-2 py-2">
        <AvatarMenu user={user} placement="up" />
        <ThemeQuickToggle />
      </div>
    </aside>
  )
}
