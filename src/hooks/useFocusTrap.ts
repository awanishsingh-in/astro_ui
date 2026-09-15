import { useEffect, type RefObject } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Keep Tab inside an open overlay, move focus into it on open and return it to
 * the trigger on close. Every modal and sheet uses this, so keyboard access is
 * a property of the system rather than of each component.
 */
export function useFocusTrap<T extends HTMLElement>(
  ref: RefObject<T | null>,
  active: boolean,
  onEscape?: () => void,
): void {
  useEffect(() => {
    if (!active) return

    const container = ref.current
    if (!container) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const first = container.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? container).focus({ preventScroll: true })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape?.()
        return
      }
      if (event.key !== 'Tab') return

      const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      )
      if (items.length === 0) return

      const firstItem = items[0]
      const lastItem = items[items.length - 1]

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault()
        lastItem.focus()
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault()
        firstItem.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus({ preventScroll: true })
    }
  }, [ref, active, onEscape])
}
