import { cloneElement, isValidElement } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { primaryNav } from '@/routes/navigation'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'

function isNavActive(id: string, pathname: string, isActive: boolean): boolean {
  if (id === 'ask') {
    return pathname === paths.ask || pathname.startsWith(`${paths.ask}/`)
  }
  if (id === 'kundli') {
    return pathname === paths.chart || pathname.startsWith(`${paths.chart}/`)
  }
  if (id === 'match') {
    return (
      pathname === paths.matching ||
      pathname.startsWith(`${paths.matching}/`) ||
      pathname === paths.compatibility ||
      pathname.startsWith(`${paths.compatibility}/`)
    )
  }
  if (id === 'horoscope') {
    return pathname.startsWith('/horoscope')
  }
  if (id === 'tools') {
    return (
      pathname === paths.everything ||
      pathname.startsWith(`${paths.everything}/`) ||
      pathname.startsWith('/explore/')
    )
  }
  return isActive
}

/**
 * Mobile chrome — Ask first, then product tabs.
 */
export function BottomNav({ className }: { className?: string }) {
  const location = useLocation()

  return (
    <nav
      aria-label="Primary"
      data-bottom-nav=""
      className={cn(
        'pb-safe sticky bottom-0 z-30 shrink-0 border-t border-border/60 bg-surface/80 backdrop-blur-xl lg:hidden',
        className,
      )}
    >
      <ul className="flex h-bottomnav items-stretch px-1">
        {primaryNav.map((item) => {
          const isAsk = item.id === 'ask'
          return (
            <li key={item.id} className="min-w-0 flex-1">
              <NavLink
                to={item.to}
                end={isAsk}
                className={({ isActive }) => {
                  const active = isNavActive(item.id, location.pathname, isActive)
                  return cn(
                    'relative flex h-full flex-col items-center justify-center gap-1 px-0.5',
                    'transition-colors duration-150',
                    active ? 'text-copper' : 'text-muted',
                  )
                }}
              >
                {({ isActive }) => {
                  const active = isNavActive(item.id, location.pathname, isActive)
                  return (
                    <>
                      <span
                        aria-hidden
                        className={cn(
                          'absolute inset-x-[28%] top-0 h-0.5 rounded-full bg-gold transition-opacity duration-200',
                          active ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span
                        className={cn(
                          'inline-flex size-9 items-center justify-center rounded-full transition-colors',
                          active ? 'bg-navy-soft text-gold-deep' : 'text-current',
                        )}
                      >
                        {isValidElement(item.icon)
                          ? cloneElement(item.icon, {
                              className: 'size-5',
                              strokeWidth: active ? 2.25 : 1.75,
                              'aria-hidden': true,
                            } as Record<string, unknown>)
                          : item.icon}
                      </span>
                      <span
                        className={cn(
                          'w-full truncate text-center text-[10px] leading-none tracking-[0.01em]',
                          active ? 'font-semibold' : 'font-medium',
                        )}
                      >
                        {item.label}
                      </span>
                    </>
                  )
                }}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
