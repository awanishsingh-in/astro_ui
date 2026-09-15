import { RotateCw, TriangleAlert } from 'lucide-react'
import type { AppError } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Button } from './Button'

export interface ErrorStateProps {
  error?: AppError
  /** Wired to `useAsync().retry`. Hidden when the error is not retryable. */
  onRetry?: () => void
  title?: string
  variant?: 'page' | 'inline'
  className?: string
}

export function ErrorState({
  error,
  onRetry,
  title = 'This did not load',
  variant = 'page',
  className,
}: ErrorStateProps) {
  const message = error?.message ?? 'Something went wrong. Try again.'
  const canRetry = Boolean(onRetry) && error?.retryable !== false

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center text-center',
        variant === 'page' ? 'gap-4 px-6 py-16' : 'gap-3 px-4 py-8',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'inline-flex items-center justify-center rounded-full',
          'border border-critical/20 bg-critical-soft text-critical',
          variant === 'page' ? 'size-14 [&_svg]:size-6' : 'size-11 [&_svg]:size-5',
        )}
      >
        <TriangleAlert />
      </span>
      <div className="max-w-sm space-y-1.5">
        <p className={cn('font-semibold text-ink', variant === 'page' ? 'text-heading' : 'text-sub')}>
          {title}
        </p>
        <p className="text-sm text-muted text-pretty">{message}</p>
        {error?.code && (
          <p className="font-mono text-label uppercase text-muted">{error.code}</p>
        )}
      </div>
      {canRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} iconLeft={<RotateCw className="size-4" />}>
          Try again
        </Button>
      )}
    </div>
  )
}
