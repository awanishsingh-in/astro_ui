import { Crown, Download, Diamond, FileText, Info, ShoppingBag, Sparkles } from 'lucide-react'
import type { ReactNode, RefObject } from 'react'
import { ReadingNotes } from '@/components/astrology/ReadingNotes'
import { Button } from '@/components/common/Button'
import { ChartDiamond } from '@/components/charts/ChartDiamond'
import { VargaSelector, vargaLabel } from '@/components/charts/VargaSelector'
import { vargas } from '@/data/vargas'
import type { Chart, GrahaCode, VargaCode } from '@/types/astrology'
import { cn } from '@/utils/cn'

export type KundaliMode = 'kundali' | 'premium'

export interface ChartKundaliPanelProps {
  chart: Chart
  varga: VargaCode
  onVargaChange: (varga: VargaCode) => void
  mode: KundaliMode
  onModeChange: (mode: KundaliMode) => void
  activeBhava?: number
  onBhavaClick: (bhava: number) => void
  activeGraha: GrahaCode | null
  onClearSelection: () => void
  planUnlocked: boolean
  onDownloadSvg: () => void
  detailUnlocked: boolean
  onGetDetail: () => void
  chartFrameRef: RefObject<HTMLDivElement | null>
  className?: string
}

/**
 * Kundali tab — dark diamond views with live reading notes beside the chart.
 */
export function ChartKundaliPanel({
  chart,
  varga,
  onVargaChange,
  mode,
  onModeChange,
  activeBhava,
  onBhavaClick,
  activeGraha,
  onClearSelection,
  planUnlocked,
  onDownloadSvg,
  detailUnlocked,
  onGetDetail,
  chartFrameRef,
  className,
}: ChartKundaliPanelProps) {
  const vargaMeta = vargas.find((v) => v.code === varga)
  const premium = mode === 'premium'
  const hasSelection = Boolean(activeGraha || activeBhava)

  return (
    <div className={cn('animate-rise space-y-5', className)}>
      <div className="space-y-1.5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
          Kundali
        </p>
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          See the sky as drawn
        </h2>
        <p className="max-w-lg text-sm leading-relaxed text-muted text-pretty">
          Tap any house on the diamond — details open on the right. Get a full book-style report
          anytime.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ModeCard
          active={mode === 'kundali'}
          icon={<Diamond className="size-5" />}
          title="Kundali"
          hint="North Indian diamond"
          onClick={() => onModeChange('kundali')}
        />
        <ModeCard
          active={premium}
          icon={<Sparkles className="size-5" />}
          title="Premium kundali"
          hint="Same diamond · copper frame"
          onClick={() => onModeChange('premium')}
          badge="Plus look"
        />
      </div>

      <VargaSelector value={varga} onChange={onVargaChange} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:items-start">
        <div
          className={cn(
            'overflow-hidden rounded-3xl border bg-surface/90 shadow-[0_18px_40px_-30px_rgba(20,12,8,0.55)]',
            premium
              ? 'border-copper/50 shadow-[0_0_40px_-18px_rgba(196, 160, 255,0.45)]'
              : 'border-border/80',
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-surface-sunken/35 px-4 py-3 sm:px-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
              {premium ? 'Premium · ' : ''}
              {vargaLabel(varga)}
              {vargaMeta ? ` · ${vargaMeta.name}` : ''}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDownloadSvg}
              iconLeft={
                planUnlocked ? (
                  <Download className="size-3.5" strokeWidth={2} />
                ) : (
                  <Crown className="size-3.5" strokeWidth={2} />
                )
              }
              className="rounded-full"
            >
              SVG
              {!planUnlocked && (
                <span className="ml-1 font-mono text-[9px] uppercase tracking-[0.12em] text-gold-deep">
                  Plus
                </span>
              )}
            </Button>
          </div>

          <div ref={chartFrameRef} className="p-4 sm:p-6">
            <ChartDiamond
              chart={chart}
              tone="surface"
              activeBhava={activeBhava}
              onBhavaClick={onBhavaClick}
              className="mx-auto max-w-[460px]"
            />
            {vargaMeta && (
              <p className="mt-4 border-t border-border/70 pt-3 text-center text-sm text-muted text-pretty">
                {vargaMeta.signifies}.
              </p>
            )}
          </div>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-20">
          <div className="rounded-3xl border border-border/80 bg-surface/90 p-4 shadow-card sm:p-5">
            <ReadingNotes
              chart={chart}
              activeGraha={activeGraha}
              activeBhava={activeBhava}
            />
          </div>

          {hasSelection ? (
            <button
              type="button"
              onClick={onClearSelection}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-full border border-copper/40',
                'bg-copper/10 px-4 py-2.5 text-sm font-medium text-copper',
                'transition-colors hover:border-copper/55 hover:bg-copper/15',
              )}
            >
              <Info aria-hidden className="size-4" />
              Clear selection
            </button>
          ) : (
            <button
              type="button"
              onClick={onGetDetail}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-full border border-border/80',
                'bg-surface-sunken/40 px-4 py-2.5 text-sm font-medium text-ink',
                'transition-colors hover:border-copper/40 hover:bg-copper/10',
              )}
            >
              <FileText aria-hidden className="size-4 text-copper" />
              {detailUnlocked ? 'Open detailed report' : 'Get detailed report'}
            </button>
          )}
        </aside>
      </div>

      <Button
        variant={detailUnlocked ? 'secondary' : 'primary'}
        size="lg"
        className="w-full rounded-full"
        iconLeft={
          detailUnlocked ? <Download className="size-4" /> : <ShoppingBag className="size-4" />
        }
        onClick={onGetDetail}
      >
        {detailUnlocked ? 'Download / view detail' : 'Get detail'}
      </Button>
    </div>
  )
}

function ModeCard({
  active,
  icon,
  title,
  hint,
  badge,
  onClick,
}: {
  active: boolean
  icon: ReactNode
  title: string
  hint: string
  badge?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'relative flex items-start gap-3 rounded-2xl border px-4 py-4 text-left transition',
        active
          ? 'border-copper/55 bg-copper/15 shadow-[0_0_28px_-14px_rgba(196, 160, 255,0.55)]'
          : 'border-border/80 bg-surface/80 hover:border-copper/35 hover:bg-copper/8',
      )}
    >
      <span
        className={cn(
          'inline-flex size-11 shrink-0 items-center justify-center rounded-full border',
          active
            ? 'border-copper/45 bg-copper/20 text-copper'
            : 'border-border bg-surface-sunken/50 text-muted',
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="block text-base font-semibold text-ink">{title}</span>
          {badge && (
            <span className="rounded-full border border-copper/35 bg-copper/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-gold-deep">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-xs text-muted">{hint}</span>
      </span>
    </button>
  )
}
