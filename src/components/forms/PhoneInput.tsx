import type { InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { useField } from './Field'

export type PhoneInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'prefix' | 'size' | 'type' | 'inputMode'
> & {
  invalid?: boolean
}

/**
 * Indian mobile entry — dial code sits outside the field so browser autofill /
 * accessory chrome cannot park on the +91 divider.
 */
export function PhoneInput({ invalid, className, disabled, ...rest }: PhoneInputProps) {
  const field = useField()
  const hasError = invalid ?? field?.hasError ?? false

  return (
    <div
      className={cn(
        'flex h-control-lg items-stretch overflow-hidden rounded-control border bg-surface',
        'transition-[border-color,box-shadow,transform] duration-200 ease-out-soft',
        'focus-within:border-copper focus-within:shadow-glow motion-safe:focus-within:scale-[1.01]',
        hasError ? 'border-critical' : 'border-border',
        disabled && 'bg-surface-sunken text-faint',
        className,
      )}
    >
      <span
        aria-hidden
        className="flex shrink-0 items-center border-r border-border px-3.5 font-mono text-data-lg text-purple"
      >
        +91
      </span>
      <input
        id={field?.inputId}
        aria-describedby={field?.describedBy}
        aria-invalid={hasError || undefined}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        name="tel"
        disabled={disabled}
        className={cn(
          'h-full min-w-0 flex-1 bg-transparent px-3.5 font-mono text-data-lg text-ink outline-none',
          'placeholder:text-faint',
        )}
        {...rest}
      />
    </div>
  )
}
