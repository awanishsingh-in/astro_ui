import { SectionHeader } from '@/components/common/SectionHeader'
import { QuestionCard } from '@/components/readings/QuestionCard'
import type { SuggestedQuestion } from '@/types/readings'
import { cn } from '@/utils/cn'

export interface SuggestedQuestionsProps {
  questions: SuggestedQuestion[]
  onSelect: (question: string) => void
  className?: string
}

/**
 * Starter prompts. Each carries the glyph of the graha its answer would be
 * read from, so the list quietly teaches what the product does with a question.
 */
export function SuggestedQuestions({ questions, onSelect, className }: SuggestedQuestionsProps) {
  return (
    <section aria-labelledby="suggested-title" className={cn('space-y-4', className)}>
      <SectionHeader
        as="h2"
        size="sm"
        title={<span id="suggested-title">Start with one of these</span>}
        description="Or ask anything in your own words — English or Hindi."
      />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {questions.map((question) => (
          <li key={question.id}>
            <QuestionCard question={question} onSelect={(picked) => onSelect(picked.text)} />
          </li>
        ))}
      </ul>
    </section>
  )
}
