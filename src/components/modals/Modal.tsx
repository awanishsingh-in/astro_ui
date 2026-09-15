import { X } from 'lucide-react'
import { useCallback, useRef, type ReactNode } from 'react'
import { IconButton } from '@/components/common/IconButton'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { cn } from '@/utils/cn'
import { Overlay } from './Overlay'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  /** Sticky action row at the foot of the panel. */
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
} as const

/**
 * The desktop overlay. On mobile prefer `BottomSheet` — the reference is
 * explicit that a sheet beats an extra screen or a centred dialog on a phone.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const handleEscape = useCallback(() => onClose(), [onClose])
  useFocusTrap(panelRef, isOpen, handleEscape)

  return (
    <Overlay isOpen={isOpen} onClose={onClose} align="center">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[85dvh] w-full flex-col animate-scale-in',
          'rounded-panel border border-border bg-surface shadow-overlay outline-none',
          SIZES[size],
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0 space-y-1">
            <h2 className="text-heading font-semibold text-ink">{title}</h2>
            {description && <p className="text-sm text-muted text-pretty">{description}</p>}
          </div>
          <IconButton label="Close" icon={<X />} onClick={onClose} size="sm" />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-3 border-t border-border p-5">
            {footer}
          </footer>
        )}
      </div>
    </Overlay>
  )
}
