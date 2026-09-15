import { createContext, useContext, useId, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface FieldContextValue {
  inputId: string
  helpId: string
  errorId: string
  hasError: boolean
  describedBy: string | undefined
}

const FieldContext = createContext<FieldContextValue | null>(null)

export function useField(): FieldContextValue | null {
  return useContext(FieldContext)
}

export interface FieldProps {
  label: string
  /** Sits under the control. The reference uses helper text, not placeholders. */
  help?: ReactNode
  error?: string
  required?: boolean
  /** Hide the visible label but keep it for screen readers. */
  labelHidden?: boolean
  children: ReactNode
  className?: string
}

/**
 * Owns the label, helper text, error text and the aria wiring between them.
 * Controls inside read the ids from context, so no call site repeats them.
 */
export function Field({
  label,
  help,
  error,
  required,
  labelHidden,
  children,
  className,
}: FieldProps) {
  const uid = useId()
  const inputId = `${uid}-input`
  const helpId = `${uid}-help`
  const errorId = `${uid}-error`
  const describedBy = [help ? helpId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined

  return (
    <FieldContext.Provider
      value={{ inputId, helpId, errorId, hasError: Boolean(error), describedBy }}
    >
      <div className={cn('flex flex-col', className)}>
        <label
          htmlFor={inputId}
          className={cn(
            'mb-2 font-mono text-label uppercase text-muted',
            labelHidden && 'sr-only',
          )}
        >
          {label}
          {required && <span className="ml-1 text-critical">*</span>}
        </label>

        {children}

        {error ? (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-critical">
            {error}
          </p>
        ) : (
          help && (
            <p id={helpId} className="mt-1.5 text-xs text-muted">
              {help}
            </p>
          )
        )}
      </div>
    </FieldContext.Provider>
  )
}
