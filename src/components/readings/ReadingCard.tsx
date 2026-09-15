import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { AstroDivider } from '@/components/celestial'
import { ReadingWindowChip } from '@/components/readings/ReadingWindowChip'
import { useBookmarks } from '@/hooks/useBookmarks'
import { paths } from '@/routes/paths'
import type { Reading } from '@/types/readings'
import { cn } from '@/utils/cn'
import { bhavaRef, BHAVA_SIGNIFIES } from '@/utils/astro'
import { formatRelativeDay } from '@/utils/format'

export interface ReadingCardProps {
  reading: Reading
  /** Hide the bhava line where a group header already states it. */
  showBhava?: boolean
  /** Hide the dasha line where the period group already states it. */
  showDasha?: boolean
  active?: boolean
  onSelect?: (reading: Reading) => void
  className?: string
}

/**
 * One reading, with enough of its citation to be judged without opening it.
 *
 * The order is deliberate, and it is the reverse of a chat log: the bhava and
 * the grahas come first, then the question, then the verdict. A card that led
 * with a timestamp would be an inbox row; leading with the part of the chart
 * the answer came out of is what makes this an index of the chart — you can
 * see which reading you want without reading any of the questions.
 */
export function ReadingCard({
  reading,
  showBhava = true,
  showDasha = true,
  active = false,
  onSelect,
  className,
}: ReadingCardProps) {
  const { isSaved } = useBookmarks()
  const { answer } = reading
  const saved = isSaved(reading.id)

  const body = (
    <>
      {/* The gold rule is the only ornament, and it marks the active card. */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-0 left-0 w-0.5 rounded-l-card transition-colors duration-200',
          active ? 'bg-gold' : 'bg-transparent group-hover:bg-gold-border',
        )}
      />

      <span className="min-w-0 flex-1">
        {/* ── Where in the chart this came from ── */}
        <span className="flex items-center justify-between gap-3">
          {showBhava && answer.source.bhava !== undefined ? (
            <span className="min-w-0 truncate font-mono text-label uppercase text-gold-deep">
              {bhavaRef(answer.source.bhava)} · {BHAVA_SIGNIFIES[answer.source.bhava]}
            </span>
          ) : (
            <span className="min-w-0 truncate font-mono text-label uppercase text-muted">
              {formatRelativeDay(reading.askedAt)}
            </span>
          )}

          {/* Glyphs only here — the codes are spelled out under Source. */}
          <span className="flex shrink-0 items-center gap-1.5">
            {answer.source.grahas.map((code) => (
              <PlanetGlyph key={code} code={code} size="md" />
            ))}
          </span>
        </span>

        <AstroDivider className="mt-2.5" />

        {/* ── The question, then the answer to it ── */}
        <span className="mt-3 flex items-start gap-2">
          <span className="min-w-0 flex-1 text-sub font-medium text-ink text-pretty">
            {reading.question}
          </span>
          {saved && (
            <span className="mt-0.5 shrink-0 font-mono text-label uppercase text-gold-deep">
              Saved
            </span>
          )}
        </span>

        <span className="mt-2 block">
          <span className="block font-mono text-label uppercase text-muted">Verdict</span>
          <span className="mt-0.5 block text-sub text-purple text-pretty">{answer.verdict}</span>
        </span>

        {/* ── When it applies, and what it was read against ── */}
        {answer.window && (
          <span className="mt-3 block">
            <span className="block font-mono text-label uppercase text-muted">Time range</span>
            <ReadingWindowChip window={answer.window} className="mt-1" />
          </span>
        )}

        {showDasha && answer.source.dashaPath && (
          <span className="mt-3 block">
            <span className="block font-mono text-label uppercase text-muted">Source</span>
            <span className="mt-0.5 block font-mono text-data text-purple">
              {answer.source.dashaPath}
            </span>
          </span>
        )}

        {showBhava && answer.source.bhava !== undefined && (
          <span className="mt-3 block text-xs text-muted">
            {formatRelativeDay(reading.askedAt)}
          </span>
        )}
      </span>

      <ChevronRight aria-hidden className="size-4 shrink-0 self-center text-faint" />
    </>
  )

  const classes = cn(
    'group relative flex w-full items-start gap-3 overflow-hidden rounded-card border p-4 pl-5 text-left',
    'transition-[border-color,background-color,box-shadow] duration-150 ease-out-soft',
    active
      ? 'border-gold bg-gold-soft'
      : 'border-border bg-surface shadow-card hover:border-border-strong hover:shadow-raised',
    className,
  )

  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(reading)} className={classes}>
        {body}
      </button>
    )
  }

  return (
    <Link to={paths.reading(reading.id)} className={classes}>
      {body}
    </Link>
  )
}
