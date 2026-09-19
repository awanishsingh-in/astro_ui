import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { matchTypeLabel, type MatchRelationType } from '@/data/match-types'
import type { MatchResult } from '@/data/matching-mock'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { cn } from '@/utils/cn'
import { formatDateShort, formatTime12 } from '@/utils/format'

interface MatchReportBookProps {
  result: MatchResult
  matchType: MatchRelationType | null
  className?: string
}

interface BookPage {
  id: string
  eyebrow: string
  title: string
  body: ReactNode
}

/**
 * Open-book preview of the detailed match report — pages you flip, not a browser PDF chrome.
 */
export function MatchReportBook({ result, matchType, className }: MatchReportBookProps) {
  const pages = useMemo(() => buildPages(result, matchType), [result, matchType])
  const [index, setIndex] = useState(0)
  const desktop = useIsDesktop()

  const leftIndex = desktop ? index - (index % 2) : index
  const rightIndex = leftIndex + 1
  const step = desktop ? 2 : 1
  const canPrev = index > 0
  const canNext = index < pages.length - 1

  const goPrev = () => setIndex((i) => Math.max(0, i - step))
  const goNext = () => setIndex((i) => Math.min(pages.length - 1, i + step))

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Mobile / narrow: one leaf at a time */}
      <div className="relative lg:hidden">
        <BookLeaf page={pages[index]!} side="single" />
      </div>

      {/* Desktop: open spread */}
      <div
        className={cn(
          'relative hidden overflow-hidden rounded-panel lg:grid lg:grid-cols-2',
          'border border-border/80 bg-[#1a1210] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.75)]',
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-copper/35 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-6 left-1/2 z-10 w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/35 to-transparent"
        />
        <BookLeaf page={pages[leftIndex]!} side="left" />
        {pages[rightIndex] ? (
          <BookLeaf page={pages[rightIndex]!} side="right" />
        ) : (
          <div className="min-h-[28rem] bg-[#f3ebe0]" />
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canPrev}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-sm font-medium',
            'transition-colors',
            canPrev
              ? 'bg-surface text-ink hover:border-border-strong hover:bg-navy-soft'
              : 'cursor-not-allowed bg-surface/40 text-faint',
          )}
        >
          <ChevronLeft className="size-4" aria-hidden />
          Prev
        </button>

        <p className="font-mono text-label uppercase tracking-[0.14em] text-muted">
          <span className="lg:hidden">
            Page {index + 1} / {pages.length}
          </span>
          <span className="hidden lg:inline">
            Spread {Math.floor(leftIndex / 2) + 1} · leaves {leftIndex + 1}
            {pages[rightIndex] ? `-${rightIndex + 1}` : ''} of {pages.length}
          </span>
        </p>

        <button
          type="button"
          onClick={goNext}
          disabled={!canNext}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-sm font-medium',
            'transition-colors',
            canNext
              ? 'bg-surface text-ink hover:border-border-strong hover:bg-navy-soft'
              : 'cursor-not-allowed bg-surface/40 text-faint',
          )}
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}

function BookLeaf({
  page,
  side,
}: {
  page: BookPage
  side: 'left' | 'right' | 'single'
}) {
  return (
    <article
      className={cn(
        'relative min-h-[22rem] overflow-hidden sm:min-h-[26rem]',
        side === 'single' &&
          'rounded-panel border border-border/80 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.7)]',
        side === 'left' && 'border-r border-black/10',
        'bg-[#f3ebe0] text-[#2a211c]',
      )}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 w-10 from-black/[0.06] to-transparent',
          side === 'left' && 'right-0 bg-gradient-to-l',
          side === 'right' && 'left-0 bg-gradient-to-r',
          side === 'single' && 'right-0 bg-gradient-to-l',
        )}
      />
      <div className="relative flex h-full flex-col px-5 py-6 sm:px-7 sm:py-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8a6a4a]">
          {page.eyebrow}
        </p>
        <h2 className="mt-2 font-serif text-xl leading-snug text-[#1f1712] sm:text-2xl">
          {page.title}
        </h2>
        <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto text-sm leading-relaxed text-[#3d322b]">
          {page.body}
        </div>
      </div>
    </article>
  )
}

