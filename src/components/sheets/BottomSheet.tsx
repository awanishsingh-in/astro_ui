import { useCallback, useRef, type ReactNode } from 'react'
import { Button } from '@/components/common/Button'
import { Overlay } from '@/components/modals/Overlay'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { cn } from '@/utils/cn'

export interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  /** Sticky action area at the foot. */
  footer?: ReactNode
  /** Label for the trailing header control. */
  closeLabel?: string
  className?: string
}

/**
 * The mobile overlay. Sheets replace extra screens throughout the product —
 * the chart picker, filters, and any short secondary choice.
 *
 * On desktop it centres itself so a single component serves both, with the
 * mobile composition leading.
 */
export function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  closeLabel = 'Close',
  className,
}: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const handleEscape = useCallback(() => onClose(), [onClose])
  useFocusTrap(panelRef, isOpen, handleEscape)

  return (
    <Overlay isOpen={isOpen} onClose={onClose} align="bottom" className="md:items-center md:p-4">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[88dvh] w-full flex-col animate-sheet-up outline-none',
          'rounded-t-sheet border-t border-border bg-surface shadow-sheet',
          'md:max-w-lg md:animate-scale-in md:rounded-sheet md:border md:shadow-overlay',
          className,
        )}
      >
        {/* Grab handle — the affordance that says this is a sheet. */}
        <div className="flex justify-center pt-3 md:hidden" aria-hidden>
          <span className="h-1 w-9 rounded-full bg-border-strong" />
        </div>

        <header className="flex items-start justify-between gap-4 px-5 pb-4 pt-4">
          <div className="min-w-0 space-y-1">
            <h2 className="text-heading font-semibold text-ink">{title}</h2>
            {description && <p className="text-sm text-muted text-pretty">{description}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="-mr-2 shrink-0">
            {closeLabel}
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto border-t border-border px-5 py-4">
          {children}
        </div>

        {footer && (
          <footer className="pb-safe border-t border-border bg-surface px-5 py-4">{footer}</footer>
        )}
      </div>
    </Overlay>
  )
}
