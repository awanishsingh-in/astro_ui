import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconButton } from '@/components/common/IconButton'
import type { Toast as ToastModel, ToastTone } from './toast-context'
import { cn } from '@/utils/cn'

const TONE_ICON: Record<ToastTone, ReactNode> = {
  info: <Info />,
  success: <CircleCheck />,
  caution: <TriangleAlert />,
  critical: <CircleAlert />,
}

const TONE_ACCENT: Record<ToastTone, string> = {
  info: 'text-navy',
  success: 'text-positive',
  caution: 'text-caution',
  critical: 'text-critical',
}

export interface ToastProps {
  toast: ToastModel
  onDismiss: (id: string) => void
  /** Pauses the auto-dismiss timer while the pointer or focus rests here. */
  onPause: () => void
  onResume: () => void
}

/**
 * One toast. White surface, one border, one accent glyph — the same card
 * language as the rest of the product, not a coloured banner.
 */
export function Toast({ toast, onDismiss, onPause, onResume }: ToastProps) {
  return (
    <li
      // `alert` interrupts a screen reader; `status` waits its turn. Only a
      // failure earns the interruption.
      role={toast.tone === 'critical' ? 'alert' : 'status'}
      onMouseEnter={onPause}
      onMouseLeave={onResume}
      onFocusCapture={onPause}
      onBlurCapture={onResume}
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 animate-toast-in',
        'rounded-card border border-border bg-surface p-4 shadow-overlay',
      )}
    >
      <span aria-hidden className={cn('mt-0.5 shrink-0 [&_svg]:size-5', TONE_ACCENT[toast.tone])}>
        {TONE_ICON[toast.tone]}
      </span>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sub font-medium text-ink text-pretty">{toast.message}</p>
        {toast.description && (
          <p className="text-sm text-muted text-pretty">{toast.description}</p>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick()
              onDismiss(toast.id)
            }}
            className="pt-1 text-sm font-semibold text-navy underline underline-offset-2 hover:text-gold-deep"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <IconButton
        label="Dismiss"
        icon={<X />}
        size="sm"
        onClick={() => onDismiss(toast.id)}
        className="-mr-1.5 -mt-1.5 shrink-0"
      />
    </li>
  )
}
