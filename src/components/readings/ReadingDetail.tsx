import { RotateCw } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { ChartLimits, ChartSource } from '@/components/reading-parts/ChartSource'
import { FollowUpQuestions } from '@/components/reading-parts/FollowUpQuestion'
import { KeyPoints } from '@/components/reading-parts/KeyPoints'
import { ReadingReason } from '@/components/reading-parts/ReadingReason'
import { ReadingVerdict } from '@/components/reading-parts/ReadingVerdict'
import { ReadingActions } from '@/components/readings/ReadingActions'
import type { Reading } from '@/types/readings'
import { cn } from '@/utils/cn'
import { formatRelativeDay } from '@/utils/format'

export interface ReadingDetailProps {
  reading: Reading
  onFollowUp?: (question: string) => void
  onAskAgain?: () => void
  className?: string
}

/**
 * A saved reading, in the seven parts every answer has.
 *
 * Each part is its own component, shared with the Ask flow's answer screen —
 * so the structure of an answer is defined once and cannot drift between the
 * screen that produces it and the screen that stores it.
 */
export function ReadingDetail({ reading, onFollowUp, onAskAgain, className }: ReadingDetailProps) {
  const { answer } = reading

  return (
    <article className={cn('mx-auto w-full max-w-reading', className)}>
      {/* 1 · Question */}
      <header className="space-y-4 border-b border-border pb-6">
        <p className="font-mono text-label uppercase text-muted">
          Asked {formatRelativeDay(reading.askedAt)}
        </p>
        <h1 className="text-title font-semibold text-ink text-balance lg:text-title-lg">
          {reading.question}
        </h1>
        <ReadingActions reading={reading} className="-ml-2" />
      </header>

      <ReadingVerdict verdict={answer.verdict} window={answer.window} />
      <ReadingReason reason={answer.reason} />
      <KeyPoints points={answer.points} variant="list" className="mt-6" />

      <ChartSource answer={answer} className="mt-8" />
      <ChartLimits limits={answer.limits} className="mt-4" />

      <FollowUpQuestions
        questions={answer.followUps}
        questionBack={answer.questionBack}
        onAsk={(question) => onFollowUp?.(question)}
        className="mt-8"
      />

      {/* Re-reading against today's period is the product's own idea, so it gets a control. */}
      <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border pt-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={onAskAgain}
          iconLeft={<RotateCw className="size-4" />}
        >
          Ask again now
        </Button>
        <p className="min-w-0 flex-1 text-xs text-muted text-pretty">
          Asked in a different dasha, the same question gets a different answer.
        </p>
      </div>
    </article>
  )
}
