import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { Toast } from './Toast'
import {
  ToastContext,
  type Toast as ToastModel,
  type ToastApi,
  type ToastInput,
  type ToastTone,
} from './toast-context'

const DEFAULT_DURATION = 4500
/** More than three at once is noise, not feedback. */
const MAX_VISIBLE = 3

/**
 * Owns the toast queue and renders the viewport.
 *
 * Timers live in a ref keyed by id so a pause (pointer or focus) can stop one
 * toast without disturbing the others, and every timer is cleared on unmount.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastModel[]>([])
  const timers = useRef(new Map<string, number>())
  const counter = useRef(0)

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer !== undefined) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const schedule = useCallback(
    (id: string, duration: number) => {
      if (duration <= 0) return
      const timer = window.setTimeout(() => dismiss(id), duration)
      timers.current.set(id, timer)
    },
    [dismiss],
  )

  const toast = useCallback(
    (input: ToastInput) => {
      counter.current += 1
      const id = input.id ?? `toast_${counter.current}`
      const next: ToastModel = {
        id,
        tone: input.tone ?? 'info',
        message: input.message,
        description: input.description,
        action: input.action,
        duration: input.duration ?? DEFAULT_DURATION,
      }

      setToasts((current) => [...current, next].slice(-MAX_VISIBLE))
      schedule(id, next.duration)
      return id
    },
    [schedule],
  )

  const dismissAll = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current.clear()
    setToasts([])
  }, [])

  // Clear every pending timer when the provider goes away.
  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer))
      pending.clear()
    }
  }, [])

  const pause = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer === undefined) return
    window.clearTimeout(timer)
    timers.current.delete(id)
  }, [])

  const resume = useCallback(
    (id: string) => {
      const target = toasts.find((t) => t.id === id)
      // Only re-arm if it is still visible and was not pinned open.
      if (!target || target.duration <= 0 || timers.current.has(id)) return
      schedule(id, target.duration)
    },
    [toasts, schedule],
  )

  const api = useMemo<ToastApi>(() => {
    const shorthand =
      (tone: ToastTone) => (message: string, input?: Omit<ToastInput, 'message' | 'tone'>) =>
        toast({ ...input, message, tone })

    return {
      toast,
      info: shorthand('info'),
      success: shorthand('success'),
      caution: shorthand('caution'),
      error: shorthand('critical'),
      dismiss,
      dismissAll,
    }
  }, [toast, dismiss, dismissAll])

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/*
        Fixed, so it escapes page flow without a portal. `--toast-inset` is set
        in base.css and rises only on pages that mount the bottom navigation;
        desktop pins the stack bottom-right, out of the reading column.
        `pointer-events-none` on the viewport keeps the page clickable between
        toasts — each toast re-enables them for itself.
      */}
      <div
        className={cn(
          'pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-4',
          'bottom-[calc(var(--toast-inset)+env(safe-area-inset-bottom))]',
          'lg:inset-x-auto lg:right-6 lg:bottom-6 lg:justify-end lg:px-0',
        )}
      >
        <ul aria-live="polite" aria-label="Notifications" className="flex w-full max-w-sm flex-col gap-2.5">
          {toasts.map((item) => (
            <Toast
              key={item.id}
              toast={item}
              onDismiss={dismiss}
              onPause={() => pause(item.id)}
              onResume={() => resume(item.id)}
            />
          ))}
        </ul>
      </div>
    </ToastContext.Provider>
  )
}
