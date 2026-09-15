import { useCallback, useRef, type ReactNode } from 'react'
import { Button } from '@/components/common/Button'
import { Overlay } from '@/components/modals/Overlay'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { cn } from '@/utils/cn'

export interface SideDrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  closeLabel?: string
  className?: string
}

/**
 * Left-edge drawer for mobile menus — slides in over a scrim.
 */
export function SideDrawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  closeLabel = 'Close',
  className,
}: SideDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const handleEscape = useCallback(() => onClose(), [onClose])
  useFocusTrap(panelRef, isOpen, handleEscape)

  return (
    <Overlay isOpen={isOpen} onClose={onClose} align="left">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'relative flex h-full w-[min(20rem,88vw)] flex-col outline-none',
          'animate-drawer-in border-r border-border bg-surface shadow-overlay',
          className,
        )}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 pb-4 pt-safe">
          <div className="min-w-0 space-y-1 pt-4">
            <h2 className="text-heading font-semibold text-ink">{title}</h2>
            {description && <p className="text-sm text-muted text-pretty">{description}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="mt-3 shrink-0">
            {closeLabel}
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          {children}
        </div>
      </div>
    </Overlay>
  )
}
