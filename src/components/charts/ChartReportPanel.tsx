import { Download, FileText, ShoppingBag, Sparkles } from 'lucide-react'
import { Button } from '@/components/common/Button'
import {
  formatChartDetailInr,
} from '@/onboarding/chart-detail-unlock'
import { cn } from '@/utils/cn'

export interface ChartReportPanelProps {
  profileName: string
  unlocked: boolean
  onGetDetail: () => void
  className?: string
}

/**
 * Report tab — unlock / open the detailed kundli book.
 */
export function ChartReportPanel({
  profileName,
  unlocked,
  onGetDetail,
  className,
}: ChartReportPanelProps) {
  return (
    <div className={cn('animate-rise space-y-5', className)}>
      <div className="space-y-1.5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
          Report
        </p>
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Detailed kundli report
        </h2>
        <p className="max-w-lg text-sm leading-relaxed text-muted text-pretty">
          A book-style reading for {profileName} — houses, dasha opening, work, bond, and wealth.
        </p>
      </div>

      <article
        className={cn(
          'relative overflow-hidden rounded-3xl border border-border/80',
          'bg-[linear-gradient(155deg,color-mix(in_oklab,var(--color-surface)_88%,#3a2418)_0%,var(--color-surface)_55%)]',
          'px-5 py-7 sm:px-8 sm:py-9',
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-copper/20 blur-3xl"
        />

        <div className="relative flex items-start gap-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-copper/40 bg-copper/15 text-copper">
            <FileText className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-lg font-semibold text-ink">
              {unlocked ? 'Your report is ready' : 'Unlock the full reading'}
            </p>
            <p className="text-sm text-muted text-pretty">
              {unlocked
                ? 'Open the book anytime, or download it to keep.'
                : `One payment · ${formatChartDetailInr()} · read in-app as a book.`}
            </p>
          </div>
        </div>

        <ul className="relative mt-6 space-y-2.5">
          {[
            'Lagna and house frame',
            'Moon nakshatra and opening dasha',
            'Work, standing, bond, and wealth',
          ].map((line) => (
            <li key={line} className="flex items-start gap-2.5 text-sm text-ink">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-copper" aria-hidden />
              <span className="text-pretty">{line}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={unlocked ? 'secondary' : 'primary'}
          size="lg"
          className="relative mt-7 w-full rounded-full"
          iconLeft={
            unlocked ? <Download className="size-4" /> : <ShoppingBag className="size-4" />
          }
          onClick={onGetDetail}
        >
          {unlocked ? 'Download / view detail' : 'Get detail'}
        </Button>
      </article>
    </div>
  )
}
