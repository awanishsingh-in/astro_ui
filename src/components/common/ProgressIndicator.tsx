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
 * Multi-step progress — constellation-style dots connected by faint gold lines.
 */
export function ProgressIndicator({
  steps,
  current,
  variant = 'bar',
  tone: _tone = 'dark',
  stagger = false,
  className,
}: ProgressIndicatorProps) {
  const total = steps.length
  const clamped = Math.min(Math.max(current, 0), total - 1)

  if (variant === 'bar') {
    return (
      <div className={cn('space-y-3', className)}>
        <p
          className="eyebrow text-silver-300"
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
          className="flex items-center gap-0"
        >
          {steps.map((step, index) => {
            const filled = index <= clamped
            const isCurrent = index === clamped
            return (
              <span key={step.id} className="flex flex-1 items-center last:flex-none">
                <span
                  className={cn(
                    'relative inline-flex size-2.5 shrink-0 rounded-full transition-all duration-[250ms] ease-out-soft',
                    filled ? 'bg-primary shadow-glow' : 'bg-border/40',
                    isCurrent && 'size-3 motion-safe:animate-pulse-soft',
                  )}
                  title={step.label}
                />
                {index < total - 1 && (
                  <span
                    className={cn(
                      'mx-1 h-px flex-1',
                      index < clamped
                        ? 'bg-primary/50'
                        : 'bg-border/25',
                    )}
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
              'flex items-center gap-3 motion-safe:transition-[opacity,transform] motion-safe:duration-[250ms]',
              stagger && 'motion-safe:animate-auth-step',
            )}
            style={stagger ? { animationDelay: `${140 + index * 100}ms` } : undefined}
          >
            <span
              aria-hidden
              className={cn(
                'inline-flex size-7 shrink-0 items-center justify-center rounded-full border',
                'font-mono text-[11px] transition-all duration-[250ms] ease-out-soft',
                done && 'border-primary bg-gold-gradient text-on-primary shadow-glow',
                active &&
                  'scale-110 border-primary bg-gold-gradient text-on-primary shadow-glow motion-safe:animate-pulse-soft',
                !done &&
                  !active &&
                  'border-border/40 text-text-muted',
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={1.5} /> : index + 1}
            </span>
            <span
              className={cn(
                'text-sub transition-colors duration-[250ms]',
                active
                  ? 'font-semibold text-text-primary'
                  : done
                    ? 'text-text-secondary'
                    : 'text-text-muted',
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
