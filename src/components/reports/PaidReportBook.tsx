import type { CSSProperties } from 'react'
import { ChevronLeft, ChevronRight, Sparkles, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { PaidReportContent } from '@/data/reports-content'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { cn } from '@/utils/cn'
import './PaidReportBook.css'

interface PaidReportBookProps {
  report: PaidReportContent
  className?: string
}

interface BookPage {
  id: string
  eyebrow: string
  title: string
  body: string
  kind: 'cover' | 'chapter' | 'closing'
  accent: string
  chapterNo?: number
  personName?: string
}

const CHAPTER_ACCENTS = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-accent)',
  'var(--color-primary-hover)',
  'var(--color-info)',
]

/**
 * Open-book paid report — vivid celestial spread with flip navigation.
 */
export function PaidReportBook({ report, className }: PaidReportBookProps) {
  const pages = useMemo(() => buildPages(report), [report])
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
    <div className={cn('paid-report-book paid-report-stage flex flex-col gap-4', className)}>
      <div className="relative z-[1] lg:hidden">
        <BookLeaf page={pages[index]!} side="single" />
      </div>

      <div
        className={cn(
          'paid-report-frame relative z-[1] hidden overflow-hidden rounded-[1.5rem] lg:grid lg:grid-cols-2',
        )}
      >
        <div
          aria-hidden
          className="paid-report-spine-glow pointer-events-none absolute inset-y-10 left-1/2 z-20 w-1 -translate-x-1/2 rounded-full"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-3 left-1/2 z-10 w-16 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/45 to-transparent"
        />
        <BookLeaf page={pages[leftIndex]!} side="left" />
        {pages[rightIndex] ? (
          <BookLeaf page={pages[rightIndex]!} side="right" />
        ) : (
          <div className="paid-report-leaf relative z-[1] min-h-[30rem]" />
        )}
      </div>

      <div className="relative z-[1] flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canPrev}
          className={cn(
            'paid-report-nav paid-report-nav--prev inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold',
            !canPrev && 'cursor-not-allowed border-border/50 bg-surface/30 text-faint',
          )}
        >
          <ChevronLeft className="size-4" aria-hidden />
          Prev
        </button>

        <p className="paid-report-page-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
          <Sparkles className="size-3 text-[var(--color-primary)]" aria-hidden />
          <span className="lg:hidden">
            Page {index + 1} / {pages.length}
          </span>
          <span className="hidden lg:inline">
            Spread {Math.floor(leftIndex / 2) + 1} · {leftIndex + 1}
            {pages[rightIndex] ? `–${rightIndex + 1}` : ''} of {pages.length}
          </span>
        </p>

        <button
          type="button"
          onClick={goNext}
          disabled={!canNext}
          className={cn(
            'paid-report-nav paid-report-nav--next inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold',
            !canNext && 'cursor-not-allowed border-border/50 bg-surface/30 text-faint shadow-none',
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
  const isCover = page.kind === 'cover'
  const isClosing = page.kind === 'closing'

  return (
    <article
      className={cn(
        'paid-report-leaf relative z-[1] min-h-[24rem] overflow-hidden sm:min-h-[30rem]',
        isCover && 'paid-report-leaf--cover',
        isClosing && 'paid-report-leaf--closing',
        side === 'single' &&
          'rounded-[1.5rem] border-2 border-primary/55 shadow-[0_28px_60px_-24px_rgba(201,145,115,0.55)]',
        side === 'left' && 'border-r border-black/15',
      )}
      style={{ '--leaf-accent': page.accent } as CSSProperties}
    >
      <div aria-hidden className="paid-report-sheen pointer-events-none absolute inset-0" />
      {(isCover || isClosing) && <StarField />}
      {page.kind === 'chapter' && page.chapterNo != null && (
        <span aria-hidden className="paid-report-watermark">
          {String(page.chapterNo).padStart(2, '0')}
        </span>
      )}

      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 w-14 from-black/[0.08] to-transparent',
          side === 'left' && 'right-0 bg-gradient-to-l',
          side === 'right' && 'left-0 bg-gradient-to-r',
          side === 'single' && 'right-0 bg-gradient-to-l',
        )}
      />

      {isCover ? (
        <CoverLeaf page={page} />
      ) : isClosing ? (
        <ClosingLeaf page={page} />
      ) : (
        <ChapterLeaf page={page} />
      )}
    </article>
  )
}

