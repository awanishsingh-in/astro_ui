import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { useField } from './Field'

interface BaseProps {
  invalid?: boolean
}

export type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>

/** The multi-line counterpart to `Input`, sharing its border and focus ring. */
export function Textarea({ invalid, className, rows = 4, ...rest }: TextareaProps) {
  const field = useField()
  const hasError = invalid ?? field?.hasError ?? false

  return (
    <textarea
      id={field?.inputId}
      aria-describedby={field?.describedBy}
      aria-invalid={hasError || undefined}
      rows={rows}
      className={cn(
        'w-full resize-y rounded-control border bg-surface px-3.5 py-3 text-[0.9375rem] text-ink',
        'transition-[border-color,box-shadow] duration-150 ease-out-soft outline-none',
        'focus:border-navy focus:shadow-focus disabled:bg-surface-sunken disabled:text-faint',
        hasError ? 'border-critical' : 'border-border',
        className,
      )}
      {...rest}
    />
  )
}