function personBlock(label: string, profile: MatchResult['a']) {
  return (
    <div className="rounded-md border border-[#d6c4ae] bg-[#efe4d4]/60 px-3 py-2.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8a6a4a]">{label}</p>
      <p className="mt-1 font-medium text-[#1f1712]">{profile.name}</p>
      <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-[#6b5748]">
        {formatDateShort(profile.details.date)} · {formatTime12(profile.details.time)}
      </p>
      <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-[#6b5748]">
        {profile.moonRashi} · {profile.moonNakshatra}
      </p>
    </div>
  )
}

function buildPages(result: MatchResult, matchType: MatchRelationType | null): BookPage[] {
  const typeLabel = matchType ? matchTypeLabel(matchType) : 'Guna Milan'
  const mid = Math.ceil(result.kootas.length / 2)
  const kootaFirst = result.kootas.slice(0, mid)
  const kootaSecond = result.kootas.slice(mid)

  return [
    {
      id: 'cover',
      eyebrow: `${typeLabel} · Cyklos`,
      title: 'Detailed match report',
      body: (
        <>
          <p className="font-serif text-3xl text-[#1f1712]">
            {result.total}
            <span className="text-lg text-[#8a6a4a]"> / {result.max}</span>
          </p>
          <p className="text-[#6b5748]">Gunas matched across the eight kootas.</p>
          <div className="grid gap-2.5 pt-1 sm:grid-cols-1">
            {personBlock('Person 1', result.a)}
            {personBlock('Person 2', result.b)}
          </div>
        </>
      ),
    },
    {
      id: 'reading',
      eyebrow: 'The reading',
      title: 'What the score says',
      body: (
        <>
          <p className="text-pretty">{result.summary}</p>
          <p className="border-t border-[#d6c4ae] pt-3 text-pretty text-[#6b5748]">{result.caveat}</p>
        </>
      ),
    },
    {
      id: 'kootas-a',
      eyebrow: 'The eight kootas',
      title: 'First leaf',
      body: (
        <ul className="space-y-3">
          {kootaFirst.map((k) => (
            <li key={k.id} className="border-b border-[#e0d2bf] pb-2.5 last:border-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium text-[#1f1712]">{k.name}</span>
                <span className="font-mono text-[11px] text-[#8a6a4a]">
                  {k.score}/{k.max}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#6b5748] text-pretty">{k.detail}</p>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'kootas-b',
      eyebrow: 'The eight kootas',
      title: 'Second leaf',
      body: (
        <ul className="space-y-3">
          {kootaSecond.map((k) => (
            <li key={k.id} className="border-b border-[#e0d2bf] pb-2.5 last:border-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium text-[#1f1712]">{k.name}</span>
                <span className="font-mono text-[11px] text-[#8a6a4a]">
                  {k.score}/{k.max}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#6b5748] text-pretty">{k.detail}</p>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'holds',
      eyebrow: 'Where it holds',
      title: 'Strengths',
      body:
        result.strengths.length > 0 ? (
          <ul className="space-y-2.5">
            {result.strengths.map((k) => (
              <li key={k.id} className="text-pretty">
                <span className="font-medium text-[#1f1712]">{k.name}</span>
                <span className="text-[#6b5748]"> — {k.detail}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[#6b5748]">No koota scores full marks.</p>
        ),
    },
    {
      id: 'rubs',
      eyebrow: 'Where it rubs',
      title: 'Frictions',
      body:
        result.frictions.length > 0 ? (
          <ul className="space-y-2.5">
            {result.frictions.map((k) => (
              <li key={k.id} className="text-pretty">
                <span className="font-medium text-[#1f1712]">{k.name}</span>
                <span className="text-[#6b5748]"> — {k.concern ?? k.detail}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[#6b5748]">No koota falls badly short.</p>
        ),
    },
    {
      id: 'manglik',
      eyebrow: 'Manglik',
      title: 'A closing note',
      body: <p className="text-pretty">{result.manglik.note}</p>,
    },
  ]
}
