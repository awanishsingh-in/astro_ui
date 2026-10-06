import { Download, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { useToast } from '@/components/feedback/toast-context'
import { formatChartDetailInr } from '@/onboarding/chart-detail-unlock'
import { paths } from '@/routes/paths'
import type { Chart } from '@/types/astrology'
import type { BirthDetails } from '@/types/user'
import { triggerBasicKundaliDownload } from '@/utils/chart-kundali-download'
import { cn } from '@/utils/cn'

export interface ChartKundaliDownloadContext {
  chart: Chart
  profileName: string
  birthDetails: BirthDetails
  detailUnlocked: boolean
  onGetDetail: () => void
  ayanamsa?: string
}

export function DownloadKundaliButton({
  context,
  className,
  size = 'md',
}: {
  context: ChartKundaliDownloadContext
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const toast = useToast()

  return (
    <Button
      variant="secondary"
      size={size}
      className={cn('rounded-2xl', className)}
      iconLeft={<Download className="size-4" />}
      onClick={() => {
        triggerBasicKundaliDownload({
          chart: context.chart,
          profileName: context.profileName,
          birthDetails: context.birthDetails,
          ayanamsa: context.ayanamsa,
        })
        toast.success('Kundali downloaded', {
          description: 'Basic chart summary saved to your device.',
        })
      }}
    >
      Download Kundali
    </Button>
  )
}

export function DownloadPremiumKundaliButton({
  context,
  className,
  size = 'md',
  showHint = false,
  hintAlign = 'center',
}: {
  context: ChartKundaliDownloadContext
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showHint?: boolean
  hintAlign?: 'center' | 'left'
}) {
  const navigate = useNavigate()

  return (
    <div className={cn(showHint && 'space-y-2')}>
      <Button
        variant="primary"
        size={size}
        className={cn('rounded-2xl', className)}
        iconLeft={
          context.detailUnlocked ? (
            <Download className="size-4" />
          ) : (
            <Sparkles className="size-4" />
          )
        }
        onClick={() => {
          if (context.detailUnlocked) {
            navigate(paths.chartDetailView)
            return
          }
          context.onGetDetail()
        }}
      >
        Download premium Kundali
      </Button>
      {showHint && !context.detailUnlocked && (
        <p
          className={cn(
            'text-xs text-muted text-pretty',
            hintAlign === 'left' ? 'text-left' : 'text-center',
          )}
        >
          Premium · {formatChartDetailInr()} · full book-style reading you can keep.
        </p>
      )}
    </div>
  )
}

/**
 * Advertisement-style premium CTA — place in each tab’s empty space (not a shared footer).
 */
export function PremiumKundaliAdCard({
  context,
  className,
  compact = false,
}: {
  context: ChartKundaliDownloadContext
  className?: string
  /** Tighter padding for narrow side columns. */
  compact?: boolean
}) {
  const navigate = useNavigate()

  function onClick() {
    if (context.detailUnlocked) {
      navigate(paths.chartDetailView)
      return
    }
    context.onGetDetail()
  }

  return (
    <aside
      className={cn(
        'relative overflow-hidden rounded-[1.5rem] border border-[#7c4dff]/35',
        'bg-[linear-gradient(160deg,#1a0f3d_0%,#0f0c24_45%,#12182e_100%)]',
        'shadow-[0_18px_40px_-24px_rgba(124,77,255,0.65)]',
        compact ? 'px-3.5 py-3.5 sm:px-4 sm:py-4' : 'px-4 py-4 sm:px-5 sm:py-5',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[#7c4dff]/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-14 -left-8 h-28 w-28 rounded-full bg-[#3a7bd5]/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(196,160,255,0.55) 1px, transparent 0)',
          backgroundSize: '14px 14px',
        }}
      />

      <div className={cn('relative text-center', compact ? 'space-y-2.5' : 'space-y-3')}>
        <p className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#c4a0ff]">
          <Sparkles className="size-3" aria-hidden />
          Premium
        </p>
        <p
          className={cn(
            'font-semibold leading-snug text-white text-pretty',
            compact ? 'text-sm' : 'text-sm sm:text-base',
          )}
        >
          Over 1,000+ users download the premium Kundali
        </p>
        <p className="text-xs text-white/65 text-pretty">
          Full book-style reading · keep a copy forever
          {!context.detailUnlocked ? ` · ${formatChartDetailInr()}` : ''}
        </p>
        <Button
          variant="primary"
          size={compact ? 'sm' : 'md'}
          className="w-full rounded-full"
          iconLeft={
            context.detailUnlocked ? (
              <Download className="size-4" />
            ) : (
              <Sparkles className="size-4" />
            )
          }
          onClick={onClick}
        >
          Download premium Kundali
        </Button>
      </div>
    </aside>
  )
}
