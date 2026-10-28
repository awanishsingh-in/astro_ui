import { FileText } from 'lucide-react'
import type { ChatAttachment } from '@/ask/chat-store'
import { LogoMark } from '@/components/brand/Logo'
import { ReadingActions } from '@/components/readings/ReadingActions'
import { FollowUpQuestion } from '@/components/reading-parts/FollowUpQuestion'
import type { Answer, Reading } from '@/types/readings'
import { bhavaRef, GRAHAS } from '@/utils/astro'
import { formatDateShort } from '@/utils/format'
import { cn } from '@/utils/cn'

/** User turn — right-aligned bubble, ChatGPT-style. */
export function UserMessage({
  text,
  attachments,
  className,
}: {
  text: string
  attachments?: ChatAttachment[]
  className?: string
}) {
  return (
    <div className={cn('flex justify-end animate-rise', className)}>
      <div className="max-w-[min(100%,32rem)] space-y-2 rounded-card rounded-br-md border border-border/30 bg-surface-accent px-4 py-3 text-text-primary shadow-card sm:px-5 sm:py-3.5">
        {attachments && attachments.length > 0 && (
          <ul className="flex flex-col gap-2">
            {attachments.map((file) => (
              <li
                key={file.id}
                className="flex items-center gap-2.5 overflow-hidden rounded-control border border-border/30 bg-bg/30 px-2.5 py-2"
              >
                {file.kind === 'image' && file.previewUrl ? (
                  <img
                    src={file.previewUrl}
                    alt=""
                    className="size-12 shrink-0 rounded-control object-cover"
                  />
                ) : (
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-control bg-surface-mid/40 text-silver-300">
                    <FileText className="size-5" strokeWidth={1.5} />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{file.name}</span>
                  <span className="block text-[11px] text-text-secondary">
                    {file.kind === 'pdf' ? 'PDF kundli' : 'Image'} · {file.sizeLabel}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
        {text ? <p className="text-body text-pretty whitespace-pre-wrap">{text}</p> : null}
      </div>
    </div>
  )
}

/** Typing / chart-reading indicator while the answer is prepared. */
export function AssistantThinking({
  label = 'Consulting the stars…',
}: {
  label?: string
}) {
  return (
    <div className="flex gap-3 animate-rise sm:gap-4">
      <AssistantAvatar />
      <div className="min-w-0 flex-1 rounded-card border border-border/30 bg-card-gradient px-4 py-3 backdrop-blur-[12px] pt-3">
        <p className="eyebrow">Cyklos</p>
        <div className="mt-3 flex items-center gap-3 text-text-secondary">
          <span className="flex gap-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1.5 rounded-full bg-primary animate-twinkle"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </span>
          <span className="text-sm">{label}</span>
        </div>
      </div>
    </div>
  )
}

export function AssistantError({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="flex gap-3 animate-rise sm:gap-4">
      <AssistantAvatar />
      <div className="min-w-0 flex-1 pt-1">
        <p className="eyebrow">Cyklos</p>
        <p className="mt-2 text-body text-error text-pretty">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 text-sm font-semibold text-blue-light hover:text-text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

/**
 * Assistant turn — Claude/ChatGPT-style prose reply.
 *
 * Chart structure is still underneath (verdict, reason, points, source), but
 * it reads as a written answer rather than an editorial card layout.
 */
export function AssistantMessage({
  reading,
  onAsk,
  className,
}: {
  reading: Reading
  onAsk: (question: string) => void
  className?: string
}) {
  const { answer } = reading

  return (
    <div className={cn('flex gap-3 animate-rise sm:gap-4', className)}>
      <AssistantAvatar />
      <div className="min-w-0 flex-1 space-y-4 rounded-card border border-border/30 bg-card-gradient px-4 py-4 backdrop-blur-[12px] sm:px-5">
        <p className="eyebrow">Cyklos</p>

        <div className="prose-chat space-y-4 text-body text-text-primary leading-relaxed">
          <p className="font-serif text-heading font-semibold text-balance sm:text-title">
            {answer.verdict}
          </p>

          <p className="text-text-secondary text-pretty">{answer.reason}</p>

          {answer.points.length > 0 && (
            <ul className="space-y-2.5 border-l border-[rgba(184,50,122,0.35)] pl-4">
              {answer.points.map((point) => (
                <li key={point} className="text-pretty text-text-secondary">
                  <span className="mr-2 text-silver-400" aria-hidden>
                    ·
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          )}

          {answer.window && (
            <p className="rounded-control bg-bg/50 px-3.5 py-2.5 font-mono text-data text-text-muted">
              <span className="text-silver-400">Window</span>
              {' · '}
              {formatDateShort(answer.window.start)} – {formatDateShort(answer.window.end)}
              {answer.window.driver ? ` · ${answer.window.driver}` : ''}
            </p>
          )}

          <SourceFootnote answer={answer} />

          <p className="text-sm text-text-secondary text-pretty">
            <span className="font-medium text-text-highlight">Limit · </span>
            {answer.limits}
          </p>

          {answer.questionBack && (
            <p className="text-pretty text-text-secondary italic">{answer.questionBack}</p>
          )}
        </div>

        <ReadingActions reading={reading} className="-ml-2" />

        {answer.followUps.length > 0 && (
          <ul className="flex flex-col gap-2 pt-1">
            {answer.followUps.map((question) => (
              <li key={question} className="min-w-0">
                <FollowUpQuestion
                  question={question}
                  onAsk={onAsk}
                  className="w-full justify-between"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function AssistantAvatar() {
  return (
    <div
      aria-hidden
      className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-[rgba(184,50,122,0.35)] bg-surface-accent text-silver-300 sm:size-9"
    >
      <LogoMark className="size-4 sm:size-[1.125rem]" />
    </div>
  )
}

function SourceFootnote({ answer }: { answer: Answer }) {
  const { source } = answer
  const parts: string[] = []
  if (source.bhava) parts.push(bhavaRef(source.bhava))
  if (source.grahas.length) {
    parts.push(source.grahas.map((code) => GRAHAS[code].name).join(', '))
  }
  if (source.dashaPath) parts.push(source.dashaPath)
  if (source.note) parts.push(source.note)

  if (parts.length === 0) return null

  return (
    <p className="font-mono text-label uppercase tracking-[0.15em] text-text-muted">
      <span className="text-silver-400">Read from</span>
      {' · '}
      {parts.join(' · ')}
    </p>
  )
}
