import { cn } from '@/utils/cn'

export interface AstroDividerProps {
  /** Optional word set into the break, e.g. "Read from your chart". */
  label?: string
  tone?: 'light' | 'dark'
  className?: string
}

/**
 * A rule with an astronomical node at its centre — a small ringed point, the
 * mark used on star charts to fix a position.
 *
 * It replaces a plain `<hr>` where a section break should still read as part
 * of the same instrument.
 */
export function AstroDivider({ label, tone = 'light', className }: AstroDividerProps) {
  const dark = tone === 'dark'
  const line = dark ? 'bg-celestial-line' : 'bg-border'
  const mark = dark ? 'text-gold-soft-line' : 'text-gold'

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)} role="separator">
      <span aria-hidden className={cn('h-px min-w-4 flex-1', line)} />

      <span aria-hidden className={cn('shrink-0', mark)}>
        <svg viewBox="0 0 24 8" className="h-2 w-6" fill="none">
          <circle cx="12" cy="4" r="2.4" stroke="currentColor" strokeWidth="0.9" />
          <circle cx="12" cy="4" r="0.8" fill="currentColor" />
          <path d="M0 4h6M18 4h6" stroke="currentColor" strokeWidth="0.7" opacity="0.55" />
        </svg>
      </span>

      {label && (
        <>
          <span
            className={cn(
              'shrink-0 font-mono text-label uppercase',
              dark ? 'text-on-celestial-faint' : 'text-muted',
            )}
          >
            {label}
          </span>
          <span aria-hidden className={cn('h-px min-w-4 flex-1', line)} />
        </>
      )}

      {!label && <span aria-hidden className={cn('h-px min-w-4 flex-1', line)} />}
    </div>
  )
}
