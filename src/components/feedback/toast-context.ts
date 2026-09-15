import { createContext, useContext } from 'react'

export type ToastTone = 'info' | 'success' | 'caution' | 'critical'

export interface Toast {
  id: string
  tone: ToastTone
  /** One line. If it needs a paragraph, it is not a toast. */
  message: string
  /** Optional second line for detail. */
  description?: string
  /** A single inline action, e.g. "Undo". */
  action?: { label: string; onClick: () => void }
  /** Milliseconds before auto-dismiss. `0` keeps it until dismissed. */
  duration: number
}

export type ToastInput = Omit<Partial<Toast>, 'message'> & { message: string }

export interface ToastApi {
  /** Raise a toast and get its id back, so it can be dismissed early. */
  toast: (input: ToastInput) => string
  info: (message: string, input?: Omit<ToastInput, 'message' | 'tone'>) => string
  success: (message: string, input?: Omit<ToastInput, 'message' | 'tone'>) => string
  caution: (message: string, input?: Omit<ToastInput, 'message' | 'tone'>) => string
  error: (message: string, input?: Omit<ToastInput, 'message' | 'tone'>) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}

export const ToastContext = createContext<ToastApi | null>(null)

/**
 * The app's only way to give transient feedback. `alert()` is never used —
 * it blocks the thread, cannot be styled and is invisible to the design system.
 */
export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) {
    throw new Error('useToast must be used inside <ToastProvider>.')
  }
  return api
}
