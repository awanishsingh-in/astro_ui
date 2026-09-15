import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { useField } from './Field'

export type InputSize = 'sm' | 'md' | 'lg'

interface BaseProps {
  /** Fixed text before the value, e.g. the `+91` dial code. */
  prefix?: ReactNode
  /** Trailing adornment, e.g. a calendar or clock icon. */
  suffix?: ReactNode
  /** Leading icon inside the control, e.g. a search glyph. */
  icon?: ReactNode
  /** Use tabular mono — for degrees, dates and codes. */
  mono?: boolean
  invalid?: boolean
  /** `lg` (56px) is the form default; `md`/`sm` suit toolbars and filters. */
  inputSize?: InputSize
  /** Sunken fill instead of white — for search inside an already-white card. */
  tone?: 'surface' | 'sunken'
}

export type InputProps = BaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'>

const SIZES: Record<InputSize, { shell: string; text: string; pad: string }> = {
  sm: { shell: 'h-control-sm', text: 'text-sm', pad: 'px-3' },
  md: { shell: 'h-control-md', text: 'text-sub', pad: 'px-3.5' },
  lg: { shell: 'h-control-lg', text: 'text-[0.9375rem]', pad: 'px-3.5' },
}

/** One control, three heights. `lg` is what the birth-details form uses. */
export function Input({
  prefix,
  suffix,
  icon,
  mono,
  invalid,
  inputSize = 'lg',
  tone = 'surface',
  className,
  ...rest
}: InputProps) {
  const field = useField()
  const hasError = invalid ?? field?.hasError ?? false
  const size = SIZES[inputSize]

  return (
    <div
      className={cn(
        'flex items-center overflow-hidden rounded-control border',
        'transition-[border-color,box-shadow] duration-150 ease-out-soft',
        'focus-within:border-navy focus-within:shadow-focus',
        size.shell,
        tone === 'sunken' ? 'bg-surface-sunken' : 'bg-surface',
        hasError ? 'border-critical' : 'border-border',
        rest.disabled && 'bg-surface-sunken text-faint',
        className,
      )}
    >
      {prefix && (
        <span
          className={cn(
            'flex h-full items-center border-r border-border font-mono text-data text-purple',
            size.pad,
          )}
        >
          {prefix}
        </span>
      )}
      {icon && (
        <span aria-hidden className={cn('flex shrink-0 items-center pl-3.5 text-muted [&_svg]:size-4')}>
          {icon}
        </span>
      )}
      <input
        id={field?.inputId}
        aria-describedby={field?.describedBy}
        aria-invalid={hasError || undefined}
        className={cn(
          'h-full min-w-0 flex-1 bg-transparent text-ink outline-none',
          size.pad,
          mono ? 'font-mono' : size.text,
          mono && (inputSize === 'sm' ? 'text-data' : 'text-data-lg'),
        )}
        {...rest}
      />
      {suffix && (
        <span className="flex h-full items-center pr-3.5 text-muted [&_svg]:size-5">{suffix}</span>
      )}
    </div>
  )
}
