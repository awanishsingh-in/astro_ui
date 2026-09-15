import { ArrowUpRight } from 'lucide-react'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import type { QuestionTheme } from '@/data/question-themes'
import { cn } from '@/utils/cn'
import { bhavaRef } from '@/utils/astro'

export interface SuggestedQuestionCardProps {
  theme: QuestionTheme
  onAsk: (question: string) => void
  className?: string
}

/**
 * A theme, not a prompt.
 *
 * A generic assistant offers example sentences. This card names the *bhava the
 * answer would come out of* and the grahas that would be cited, so choosing
 * one teaches how the product reads: a question about work is a question about
 * bh 10, and the card says so before you ask it.
 */
export function SuggestedQuestionCard({ theme, onAsk, className }: SuggestedQuestionCardProps) {
  return (
    <div
      className={cn(
        'group flex flex-col gap-3 rounded-card border border-border bg-surface p-4',
        'shadow-card transition-[border-color,box-shadow] duration-150 ease-out-soft',
        'hover:border-border-strong hover:shadow-raised',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sub font-semibold text-ink">{theme.label}</p>
          <p className="mt-0.5 font-mono text-label uppercase text-gold-deep">
            {bhavaRef(theme.bhava)} · {theme.reads}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5">
          {theme.grahas.map((code) => (
            <PlanetGlyph key={code} code={code} size="sm" />
          ))}
        </span>
      </div>

      <ul className="space-y-1">
        {theme.questions.map((question, index) => (
          <li key={question}>
            <button
              type="button"
              onClick={() => onAsk(question)}
              className={cn(
                'flex min-h-11 w-full items-center gap-2 rounded-xs py-2 text-left text-sm',
                'transition-colors duration-150 hover:text-ink',
                index === 0 ? 'text-purple' : 'text-muted',
              )}
            >
              <span className="min-w-0 flex-1 text-pretty">{question}</span>
              <ArrowUpRight
                aria-hidden
                className="size-3.5 shrink-0 text-faint transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
