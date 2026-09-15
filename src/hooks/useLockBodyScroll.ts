import { useEffect } from 'react'

/**
 * Freeze the page behind an open overlay, compensating for the scrollbar so
 * the layout does not jump on desktop.
 */
export function useLockBodyScroll(active: boolean): void {
  useEffect(() => {
    if (!active) return

    const { body } = document
    const previousOverflow = body.style.overflow
    const previousPadding = body.style.paddingRight
    const scrollbar = window.innerWidth - document.documentElement.clientWidth

    body.style.overflow = 'hidden'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`

    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPadding
    }
  }, [active])
}
