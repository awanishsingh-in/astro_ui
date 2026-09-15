import { LogoMark } from '@/components/brand/Logo'
import { ReadingActions } from '@/components/readings/ReadingActions'
import { FollowUpQuestion } from '@/components/reading-parts/FollowUpQuestion'
import type { Answer, Reading } from '@/types/readings'
import { bhavaRef, GRAHAS } from '@/utils/astro'
import { formatDateShort } from '@/utils/format'
import { cn } from '@/utils/cn'

/** User turn — right-aligned bubble, ChatGPT-style. */
export function UserMessage({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn('flex justify-end animate-rise', className)}>
      <div className="max-w-[min(100%,32rem)] rounded-3xl rounded-br-md bg-navy px-4 py-3 text-on-celestial shadow-card sm:px-5 sm:py-3.5">
        <p className="text-body text-pretty whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  )
}

/** Typing / chart-reading indicator while the answer is prepared. */
export function AssistantThinking({ label = 'Reading your chart…' }: { label?: string }) {
  return (
    <div className="flex gap-3 animate-rise sm:gap-4">
      <AssistantAvatar />
      <div className="min-w-0 flex-1 pt-1">
        <p className="font-mono text-label uppercase tracking-wide text-gold-deep">Cyklos</p>
        <div className="mt-3 flex items-center gap-3 text-muted">
          <span className="flex gap-1" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1.5 rounded-full bg-faint animate-pulse"
                style={{ animationDelay: `${i * 160}ms` }}
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
        <p className="font-mono text-label uppercase tracking-wide text-gold-deep">Cyklos</p>
        <p className="mt-2 text-body text-critical text-pretty">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 text-sm font-semibold text-navy hover:text-gold-deep"
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
      <div className="min-w-0 flex-1 space-y-4 pt-0.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-label uppercase tracking-wide text-gold-deep">Cyklos</p>
          <ReadingActions reading={reading} className="-mr-2" />
        </div>

        <div className="prose-chat space-y-4 text-body text-ink leading-relaxed">
          <p className="text-heading font-semibold text-balance sm:text-title">{answer.verdict}</p>

          <p className="text-purple text-pretty">{answer.reason}</p>

          {answer.points.length > 0 && (
            <ul className="space-y-2.5 border-l border-border pl-4">
              {answer.points.map((point) => (
                <li key={point} className="text-pretty text-purple">
                  <span className="mr-2 text-gold" aria-hidden>
                    ·
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          )}

          {answer.window && (
            <p className="rounded-control bg-surface-sunken px-3.5 py-2.5 font-mono text-data text-muted">
              <span className="text-gold-deep">Window</span>
              {' · '}
              {formatDateShort(answer.window.start)} – {formatDateShort(answer.window.end)}
              {answer.window.driver ? ` · ${answer.window.driver}` : ''}
            </p>
          )}

          <SourceFootnote answer={answer} />

          <p className="text-sm text-muted text-pretty">
            <span className="font-medium text-purple">Limit · </span>
            {answer.limits}
          </p>

          {answer.questionBack && (
            <p className="text-pretty text-purple italic">{answer.questionBack}</p>
          )}
        </div>

        {answer.followUps.length > 0 && (
          <div className="space-y-2.5 pt-1">
            <p className="font-mono text-label uppercase text-muted">Continue</p>
            <ul className="flex flex-wrap gap-2">
              {answer.followUps.map((question) => (
                <li key={question}>
                  <FollowUpQuestion question={question} onAsk={onAsk} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function AssistantAvatar() {
  return (
    <div
      aria-hidden
      className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-gold-border/50 bg-navy-soft sm:size-9"
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
    <p className="font-mono text-label uppercase tracking-wide text-muted">
      <span className="text-gold-deep">Read from</span>
      {' · '}
      {parts.join(' · ')}
    </p>
  )
}
