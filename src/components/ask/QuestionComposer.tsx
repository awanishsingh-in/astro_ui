import { ArrowUp, FileText, ImageIcon, Paperclip, X } from 'lucide-react'
import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import type { ChatAttachment } from '@/ask/chat-store'
import { cn } from '@/utils/cn'
import { RASHIS } from '@/utils/astro'

/** Kundli PDFs, screenshots, PNG, and JPG/JPEG. */
export const ASK_UPLOAD_ACCEPT =
  'application/pdf,image/png,image/jpeg,image/jpg,.pdf,.png,.jpg,.jpeg'

const MAX_ATTACHMENTS = 4
const MAX_FILE_BYTES = 8 * 1024 * 1024

export interface QuestionComposerProps {
  onAsk: (question: string, attachments?: ChatAttachment[]) => void
  placeholder?: string
  /** `hero` is the prominent panel; `bar` is the compact sticky variant. */
  variant?: 'hero' | 'bar'
  /** Kept for call sites; hero uses purple-glass composer surface. */
  tone?: 'light' | 'dark' | 'adventure'
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
  /** Show the attach control (Ask page). Off on Home / onboarding shortcuts. */
  allowUpload?: boolean
  className?: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.readAsDataURL(file)
  })
}

async function fileToAttachment(file: File): Promise<ChatAttachment> {
  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  const isImage =
    file.type.startsWith('image/') ||
    /\.(png|jpe?g)$/i.test(file.name)

  if (!isPdf && !isImage) {
    throw new Error('Use a PDF kundli, PNG, or JPG/JPEG image.')
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('That file is too large. Try one under 8 MB.')
  }

  const previewUrl = isImage ? await readAsDataUrl(file) : undefined
  return {
    id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    kind: isPdf ? 'pdf' : 'image',
    previewUrl,
    sizeLabel: formatSize(file.size),
  }
}

