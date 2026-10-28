import {
  BookMarked,
  History,
  SquarePen,
  WandSparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useEffect, useState } from 'react'
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

function featureHref(to: string | undefined) {
  return to ?? paths.ask
}

function isFeatureActive(pathname: string, to: string | undefined, slug: string): boolean {
  const href = featureHref(to)
  if (to && (pathname === href || pathname.startsWith(`${href}/`))) return true

  if (slug === 'my-chart' || slug === 'kundli') {
    return pathname === paths.chart || pathname.startsWith(`${paths.chart}/`)
  }
  if (slug === 'matching') {
    return pathname === paths.matching || pathname.startsWith(`${paths.matching}/`)
  }
  if (slug === 'horoscope') {
    return pathname.startsWith('/horoscope')
  }
  if (slug === 'calculator' || slug === 'dosha') {
    return pathname === paths.calculatorRoot || pathname.startsWith(`${paths.calculatorRoot}/`)
  }
  if (slug === 'reports') {
    return pathname === paths.reportsRoot || pathname.startsWith(`${paths.reportsRoot}/`)
  }
  if (slug === 'calendar') {
    return pathname === paths.calendar || pathname.startsWith(`${paths.calendar}/`)
  }
  if (slug === 'panchang') {
    return pathname === paths.panchang || pathname.startsWith(`${paths.panchang}/`)
  }
  return false
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
  const [newChatGlow, setNewChatGlow] = useState(false)
  const onAsk =
    location.pathname === paths.ask ||
    (location.pathname.startsWith(`${paths.ask}/`) &&
      location.pathname !== paths.askHistory &&
      !location.pathname.startsWith(`${paths.askHistory}/`))
  const askSearch = new URLSearchParams(location.search)
  const onFreshAsk =
    location.pathname === paths.ask && !askSearch.get('chat')
  const newChatLit = newChatGlow || onFreshAsk

  useEffect(() => {
    if (!newChatGlow) return
    const timer = window.setTimeout(() => setNewChatGlow(false), 2400)
    return () => window.clearTimeout(timer)
  }, [newChatGlow])

  const startNewChat = () => {
    setNewChatGlow(true)
    navigate(`${paths.ask}?new=1`)
  }

  if (collapsed) {
    return (
      <aside
        className={cn(
          'sticky top-0 z-30 hidden h-dvh w-14 shrink-0 flex-col items-center',
          'border-r border-border/40 bg-bg-secondary/90 px-1.5 py-4 backdrop-blur-xl',
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
                onAsk ? 'bg-surface-raised text-silver-100' : 'text-silver-200 hover:bg-surface-raised/70 hover:text-text',
              )
            }
          >
            <WandSparkles className="size-5" strokeWidth={onAsk ? 2.25 : 1.75} aria-hidden />
          </NavLink>

          <button
            type="button"
            title="New chat"
            aria-label="New chat"
            aria-pressed={newChatLit}
            onClick={startNewChat}
            className={cn(
              'inline-flex size-9 items-center justify-center rounded-control transition-[color,background-color,box-shadow] duration-300',
              newChatLit
                ? 'bg-surface-raised text-silver-100'
                : 'text-silver-200 hover:bg-surface-raised/70 hover:text-text',
            )}
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
                isActive ? 'bg-surface-raised text-silver-100' : 'text-silver-200 hover:bg-surface-raised/70 hover:text-text',
              )
            }
          >
            {({ isActive }) => (
              <History className="size-5" strokeWidth={isActive ? 2.25 : 1.75} aria-hidden />
            )}
          </NavLink>

          <NavLink
            to={paths.yourPast}
            title="Your Past"
            aria-label="Your Past"
            className={({ isActive }) =>
              cn(
                'inline-flex size-9 items-center justify-center rounded-control transition-colors',
                isActive ? 'bg-surface-raised text-silver-100' : 'text-silver-200 hover:bg-surface-raised/70 hover:text-text',
              )
            }
          >
            {({ isActive }) => (
              <BookMarked className="size-5" strokeWidth={isActive ? 2.25 : 1.75} aria-hidden />
            )}
          </NavLink>

          <span className="my-2 h-px w-6 bg-border" aria-hidden />

          {livePrimaryFeatures.slice(0, 4).map((feature) => {
            const href = featureHref(feature.to)
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
                  active ? 'bg-surface-raised text-silver-100' : 'text-silver-200 hover:bg-surface-raised/70 hover:text-text',
                )}
              >
                <Icon className="size-4" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
              </NavLink>
            )
          })}
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
        'relative sticky top-0 z-30 hidden h-dvh w-60 shrink-0 flex-col',
        'border-r border-[color:var(--hairline)] bg-[var(--bg-elevated)] px-3.5 py-5 backdrop-blur-xl',
        'lg:flex xl:w-64',
        className,
      )}
    >

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
        <div className="flex flex-col gap-1 rounded-card border border-border/50 bg-surface/40 p-1.5">
          <NavLink
            to={paths.ask}
            end
            className={() =>
              cn(
                'flex items-center gap-3 rounded-control px-3 py-2.5 transition-[background-color,color,box-shadow] duration-150',
                onAsk
                  ? 'rg-selected relative font-semibold text-text'
                  : 'font-medium text-silver-200 hover:bg-white/[0.05] hover:text-text',
              )
            }
          >
            {onAsk ? <span className="nav-active-bar" aria-hidden /> : null}
            <WandSparkles
              className={cn('size-5 shrink-0', onAsk ? 'text-silver-100' : 'text-silver-300')}
              strokeWidth={onAsk ? 2.25 : 1.75}
              aria-hidden
            />
            <span className="truncate text-sm">Ask</span>
          </NavLink>

          <div className="flex flex-col gap-0.5 pl-2">
            <button
              type="button"
              aria-pressed={newChatLit}
              onClick={startNewChat}
              className={cn(
                'flex items-center gap-2.5 rounded-control px-3 py-2 text-left',
                'text-sm font-medium transition-[color,background-color,box-shadow] duration-300',
                newChatLit
                  ? 'bg-white/[0.05] font-semibold text-text'
                  : 'text-silver-200 hover:bg-white/[0.05] hover:text-text',
              )}
            >
              <SquarePen
                className={cn(
                  'size-4 shrink-0 transition-colors duration-300',
                  newChatLit ? 'text-silver-100' : 'text-silver-300',
                )}
                aria-hidden
              />
              New chat
            </button>
          </div>

          <NavLink
            to={paths.askHistory}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-control px-3 py-2.5 transition-[background-color,color,box-shadow] duration-150',
                isActive
                  ? 'rg-selected relative font-semibold text-text'
                  : 'font-medium text-silver-200 hover:bg-white/[0.05] hover:text-text',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? <span className="nav-active-bar" aria-hidden /> : null}
                <History
                  className={cn('size-5 shrink-0', isActive ? 'text-silver-100' : 'text-silver-300')}
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
                  ? 'rg-selected relative font-semibold text-text'
                  : 'font-medium text-silver-200 hover:bg-white/[0.05] hover:text-text',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? <span className="nav-active-bar" aria-hidden /> : null}
                <BookMarked
                  className={cn('size-5 shrink-0', isActive ? 'text-silver-100' : 'text-silver-300')}
                  strokeWidth={isActive ? 2.25 : 1.75}
                  aria-hidden
                />
                <span className="truncate text-sm">Your Past</span>
              </>
            )}
          </NavLink>
        </div>

        <div className="mt-5">
          <p className="mb-2.5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-silver-300">
            Features
          </p>
          <ul className="flex flex-col gap-0.5">
            {livePrimaryFeatures.map((feature) => {
              const href = featureHref(feature.to)
              const active = isFeatureActive(location.pathname, feature.to, feature.slug)
              const Icon = feature.icon
              return (
                <li key={feature.slug}>
                  <NavLink
                    to={href}
                    title={feature.title}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-control px-3 py-2.5 transition-[background-color,color,box-shadow] duration-150',
                      active
                        ? 'rg-selected font-semibold text-text'
                        : 'font-medium text-silver-200 hover:bg-white/[0.05] hover:text-text',
                    )}
                  >
                    {active ? <span className="nav-active-bar" aria-hidden /> : null}
                    <span
                      aria-hidden
                      className={cn(
                        'inline-flex size-8 shrink-0 items-center justify-center rounded-control transition-colors',
                        active
                          ? 'rg-icon-tile text-silver-100'
                          : 'border border-[rgba(237,230,239,0.14)] bg-transparent text-silver-300 group-hover:text-text',
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
        </div>
      </nav>

      <div className="mt-4 flex items-center gap-2 rounded-card border border-border/60 bg-surface/40 px-2 py-2">
        <AvatarMenu user={user} placement="up" />
        <ThemeQuickToggle />
      </div>
    </aside>
  )
}
