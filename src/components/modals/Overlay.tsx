import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { cn } from '@/utils/cn'

export interface OverlayProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  /** Aligns the panel — centred for modals, bottom for sheets, left for drawers. */
  align?: 'center' | 'bottom' | 'left'
  className?: string
}

/**
 * The shared scrim and portal behind every modal and sheet. Owns body-scroll
 * locking and the backdrop click, so overlays never reimplement them.
 */
export function Overlay({ isOpen, onClose, children, align = 'center', className }: OverlayProps) {
  useLockBodyScroll(isOpen)

  if (!isOpen) return null

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex',
        align === 'center' && 'items-center justify-center p-4',
        align === 'bottom' && 'items-end justify-center',
        align === 'left' && 'items-stretch justify-start',
        className,
      )}
    >
      <div
        className="absolute inset-0 animate-fade-in bg-midnight/70"
        onClick={onClose}
        aria-hidden
      />
      {children}
    </div>,
    document.body,
  )
}