/**
 * The primary control on the screen — everything else is a shortcut into it.
 *
 * A textarea rather than an input, because questions are sentences: it grows
 * to three lines on the hero, and Enter submits while Shift+Enter breaks the line.
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
  allowUpload = false,
  className,
}: QuestionComposerProps) {
  const [value, setValue] = useState('')
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [attachError, setAttachError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const fieldId = useId()
  const canSend = value.trim().length > 0 || attachments.length > 0
  const hero = variant === 'hero'
  const dark = tone === 'dark'
  const adventure = tone === 'adventure'
  const night = dark || adventure
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
    const text =
      value.trim() ||
      (attachments.length === 1
        ? `Please read this ${attachments[0].kind === 'pdf' ? 'kundli' : 'image'}.`
        : 'Please read the files I shared.')
    onAsk(text, attachments.length > 0 ? attachments : undefined)
    setValue('')
    setAttachments([])
    setAttachError(null)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  const onPickFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const list = event.target.files
    event.target.value = ''
    if (!list?.length) return
    if (locked) {
      requestUnlock()
      return
    }

    setAttachError(null)
    const room = MAX_ATTACHMENTS - attachments.length
    if (room <= 0) {
      setAttachError(`You can attach up to ${MAX_ATTACHMENTS} files.`)
      return
    }

    const next: ChatAttachment[] = []
    try {
      for (const file of Array.from(list).slice(0, room)) {
        next.push(await fileToAttachment(file))
      }
      setAttachments((prev) => [...prev, ...next])
    } catch (err) {
      setAttachError(err instanceof Error ? err.message : 'Could not add that file.')
    }
  }

  return (
    <div className={cn('w-full min-w-0', className)}>
      <form
        onSubmit={submit}
        onClick={
          locked
            ? (event) => {
                if ((event.target as HTMLElement).closest('textarea, button, input')) return
                requestUnlock()
              }
            : undefined
        }
        className={cn(
          'ask-composer group relative isolate overflow-hidden rounded-card border',
          'transition-[border-color,box-shadow,transform] duration-300 ease-out-soft',
          locked && 'cursor-pointer',
          // Purple glass composer — silver hairline, magenta glow; copper only on send when ready
          // Light mode overrides live in moonlit-pearl.css via .ask-composer
          cn(
            'rounded-[1.5rem] border border-[rgba(184,50,122,0.22)]',
            'bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_40%),linear-gradient(160deg,#2A1A32_0%,#140E1B_100%)]',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_48px_-12px_rgba(184,50,122,0.28),0_20px_50px_-24px_rgba(8,6,15,0.85)]',
            'backdrop-blur-md',
            'focus-within:border-[rgba(184,50,122,0.4)] focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_56px_-10px_rgba(184,50,122,0.35),0_20px_50px_-24px_rgba(8,6,15,0.9)]',
            !hero && 'rounded-[1.35rem]',
          ),
        )}
      >
        {hero && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-[rgba(184,50,122,0.18)] to-transparent"
          />
        )}

        {hero && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10">
            <div className="flex items-center justify-between px-5 pt-3">
              {RASHIS.map((rashi, i) => (
                <span
                  key={rashi.name}
                  className={cn(
                    'text-[13px] leading-none text-silver-400 opacity-70',
                    'transition-[color,opacity] duration-300 ease-out-soft',
                    'hover:text-silver-300 hover:opacity-100',
                  )}
                  style={{ transitionDelay: `${i * 18}ms` }}
                >
                  {rashi.glyph}
                </span>
              ))}
            </div>
            <span
              className="mt-2 block h-px scale-x-100 bg-linear-to-r from-transparent via-[rgba(184,50,122,0.35)] to-transparent opacity-70"
            />
          </div>
        )}

        <label htmlFor={fieldId} className="sr-only">
          Ask a question about your chart
        </label>

        {attachments.length > 0 && (
          <ul
            className={cn(
              'relative z-10 flex flex-wrap gap-2',
              hero ? 'px-4 pb-0 pt-11' : 'px-2 pt-2',
            )}
          >
            {attachments.map((file) => (
              <li
                key={file.id}
                className={cn(
                  'flex max-w-full items-center gap-2 rounded-control border px-2 py-1.5',
                  night
                    ? 'border-white/15 bg-white/5 text-white/85'
                    : 'border-border bg-surface-sunken text-ink',
                )}
              >
                {file.kind === 'image' && file.previewUrl ? (
                  <img
                    src={file.previewUrl}
                    alt=""
                    className="size-8 shrink-0 rounded-xs object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className={cn(
                      'inline-flex size-8 shrink-0 items-center justify-center rounded-xs',
                      night ? 'bg-white/10 text-silver-300' : 'bg-[rgba(184,50,122,0.12)] text-silver-300',
                    )}
                  >
                    {file.kind === 'pdf' ? (
                      <FileText className="size-3.5" />
                    ) : (
                      <ImageIcon className="size-3.5" />
                    )}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium">{file.name}</span>
                  <span
                    className={cn(
                      'block text-[10px]',
                      night ? 'text-white/40' : 'text-muted',
                    )}
                  >
                    {file.sizeLabel}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  disabled={locked}
                  onClick={() =>
                    setAttachments((prev) => prev.filter((item) => item.id !== file.id))
                  }
                  className={cn(
                    'inline-flex size-6 shrink-0 items-center justify-center rounded-full',
                    night
                      ? 'text-white/50 hover:bg-white/10 hover:text-white'
                      : 'text-muted hover:bg-navy-soft hover:text-ink',
                  )}
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div
          className={cn(
            'relative flex items-end gap-2 sm:gap-3',
            hero
              ? attachments.length > 0
                ? 'px-4 pb-3 pt-3'
                : 'px-4 pb-3 pt-11'
              : 'px-3 py-2.5',
          )}
        >
          {allowUpload && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept={ASK_UPLOAD_ACCEPT}
                multiple
                className="sr-only"
                onChange={onPickFiles}
              />
              <button
                type="button"
                aria-label="Attach kundli PDF, screenshot, PNG, or JPG"
                disabled={locked}
                onClick={() => {
                  if (locked) {
                    requestUnlock()
                    return
                  }
                  fileRef.current?.click()
                }}
                className={cn(
                  'inline-flex shrink-0 items-center justify-center rounded-full transition-colors',
                  hero ? 'size-11' : 'size-9',
                  'text-silver-400 hover:bg-white/[0.06] hover:text-silver-200',
                  locked && 'cursor-pointer opacity-70',
                )}
              >
                <Paperclip className={hero ? 'size-5' : 'size-4'} strokeWidth={2} />
              </button>
            </>
          )}

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
              'text-text placeholder:text-text-muted',
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
              hero ? 'size-12' : 'size-10',
              locked || canSend
                ? 'btn-primary rounded-full hover:scale-[1.03] active:scale-100'
                : 'rounded-full border border-[rgba(184,50,122,0.25)] bg-[rgba(20,14,27,0.85)] text-silver-500',
            )}
          >
            <ArrowUp className={hero ? 'size-5' : 'size-4'} strokeWidth={2.25} />
          </button>
        </div>

        {attachError && (
          <p
            role="alert"
            className={cn(
              'px-4 pb-3 text-xs',
              night ? 'text-error' : 'text-critical',
            )}
          >
            {attachError}
          </p>
        )}
      </form>

      {status ? (
        <p
          className={cn(
            'mt-2 font-mono text-label uppercase tracking-[0.12em]',
            night ? 'text-white/35' : 'text-muted',
          )}
        >
          {status}
        </p>
      ) : null}
    </div>
  )
}
