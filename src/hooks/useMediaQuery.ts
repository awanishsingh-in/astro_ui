import { useSyncExternalStore } from 'react'
import { breakpoint, type Breakpoint } from '@/styles/tokens'

/** Subscribe to a media query. SSR-safe and re-renders only on a real change. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** True at or above the given breakpoint. `useBreakpoint('lg')` — desktop and up. */
export function useBreakpoint(name: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${breakpoint[name]}px)`)
}

/**
 * The one call layouts use to decide between mobile and desktop composition.
 * Tablet counts as mobile chrome (bottom nav) but gets multi-column content.
 */
export function useIsDesktop(): boolean {
  return useBreakpoint('lg')
}
