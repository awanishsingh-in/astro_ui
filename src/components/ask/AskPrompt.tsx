import { ArrowUpRight } from 'lucide-react'
import type { QuestionTheme } from '@/data/question-themes'
import { cn } from '@/utils/cn'
import { bhavaRef } from '@/utils/astro'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'

export interface AskPromptProps {
  theme: QuestionTheme
  /** Which of the theme's ready-made questions to surface. Defaults to the first. */
  questionIndex?: number
  onAsk: (question: string) => void
  className?: string
  /** Stagger entrance — set from the parent list index. */
  delayMs?: number
}

/**
 * One suggested question as a chat prompt, not a theme brochure.
 *
 * The bhava and grahas stay visible so the shortcut still teaches how the
 * product reads — but the question itself is the thing you tap.
 */
export function AskPrompt({
  theme,
  questionIndex = 0,
  onAsk,
  className,
  delayMs = 0,
}: AskPromptProps) {
  const question = theme.questions[questionIndex] ?? theme.questions[0]

  return (
    <button
      type="button"
      onClick={() => onAsk(question)}
      style={delayMs ? { animationDelay: `${delayMs}ms` } : undefined}
      className={cn(
        'group flex w-full items-start gap-4 rounded-card border border-border/80 bg-surface/80 px-4 py-3.5 text-left',
        'shadow-card backdrop-blur-sm',
        'transition-[border-color,transform,box-shadow,background-color] duration-200 ease-out-soft',
        'hover:-translate-y-0.5 hover:border-gold/50 hover:bg-surface hover:shadow-raised',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20',
        'animate-rise',
        className,
      )}
    >
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-control bg-navy-soft text-navy">
        {theme.grahas[0] ? (
          <PlanetGlyph code={theme.grahas[0]} size="sm" />
        ) : (
          <span className="text-gold">✦</span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sub font-medium text-ink text-pretty transition-colors group-hover:text-navy">
          {question}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-label uppercase text-muted">
          <span className="text-gold-deep">
            {bhavaRef(theme.bhava)} · {theme.reads}
          </span>
          <span aria-hidden className="text-faint">
            ·
          </span>
          <span>{theme.label}</span>
        </span>
      </span>

      <ArrowUpRight
        aria-hidden
        className="mt-1 size-4 shrink-0 text-faint transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold-deep"
      />
    </button>
  )
}
