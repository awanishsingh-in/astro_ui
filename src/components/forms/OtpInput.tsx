import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { cn } from '@/utils/cn'

export interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  /** Fired when the last box is filled, so the form can submit itself. */
  onComplete?: (value: string) => void
  length?: number
  invalid?: boolean
  disabled?: boolean
  /** Focus the first empty box on mount. */
  autoFocus?: boolean
  label?: string
  className?: string
}

/**
 * A six-box code entry that behaves the way people expect one to:
 * type to advance, backspace to retreat, arrow keys to move, and a pasted code
 * distributes across the boxes instead of landing in one.
 *
 * Each box carries `autocomplete="one-time-code"` so the platform's SMS
 * autofill can reach it.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  invalid = false,
  disabled = false,
  autoFocus = false,
  label = 'Verification code',
  className,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.padEnd(length, ' ').slice(0, length).split('')

  useEffect(() => {
    if (!autoFocus) return
    const index = Math.min(value.length, length - 1)
    refs.current[index]?.focus()
    // Mount only — re-focusing on every keystroke would fight the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus])

  const commit = (next: string) => {
    const clean = next.replace(/\D/g, '').slice(0, length)
    onChange(clean)
    if (clean.length === length) onComplete?.(clean)
    return clean
  }

  const handleInput = (index: number, raw: string) => {
    const typed = raw.replace(/\D/g, '')
    if (!typed) return

    // Typing over a filled box replaces it; multi-character input (some
    // keyboards deliver the whole code at once) fills forward from here.
    const chars = value.split('')
    for (let i = 0; i < typed.length && index + i < length; i += 1) {
      chars[index + i] = typed[i]
    }
    const next = commit(chars.join('').replace(/\s/g, ''))

    const landed = Math.min(index + typed.length, length - 1)
    if (next.length < length) refs.current[landed]?.focus()
    refs.current[landed]?.select()
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Backspace': {
        event.preventDefault()
        const chars = value.split('')
        if (chars[index]) {
          // Clear this box and stay.
          chars[index] = ''
          commit(chars.join(''))
        } else if (index > 0) {
          // Already empty — clear the one before and move there.
          chars[index - 1] = ''
          commit(chars.join(''))
          refs.current[index - 1]?.focus()
        }
        break
      }
      case 'ArrowLeft':
        event.preventDefault()
        refs.current[Math.max(0, index - 1)]?.focus()
        break
      case 'ArrowRight':
        event.preventDefault()
        refs.current[Math.min(length - 1, index + 1)]?.focus()
        break
      default:
        break
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    const next = commit(pasted)
    refs.current[Math.min(next.length, length - 1)]?.focus()
  }

  return (
    <div
      role="group"
      aria-label={label}
      className={cn('flex items-center gap-2 sm:gap-2.5', className)}
    >
      {digits.map((digit, index) => {
        const char = digit.trim()
        return (
          <input
            key={index}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of ${length}`}
            aria-invalid={invalid || undefined}
            value={char}
            onChange={(event) => handleInput(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
            className={cn(
              'h-14 min-w-0 flex-1 rounded-control border bg-surface text-center',
              'font-mono text-[22px] text-ink outline-none transition-[border-color,box-shadow]',
              'duration-150 ease-out-soft focus:border-navy focus:shadow-focus',
              'disabled:bg-surface-sunken disabled:text-faint',
              invalid ? 'border-critical' : char ? 'border-navy' : 'border-border',
            )}
          />
        )
      })}
    </div>
  )
}
