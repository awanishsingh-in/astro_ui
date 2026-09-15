import { ArrowUpRight } from 'lucide-react'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { themeFor } from '@/data/question-themes'
import type { SuggestedQuestion } from '@/types/readings'
import { cn } from '@/utils/cn'
import { bhavaRef } from '@/utils/astro'

export interface QuestionCardProps {
  question: SuggestedQuestion
  onSelect: (question: SuggestedQuestion) => void
  className?: string
}

/**
 * A starter prompt that shows its own working.
 *
 * The graha and the bhava are not decoration and not stored alongside the
 * text: the card routes the question through `themeFor` — the same router the
 * Ask flow uses — so the line under it names the part of the chart the answer
 * will genuinely be read from. Tapping it teaches the product's premise before
 * the answer arrives.
 */
export function QuestionCard({ question, onSelect, className }: QuestionCardProps) {
  const theme = themeFor(question.text)
  const lead = theme.grahas[0]

  return (
    <button
      type="button"
      onClick={() => onSelect(question)}
      className={cn(
        'group flex w-full items-start gap-3.5 rounded-card border border-border bg-surface p-4 text-left',
        'shadow-card transition-[border-color,background-color] duration-150 ease-out-soft',
        'hover:border-gold-border hover:bg-gold-soft',
        className,
      )}
    >
      {/* The lead graha, ringed the way a chart marks a body. */}
      <span
        aria-hidden
        className={cn(
          'mt-0.5 inline-grid size-9 shrink-0 place-items-center rounded-full border',
          'border-border-strong bg-surface-sunken text-base',
          'transition-colors duration-150 ease-out-soft',
          'group-hover:border-gold group-hover:bg-surface',
        )}
      >
        <PlanetGlyph code={lead} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sub text-ink text-pretty">{question.text}</span>
        <span className="mt-1.5 block font-mono text-label uppercase text-gold-deep">
          {theme.id === 'dasha' ? 'Current dasha' : `${bhavaRef(theme.bhava)} · ${theme.reads}`}
        </span>
      </span>

      <ArrowUpRight
        aria-hidden
        className="mt-1 size-4 shrink-0 text-faint transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-gold-deep"
      />
    </button>
  )
}
