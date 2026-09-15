import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface ProgressStep {
  id: string
  label: string
}

export interface ProgressIndicatorProps {
  steps: ProgressStep[]
  /** Zero-based index of the step in progress. */
  current: number
  /** `bar` for the compact mobile header, `list` for the desktop auth panel. */
  variant?: 'bar' | 'list'
  /** `dark` inverts the palette for the navy auth panel. */
  tone?: 'light' | 'dark'
  className?: string
}

/**
 * Sign-up progress. On mobile it is one compact line; on desktop it fills the
 * left panel so the auth screens are never a form on blank ground.
 */
export function ProgressIndicator({
  steps,
  current,
  variant = 'bar',
  tone = 'light',
  className,
}: ProgressIndicatorProps) {
  const total = steps.length
  const clamped = Math.min(Math.max(current, 0), total - 1)
  const dark = tone === 'dark'

  if (variant === 'bar') {
    return (
      <div className={cn('space-y-2', className)}>
        <p
          className={cn(
            'font-mono text-label uppercase',
            dark ? 'text-on-celestial-muted' : 'text-muted',
          )}
          role="status"
          aria-live="polite"
        >
          Step {clamped + 1} of {total}
        </p>
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={clamped + 1}
          aria-label={steps[clamped]?.label}
          className="flex gap-1.5"
        >
          {steps.map((step, index) => (
            <span
              key={step.id}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-300 ease-out-soft',
                index <= clamped
                  ? dark
                    ? 'bg-gold'
                    : 'bg-navy'
                  : dark
                    ? 'bg-celestial-line'
                    : 'bg-border',
              )}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <ol className={cn('space-y-4', className)}>
      {steps.map((step, index) => {
        const done = index < clamped
        const active = index === clamped
        return (
          <li key={step.id} className="flex items-center gap-3">
            <span
              aria-hidden
              className={cn(
                'inline-flex size-7 shrink-0 items-center justify-center rounded-full border',
                'font-mono text-[11px] transition-colors duration-200 ease-out-soft',
                (done || active) &&
                  (dark
                    ? 'border-gold-soft-line bg-gold-soft-line text-midnight'
                    : 'border-navy bg-navy text-on-celestial'),
                !done &&
                  !active &&
                  (dark
                    ? 'border-celestial-line text-on-celestial-faint'
                    : 'border-border-strong text-muted'),
              )}
            >
              {done ? <Check className="size-3.5" /> : index + 1}
            </span>
            <span
              className={cn(
                'text-sub',
                active
                  ? dark
                    ? 'font-semibold text-on-celestial'
                    : 'font-semibold text-ink'
                  : dark
                    ? 'text-on-celestial-muted'
                    : 'text-muted',
              )}
            >
              {step.label}
            </span>
            {active && <span className="sr-only">(current step)</span>}
          </li>
        )
      })}
    </ol>
  )
}
