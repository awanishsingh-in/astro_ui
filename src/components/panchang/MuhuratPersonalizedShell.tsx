import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronRight, Flame, Sparkles } from 'lucide-react'
import { useAuth } from '@/auth/auth-context'
import { DailyMuhuratHub } from '@/components/panchang/DailyMuhuratHub'
import { MuhuratDownloadPanel } from '@/components/panchang/MuhuratDownloadPanel'
import { MuhuratFindForm } from '@/components/panchang/MuhuratFindForm'
import { MuhuratPlanPaywall } from '@/components/panchang/MuhuratPlanPaywall'
import {
  MuhuratPurposeDetailModal,
  type MuhuratPurposeSelection,
} from '@/components/panchang/MuhuratPurposeDetailModal'
import { useToast } from '@/components/feedback/toast-context'
import { recordDownload } from '@/data/download-history'
import {
  formatInr,
  getMuhuratPlan,
  getMuhuratRecent,
  getMuhuratViewed,
  MUHURAT_PLAN_SINGLE_PRICE,
  MUHURAT_PLAN_UNLIMITED_PRICE,
  purchaseMuhuratPlan,
  recordMuhuratDownload,
  recordMuhuratView,
  type MuhuratPlanKind,
  type MuhuratPlanState,
  type MuhuratRecentDownload,
  type MuhuratViewedItem,
} from '@/data/muhurat-plans'
import type { MuhuratPurposeId } from '@/data/panchang-mock'
import { cn } from '@/utils/cn'

/**
 * Muhurat hub chrome: sticky personalized CTA, plan paywall, download drawer,
 * recent line for ₹49, and unlimited download rail for ₹399.
 */
