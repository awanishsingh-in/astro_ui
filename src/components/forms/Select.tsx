import { ChevronDown } from 'lucide-react'
import type { SelectHTMLAttributes } from 'react'
import type { SelectOption } from '@/types/ui'
import { cn } from '@/utils/cn'
import { useField } from './Field'

interface BaseProps<T extends string> {
  options: SelectOption<T>[]
  placeholder?: string
  invalid?: boolean
  /** `lg` (56px) is the form default; `md` suits inline pickers. */
  inputSize?: 'md' | 'lg'
}

export type SelectProps<T extends string = string> = BaseProps<T> &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'>

/**
 * The native select, styled. On mobile this gives the platform picker, which
 * beats any custom list for reliability and accessibility.
 */
export function Select<T extends string = string>({
  options,
  placeholder,
  invalid,
  inputSize = 'lg',
  className,
  ...rest
}: SelectProps<T>) {
  const field = useField()
  const hasError = invalid ?? field?.hasError ?? false

  return (
    <div
      className={cn(
        'relative flex items-center rounded-control border bg-surface',
        inputSize === 'md' ? 'h-control-md' : 'h-control-lg',
        'transition-[border-color,box-shadow] duration-150 ease-out-soft',
        'focus-within:border-navy focus-within:shadow-focus',
        hasError ? 'border-critical' : 'border-border',
        className,
      )}
    >
      <select
        id={rest.id ?? field?.inputId}
        aria-describedby={field?.describedBy}
        aria-invalid={hasError || undefined}
        className="h-full w-full appearance-none bg-transparent pl-3.5 pr-11 text-[0.9375rem] text-ink outline-none disabled:text-faint"
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3.5 size-5 text-muted" />
    </div>
  )
}
