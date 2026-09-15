import { useEffect, type RefObject } from 'react'

/** Close menus and popovers on an outside pointer press. */
export function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  active = true,
): void {
  useEffect(() => {
    if (!active) return

    const onPointerDown = (event: PointerEvent) => {
      const el = ref.current
      if (!el || el.contains(event.target as Node)) return
      handler()
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [ref, handler, active])
}