export function MuhuratPersonalizedShell({
  dateIso,
  locationLabel = 'Delhi, India',
  onSelectDay,
}: {
  dateIso: string
  locationLabel?: string
  onSelectDay: (iso: string) => void
}) {
  const { user } = useAuth()
  const toast = useToast()
  const userId = user?.id ?? ''

  const [plan, setPlan] = useState<MuhuratPlanState>(() => getMuhuratPlan(userId))
  const [recent, setRecent] = useState<MuhuratRecentDownload | null>(() =>
    getMuhuratRecent(userId),
  )
  const [viewed, setViewed] = useState<MuhuratViewedItem[]>(() => getMuhuratViewed(userId))
  const [payOpen, setPayOpen] = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [detailPurpose, setDetailPurpose] = useState<MuhuratPurposeSelection | null>(null)
  const [detailDateIso, setDetailDateIso] = useState(dateIso)
  const [detailLocation, setDetailLocation] = useState(locationLabel)

  const unlimited =
    plan.kind === 'unlimited' && (plan.unlimitedUntil ?? 0) > Date.now()
  const showCta = !unlimited
  const showRecent = Boolean(recent && (plan.kind === 'single' || plan.singleUsed))

  const refresh = useCallback(() => {
    setPlan(getMuhuratPlan(userId))
    setRecent(getMuhuratRecent(userId))
    setViewed(getMuhuratViewed(userId))
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  function handleChoosePlan(kind: MuhuratPlanKind) {
    if (!userId) {
      toast.info('Sign in to continue', { description: 'Personalized muhurat needs an account.' })
      return
    }
    purchaseMuhuratPlan(userId, kind)
    refresh()
    setPayOpen(false)
    setDownloadOpen(true)
    toast.success(
      kind === 'unlimited'
        ? `Unlimited unlocked · ${formatInr(MUHURAT_PLAN_UNLIMITED_PRICE)}`
        : `Plan active · ${formatInr(MUHURAT_PLAN_SINGLE_PRICE)}`,
      {
        description:
          kind === 'unlimited'
            ? 'Download any muhurat for one month.'
            : 'Choose one muhurat to download.',
      },
    )
  }

  function handleDownload(
    id: MuhuratPurposeId,
    label: string,
    forDateIso = dateIso,
    closeDetail = false,
  ) {
    const result = recordMuhuratDownload(userId, id, label, forDateIso)
    if (!result.ok) {
      toast.info(result.reason ?? 'Could not download')
      return
    }
    const slug = label.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') || id
    const day = forDateIso.slice(0, 10)
    recordDownload({
      kind: 'muhurat',
      title: label,
      subtitle: `Muhurat · ${day}`,
      filename: `cyklos-muhurat-${slug}-${day}.txt`,
    })
    refresh()
    toast.success(`${label} downloaded`, {
      description: 'Saved to your device and Download history.',
    })
    if (closeDetail) setDetailPurpose(null)
    if (getMuhuratPlan(userId).kind === 'single') {
      setDownloadOpen(false)
    }
  }

  function openViewedDetail(item: MuhuratViewedItem) {
    setDetailPurpose({
      id: item.purposeId,
      label: item.label,
      group: item.group,
    })
    setDetailDateIso(item.dateIso)
    setDetailLocation(item.location)
  }

  function handleFindSubmit(
    selection: MuhuratPurposeSelection,
    selectedDate: string,
    location: string,
  ) {
    setDetailPurpose(selection)
    setDetailDateIso(selectedDate)
    setDetailLocation(location)
    if (selectedDate !== dateIso) onSelectDay(selectedDate)
    if (userId) {
      setViewed(
        recordMuhuratView(userId, {
          purposeId: selection.id,
          label: selection.label,
          group: selection.group,
          location,
          dateIso: selectedDate,
        }),
      )
    }
  }

  function handleSavePurpose(_id: MuhuratPurposeId, label: string) {
    toast.success(`${label} saved`, {
      description: 'Added to your saved muhurat list (demo).',
    })
  }

  const planLabel =
    plan.kind === 'unlimited'
      ? 'Unlimited plan · download any muhurat this month'
      : plan.kind === 'single' && !plan.singleUsed
        ? '₹49 plan · pick one muhurat to download'
        : plan.kind === 'single' && plan.singleUsed
          ? '₹49 plan · your one download is used'
          : 'Choose a muhurat to download'

  return (
    <>
      <div
        className={cn(
          'gap-6',
          unlimited
            ? 'grid lg:grid-cols-[minmax(0,1fr)_minmax(17rem,20rem)] lg:items-start'
            : 'block',
          showCta &&
            'pb-[calc(5.75rem+var(--spacing-bottomnav)+env(safe-area-inset-bottom))] lg:pb-28',
        )}
      >
        <div className="min-w-0 space-y-4">
          {showRecent && recent && (
            <div className="rounded-2xl border border-copper/35 bg-copper/10 px-4 py-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-silver-400">
                Your recent muhurat
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">{recent.label}</p>
              <p className="text-xs text-muted">
                Downloaded for{' '}
                {new Date(`${recent.dateIso}T12:00:00`).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}

          <DailyMuhuratHub dateIso={dateIso} onSelectDay={onSelectDay} />
        </div>

        {unlimited && (
          <div className="space-y-4 lg:sticky lg:top-6">
            <aside className="rounded-2xl border border-border/80 bg-surface/90 p-3 shadow-card">
              <p className="px-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-silver-400">
                Find your muhurat
              </p>
              <MuhuratFindForm
                defaultDateIso={dateIso}
                defaultLocation={locationLabel}
                onSubmit={handleFindSubmit}
              />
            </aside>

            {viewed.length > 0 && (
              <aside className="rounded-2xl border border-border/80 bg-surface/90 p-3 shadow-card">
                <p className="px-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-silver-400">
                  Recent
                </p>
                <p className="mt-1 px-1 text-xs text-muted text-pretty">
                  Muhurat you opened after submit.
                </p>
                <ul className="mt-3 max-h-[min(40vh,18rem)] space-y-2 overflow-y-auto overscroll-contain">
                  {viewed.map((item) => {
                    const when = new Date(`${item.dateIso}T12:00:00`).toLocaleDateString(
                      'en-IN',
                      { day: 'numeric', month: 'short', year: 'numeric' },
                    )
                    return (
                      <li key={`${item.purposeId}-${item.dateIso}-${item.viewedAt}`}>
                        <button
                          type="button"
                          onClick={() => openViewedDetail(item)}
                          className={cn(
                            'flex w-full items-center gap-2 rounded-xl border border-border/70 bg-surface-sunken/40 px-3 py-2.5 text-left',
                            'transition hover:border-copper/45 hover:bg-copper/10',
                          )}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-ink">
                              {item.label}
                            </span>
                            <span className="block text-[10px] text-muted">
                              {item.location} · {when}
                            </span>
                          </span>
                          <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </aside>
            )}
          </div>
        )}
      </div>

      {showCta &&
        createPortal(
          <div
            className={cn(
              'pointer-events-none fixed z-40 px-4 sm:px-5 md:px-6 lg:px-8',
              /* Full viewport on mobile (above BottomNav); main column on desktop */
              'inset-x-0 bottom-[calc(var(--spacing-bottomnav)+env(safe-area-inset-bottom))]',
              'lg:inset-x-auto lg:left-60 lg:right-0 xl:left-64 lg:bottom-0',
              'pb-3 lg:pb-[max(1rem,env(safe-area-inset-bottom))] pt-3',
            )}
          >
            <div className="pointer-events-auto mx-auto w-full max-w-wide">
              <button
                type="button"
                onClick={() => {
                  if (plan.kind === 'single' && !plan.singleUsed) {
                    setDownloadOpen(true)
                    return
                  }
                  setPayOpen(true)
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-full px-3 py-2.5 text-left',
                  'bg-gradient-to-r from-[var(--btn-primary-from)] to-[var(--btn-primary-to)]',
                  'text-[var(--btn-primary-fg)] font-semibold tracking-wide',
                  'shadow-[0_12px_40px_-8px_,0_0_0_1px__inset]',
                  'transition-[transform,box-shadow] duration-150 ease-out-soft',
                  'hover:shadow-[0_16px_44px_-8px_rgba(201,145,115,0.55)] active:scale-[0.985]',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy',
                )}
              >
                <span
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-black/25 text-[#F2D7C7] shadow-md"
                  aria-hidden
                >
                  <Flame className="size-6" strokeWidth={1.5} />
                </span>
                <span className="flex min-w-0 flex-1 items-center justify-center gap-2 pr-2">
                  <Sparkles className="size-4 shrink-0 opacity-95" aria-hidden />
                  <span className="truncate text-body">Get personalized muhurat</span>
                </span>
              </button>
            </div>
          </div>,
          document.body,
        )}

      <MuhuratPlanPaywall
        isOpen={payOpen}
        onClose={() => setPayOpen(false)}
        onChoose={handleChoosePlan}
      />

      <MuhuratDownloadPanel
        isOpen={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        planLabel={planLabel}
        onDownload={handleDownload}
      />

      <MuhuratPurposeDetailModal
        isOpen={Boolean(detailPurpose)}
        onClose={() => setDetailPurpose(null)}
        purpose={detailPurpose}
        dateIso={detailDateIso}
        location={detailLocation}
        onDownload={(id, label) => {
          handleDownload(id, label, detailDateIso, true)
        }}
        onSave={(id, label) => {
          handleSavePurpose(id, label)
        }}
      />
    </>
  )
}
