import { ArrowRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface FollowUpQuestionProps {
  question: string
  onAsk: (question: string) => void
  className?: string
}

/** One follow-up. Asking it starts the flow again, from this answer. */
export function FollowUpQuestion({ question, onAsk, className }: FollowUpQuestionProps) {
  return (
    <button
      type="button"
      onClick={() => onAsk(question)}
      className={cn(
        'group inline-flex min-h-11 items-center gap-2 rounded-control border border-border',
        'bg-surface px-4 py-2.5 text-sm text-purple',
        'transition-[background-color,border-color,color,transform] duration-150 ease-out-soft',
        'hover:border-border-strong hover:bg-navy-soft hover:text-ink active:scale-[0.98]',
        className,
      )}
    >
      {question}
      <ArrowRight
        aria-hidden
        className="size-3.5 text-faint transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </button>
  )
}

export interface FollowUpQuestionsProps {
  questions: string[]
  onAsk: (question: string) => void
  /** Part 6 — the single question the app asks back. */
  questionBack?: string
  className?: string
}

/**
 * Parts 6 and 7 — the question back, then two or three ways to go further.
 *
 * The question back comes first and is not a button: the app is narrowing its
 * own reading, not handing the work back. The follow-ups below it are.
 */
export function FollowUpQuestions({
  questions,
  onAsk,
  questionBack,
  className,
}: FollowUpQuestionsProps) {
  return (
    <div className={cn('space-y-8', className)}>
      {questionBack && (
        <div className="border-t border-border pt-8">
          <p className="font-mono text-label uppercase text-muted">One question back</p>
          <p className="mt-2 text-body text-ink text-pretty">{questionBack}</p>
        </div>
      )}

      {questions.length > 0 && (
        <div className="space-y-3">
          <p className="font-mono text-label uppercase text-muted">Or follow it further</p>
          <ul className="flex flex-wrap gap-2">
            {questions.map((question) => (
              <li key={question}>
                <FollowUpQuestion question={question} onAsk={onAsk} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