function CoverLeaf({ page }: { page: BookPage }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center px-6 py-8 text-center sm:px-10">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)] shadow-[0_0_24px_-6px_rgba(201,145,115,0.55)]">
        <Star className="size-3 fill-[var(--color-primary)] text-[var(--color-primary)]" aria-hidden />
        {page.eyebrow}
      </span>

      <h2 className="paid-report-title-cover mt-5 font-serif text-4xl font-semibold leading-none tracking-tight sm:text-5xl">
        {page.title}
      </h2>

      <div aria-hidden className="paid-report-ornament mt-5" />

      <p className="mt-5 text-sm font-semibold text-silver-300">
        For {page.personName ?? 'you'}
      </p>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/80 text-pretty sm:text-[15px]">
        {page.body}
      </p>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/40 to-secondary/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90 ring-1 ring-white/20">
        <Sparkles className="size-3.5 text-silver-300" aria-hidden />
        Flip to begin
      </div>
    </div>
  )
}

function ChapterLeaf({ page }: { page: BookPage }) {
  return (
    <div className="relative flex h-full flex-col px-5 py-6 sm:px-7 sm:py-8">
      <div className="paid-report-chapter-band inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-white">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]">
          {page.eyebrow}
        </span>
      </div>

      <h2 className="mt-4 font-serif text-2xl font-semibold leading-snug text-[var(--book-ink)] sm:text-[1.85rem]">
        {page.title}
      </h2>

      <div
        aria-hidden
        className="mt-3 h-1 w-16 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${page.accent}, var(--color-secondary))`,
          boxShadow: `0 0 16px ${page.accent}`,
        }}
      />

      <div className="paid-report-body-card mt-5 min-h-0 flex-1 overflow-y-auto rounded-2xl px-4 py-4 sm:px-5 sm:py-5">
        {page.body.split(/\n\n+/).map((para) => (
          <p
            key={para.slice(0, 48)}
            className="text-sm leading-[1.85] text-[var(--book-muted)] text-pretty sm:text-[15px]"
          >
            {para}
          </p>
        ))}
      </div>
    </div>
  )
}

function ClosingLeaf({ page }: { page: BookPage }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center px-6 py-8 text-center sm:px-10">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
        {page.eyebrow}
      </span>
      <h2 className="paid-report-title-cover mt-4 font-serif text-3xl font-semibold sm:text-4xl">
        {page.title}
      </h2>
      <div aria-hidden className="paid-report-ornament mt-5" />
      <p className="mt-5 max-w-sm text-sm italic leading-relaxed text-white/80 text-pretty sm:text-[15px]">
        {page.body}
      </p>
    </div>
  )
}

function StarField() {
  const stars = [
    { t: '12%', l: '14%', s: 2, d: '0s' },
    { t: '22%', l: '78%', s: 3, d: '0.4s' },
    { t: '68%', l: '18%', s: 2, d: '0.8s' },
    { t: '74%', l: '82%', s: 2.5, d: '1.1s' },
    { t: '40%', l: '88%', s: 2, d: '0.2s' },
    { t: '86%', l: '48%', s: 2, d: '1.4s' },
  ]
  return (
    <div aria-hidden className="paid-report-stars pointer-events-none absolute inset-0">
      {stars.map((star) => (
        <span
          key={`${star.t}-${star.l}`}
          style={{
            top: star.t,
            left: star.l,
            width: star.s,
            height: star.s,
            animationDelay: star.d,
          }}
        />
      ))}
    </div>
  )
}

function buildPages(report: PaidReportContent): BookPage[] {
  return [
    {
      id: 'cover',
      eyebrow: 'Premium report',
      title: report.title,
      body: report.standfirst,
      kind: 'cover',
      accent: CHAPTER_ACCENTS[0]!,
      personName: report.personName,
    },
    ...report.chapters.map((chapter, i) => ({
      id: `ch-${i}`,
      eyebrow: `Chapter ${i + 1}`,
      title: chapter.title,
      body: chapter.body,
      kind: 'chapter' as const,
      accent: CHAPTER_ACCENTS[i % CHAPTER_ACCENTS.length]!,
      chapterNo: i + 1,
    })),
    {
      id: 'closing',
      eyebrow: 'Closing',
      title: 'A note to keep',
      body: report.closing,
      kind: 'closing',
      accent: CHAPTER_ACCENTS[3]!,
    },
  ]
}
