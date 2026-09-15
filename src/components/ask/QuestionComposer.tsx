import { ArrowUp } from 'lucide-react'
import { useId, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { RASHIS } from '@/utils/astro'

export interface QuestionComposerProps {
  onAsk: (question: string) => void
  placeholder?: string
  /** `hero` is the prominent panel; `bar` is the compact sticky variant. */
  variant?: 'hero' | 'bar'
  /** Light sits on canvas pages; dark is for celestial / midnight surfaces. */
  tone?: 'light' | 'dark'
  /** Textarea rows for the hero variant. */
  rows?: number
  autoFocus?: boolean
  /** Fires when the textarea gains or loses focus — used by the celestial scene. */
  onFocusChange?: (focused: boolean) => void
  /**
   * When true, focus and send open the plan paywall instead of chatting.
   * Used for free accounts without Cyklos Plus.
   */
  locked?: boolean
  onLockedAttempt?: () => void
  /** Optional status line rendered under the composer (dark hero). */
  status?: ReactNode
  className?: string
}

/**
 * The primary control on the screen — everything else is a shortcut into it.
 *
 * A textarea rather than an input, because questions are sentences: it grows
 * to three lines on the hero, and Enter submits while Shift+Enter breaks the line.
 *
 * The zodiac runs along the top edge and the footer states where the answer
 * comes from, so the control reads as an instrument aimed at a chart rather
 * than as a generic chat box. On focus the signs lift and the gold edge draws
 * in — the chart coming to attention.
 */
export function QuestionComposer({
  onAsk,
  placeholder = 'Ask a question…',
  variant = 'hero',
  tone = 'light',
  rows,
  autoFocus = false,
  onFocusChange,
  locked = false,
  onLockedAttempt,
  status,
  className,
}: QuestionComposerProps) {
  const [value, setValue] = useState('')
  // Home and Ask can both be mounted during a transition, so the label's
  // `for` needs an id unique to the instance rather than a fixed string.
  const fieldId = useId()
  const canSend = value.trim().length > 0
  const hero = variant === 'hero'
  const dark = tone === 'dark'
  const textareaRows = rows ?? (hero ? 3 : 1)

  const requestUnlock = () => {
    onLockedAttempt?.()
  }

  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    if (locked) {
      requestUnlock()
      return
    }
    if (!canSend) return
    onAsk(value.trim())
    setValue('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <div className={cn('w-full min-w-0', className)}>
      <form
        onSubmit={submit}
        onClick={
          locked
            ? (event) => {
                // Catch taps on the composer chrome (zodiac strip, footer) too.
                if ((event.target as HTMLElement).closest('textarea, button')) return
                requestUnlock()
              }
            : undefined
        }
        className={cn(
          'group relative isolate overflow-hidden rounded-card border',
          'transition-[border-color,box-shadow,transform] duration-300 ease-out-soft',
          locked && 'cursor-pointer',
          dark
            ? cn(
                'border-gold-soft-line/80 bg-indigo-royal/55 shadow-raised backdrop-blur-md',
                'focus-within:border-gold-soft-line focus-within:shadow-overlay',
              )
            : cn(
                'bg-surface focus-within:border-gold focus-within:shadow-overlay',
                hero ? 'border-border-strong/80 shadow-raised' : 'border-border shadow-card',
              ),
        )}
      >
        {/* Soft gold wash behind the zodiac — depth without a glow effect. */}
        {hero && (
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b to-transparent',
              dark ? 'from-gold-soft/20 opacity-80' : 'from-gold-soft/50 opacity-70',
            )}
          />
        )}

        {/*
          The twelve signs along the top edge. Faint at rest; on focus they lift
          to a legible gold and the hairline under them draws across.
        */}
        {hero && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10">
            <div className="flex items-center justify-between px-5 pt-3">
              {RASHIS.map((rashi, i) => (
                <span
                  key={rashi.name}
                  className={cn(
                    'text-[12px] leading-none transition-[color,opacity,transform] duration-300 ease-out-soft',
                    dark
                      ? 'text-gold-soft-line opacity-75 group-focus-within:opacity-100'
                      : 'text-faint opacity-40 group-focus-within:text-gold group-focus-within:opacity-95',
                    'group-focus-within:translate-y-0',
                  )}
                  style={{ transitionDelay: `${i * 18}ms` }}
                >
                  {rashi.glyph}
                </span>
              ))}
            </div>
            <span
              className={cn(
                'mt-2 block h-px origin-left bg-linear-to-r from-transparent via-gold to-transparent',
                'transition-transform duration-500 ease-out-soft',
                dark ? 'scale-x-100 opacity-50' : 'scale-x-0 group-focus-within:scale-x-100',
              )}
            />
          </div>
        )}

        <label htmlFor={fieldId} className="sr-only">
          Ask a question about your chart
        </label>

        <div className={cn('relative flex items-end gap-3', hero ? 'px-4 pb-4 pt-11' : 'p-2')}>
          <textarea
            id={fieldId}
            rows={textareaRows}
            autoFocus={autoFocus && !locked}
            readOnly={locked}
            value={value}
            placeholder={locked ? 'Unlock a plan to message Cyklos…' : placeholder}
            onChange={(event) => {
              if (locked) return
              setValue(event.target.value)
            }}
            onKeyDown={onKeyDown}
            onFocus={() => {
              if (locked) {
                requestUnlock()
                ;(document.activeElement as HTMLElement | null)?.blur?.()
                return
              }
              onFocusChange?.(true)
            }}
            onBlur={() => onFocusChange?.(false)}
            className={cn(
              'min-w-0 flex-1 resize-none bg-transparent outline-none',
              hero ? 'px-1 text-body leading-relaxed lg:text-[1.05rem]' : 'px-2 py-1.5 text-sub',
              dark
                ? 'text-on-celestial placeholder:text-on-celestial-faint'
                : 'text-ink placeholder:text-faint',
              locked && 'cursor-pointer',
            )}
          />

          <button
            type="submit"
            disabled={!locked && !canSend}
            aria-label={locked ? 'Unlock a plan to chat' : 'Ask this question'}
            className={cn(
              'inline-flex shrink-0 items-center justify-center rounded-full',
              'transition-[background-color,transform,box-shadow] duration-200 ease-out-soft',
              hero ? 'size-12' : 'size-9 rounded-control',
              locked || canSend
                ? dark
                  ? 'bg-indigo-royal text-on-celestial shadow-card hover:bg-indigo-deep hover:scale-[1.03] active:scale-100'
                  : 'bg-navy text-on-celestial shadow-card hover:bg-navy-hover hover:scale-[1.03] active:bg-navy-active active:scale-100'
                : dark
                  ? 'bg-midnight/70 text-on-celestial-faint'
                  : 'bg-surface-sunken text-faint',
            )}
          >
            <ArrowUp className={hero ? 'size-5' : 'size-4'} strokeWidth={2.25} />
          </button>
        </div>

        {hero && (
          <p
            className={cn(
              'flex items-center gap-2 border-t px-5 py-2.5 font-mono text-label uppercase tracking-wide',
              dark
                ? 'border-celestial-line/50 bg-midnight/35 text-on-celestial-muted'
                : 'border-gold-border/60 bg-gold-soft/40 text-navy/70',
            )}
          >
            <span aria-hidden className={dark ? 'text-gold-soft-line' : 'text-gold'}>
              ✦
            </span>
            Read from your birth chart · never from a generic horoscope
          </p>
        )}
      </form>

      {status ? (
        <p
          className={cn(
            'mt-2 font-mono text-label uppercase tracking-[0.12em]',
            dark ? 'text-on-celestial-faint' : 'text-muted',
          )}
        >
          {status}
        </p>
      ) : null}
    </div>
  )
}
