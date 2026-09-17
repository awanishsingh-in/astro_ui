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
  /** Stagger list steps in from the left (auth panel). */
  stagger?: boolean
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
  stagger = false,
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
          {steps.map((step, index) => {
            const filled = index <= clamped
            const current = index === clamped
            return (
              <span
                key={step.id}
                className={cn(
                  'relative h-1 flex-1 overflow-hidden rounded-full',
                  filled
                    ? dark
                      ? 'bg-copper/20'
                      : 'bg-navy/15'
                    : dark
                      ? 'bg-celestial-line'
                      : 'bg-border',
                )}
              >
                {filled && (
                  <span
                    className={cn(
                      'absolute inset-y-0 left-0 w-full rounded-full',
                      dark ? 'bg-copper' : 'bg-navy',
                      current && 'motion-safe:animate-auth-shimmer',
                    )}
                    style={
                      current
                        ? {
                            backgroundImage:
                              'linear-gradient(90deg, var(--color-copper) 0%, var(--color-light-copper) 50%, var(--color-copper) 100%)',
                            backgroundSize: '200% 100%',
                          }
                        : undefined
                    }
                  />
                )}
              </span>
            )
          })}
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
          <li
            key={step.id}
            className={cn(
              'flex items-center gap-3 motion-safe:transition-[opacity,transform] motion-safe:duration-300',
              stagger && 'motion-safe:animate-auth-step',
            )}
            style={stagger ? { animationDelay: `${140 + index * 100}ms` } : undefined}
          >
            <span
              aria-hidden
              className={cn(
                'inline-flex size-7 shrink-0 items-center justify-center rounded-full border',
                'font-mono text-[11px] transition-all duration-300 ease-out-soft',
                done &&
                  (dark
                    ? 'border-light-copper bg-copper text-midnight shadow-glow'
                    : 'border-navy bg-navy text-on-celestial'),
                active &&
                  (dark
                    ? 'scale-110 border-light-copper bg-gradient-to-b from-light-copper to-copper text-midnight shadow-glow motion-safe:animate-pulse-soft'
                    : 'scale-110 border-navy bg-navy text-on-celestial shadow-glow'),
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
                'text-sub transition-colors duration-300',
                active
                  ? dark
                    ? 'font-semibold text-on-celestial'
                    : 'font-semibold text-ink'
                  : done
                    ? dark
                      ? 'text-on-celestial-muted'
                      : 'text-purple'
                    : dark
                      ? 'text-on-celestial-faint'
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
