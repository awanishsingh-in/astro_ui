import { useId } from 'react'
import { cn } from '@/utils/cn'

export interface ToggleRowProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

/**
 * A switch with its explanation, as one hit target.
 *
 * Built on a real checkbox so it is keyboard- and screen-reader-native; the
 * track and knob are painted from the input's own checked state.
 */
export function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
  className,
}: ToggleRowProps) {
  const id = useId()

  return (
    <div className={cn('flex items-start gap-4 p-4', className)}>
      <label htmlFor={id} className={cn('min-w-0 flex-1', !disabled && 'cursor-pointer')}>
        <span className="block text-sub font-medium text-ink">{label}</span>
        {description && (
          <span className="mt-0.5 block text-sm text-muted text-pretty">{description}</span>
        )}
      </label>

      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer size-0 opacity-0"
        />
        <span
          aria-hidden
          onClick={() => !disabled && onChange(!checked)}
          className={cn(
            'block h-6 w-11 rounded-full transition-colors duration-200 ease-out-soft',
            'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy',
            disabled ? 'cursor-not-allowed bg-border' : 'cursor-pointer',
            !disabled && (checked ? 'bg-navy' : 'bg-border-strong'),
          )}
        >
          <span
            className={cn(
              'mt-0.5 block size-5 rounded-full bg-surface shadow-card transition-transform duration-200 ease-out-soft',
              checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5',
            )}
          />
        </span>
      </span>
    </div>
  )
}
