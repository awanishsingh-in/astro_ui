import type { GrahaCode } from '@/types/astrology'
import { ArrowLeft, Check, Crown, Download, Lock, MessageCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { ChatPaywall } from '@/components/ask/ChatPaywall'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/auth/auth-context'
import {
  insightsByIds,
  MAX_PAST_SELECTIONS,
  MIN_PAST_SELECTIONS,
  PAST_INSIGHTS,
  type PastInsight,
  type PastInsightCategory,
} from '@/data/past-insights'
import { PageContainer } from '@/layouts/PageContainer'
import {
  getPastSelections,
  hasActivePlan,
  savePastSelections,
  unlockPlan,
} from '@/onboarding/past-intro'
import { paths } from '@/routes/paths'
import { bhavaRef, GRAHAS } from '@/utils/astro'
import { cn } from '@/utils/cn'

/**
 * Your Past — continue from Know Your Past picks.
 * Signup choices count toward the free cap of 3; fill remaining slots here.
 * Locked cards (when already at 3) open a plan paywall to change picks.
 */
export default function YourPastPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const stored = useMemo(() => {
    if (!user) return [] as PastInsightCategory[]
    return getPastSelections(user.id).slice(0, MAX_PAST_SELECTIONS)
  }, [user])

  const [picked, setPicked] = useState<PastInsightCategory[]>(stored)
  /** Fully locked only after the free cap of 3 is used (or after locking at 3). */
  const [selectionsLocked, setSelectionsLocked] = useState(
    () => stored.length >= MAX_PAST_SELECTIONS,
  )
  const [revealOpen, setRevealOpen] = useState(false)
  const [activeId, setActiveId] = useState<PastInsightCategory | null>(
    stored[0] ?? null,
  )
  const [planUnlocked, setPlanUnlocked] = useState(() =>
    user ? hasActivePlan(user.id) : false,
  )
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [downloadReady, setDownloadReady] = useState(false)

  const atLimit = picked.length >= MAX_PAST_SELECTIONS
  const slotsLeft = Math.max(0, MAX_PAST_SELECTIONS - picked.length)
  const canContinue = picked.length >= MIN_PAST_SELECTIONS
  const revealed = useMemo(() => insightsByIds(picked), [picked])
  const active = revealed.find((item) => item.id === activeId) ?? revealed[0] ?? null

  if (!user) return null

  const pressCard = (id: PastInsightCategory) => {
    const isOn = picked.includes(id)

    // After a full set is locked, nothing changes without Plus.
    if (selectionsLocked && !planUnlocked) {
      if (!isOn) setPaywallOpen(true)
      return
    }

    // At 3 but not locked yet: remaining cards stay locked; selected can still be toggled off.
    if (!isOn && atLimit) {
      if (!planUnlocked) {
        setPaywallOpen(true)
        return
      }
      return
    }

    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id)
      if (prev.length >= MAX_PAST_SELECTIONS) return prev
      return [...prev, id]
    })
  }

  const openReveal = () => {
    if (!canContinue) return
    savePastSelections(user.id, picked)
    // Lock the set once all 3 free slots are filled (“Lock and continue”).
    if (picked.length >= MAX_PAST_SELECTIONS) {
      setSelectionsLocked(true)
    }
    setActiveId(picked[0])
    setRevealOpen(true)
  }

  const confirmPlan = (_planId: string) => {
    unlockPlan(user.id)
    setPlanUnlocked(true)
    setSelectionsLocked(false)
    setPaywallOpen(false)
    setDownloadReady(true)
  }

  const paywall = (
    <ChatPaywall
      isOpen={paywallOpen}
      onClose={() => setPaywallOpen(false)}
      onUnlock={confirmPlan}
      title="Unlock Cyklos Plus"
      description="Past reports and editing your three areas are included with Cyklos Plus."
      benefit="Upgrade to download past reports and change which areas you read."
      unlockLabel="Unlock Plus"
    />
  )

  if (revealOpen && active) {
    return (
      <>
        <div className="flex h-full min-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden lg:min-h-0">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar">
            <PageContainer width="wide" className="space-y-5 py-5 sm:py-6 lg:py-8">
              <header className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setRevealOpen(false)}
                  aria-label="Back to choices"
                  className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink transition-colors hover:border-gold/45 hover:bg-navy-soft"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <div className="min-w-0">
                  <h1 className="font-serif text-[1.65rem] leading-tight text-ink sm:text-title">
                    {revealed.length} area{revealed.length === 1 ? '' : 's'} from your chart
                  </h1>
                  <p className="mt-1 text-sm text-purple">Tap a card to read each area.</p>
                </div>
              </header>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:items-start">
                <aside aria-label="Selected past areas">
                  <div
                    className="flex gap-2 overflow-x-auto no-scrollbar sm:gap-3 lg:flex-col lg:overflow-visible"
                    role="tablist"
                  >
                    {revealed.map((insight) => {
                      const selected = insight.id === active.id
                      return (
                        <button
                          key={insight.id}
                          type="button"
                          role="tab"
                          aria-selected={selected}
                          onClick={() => setActiveId(insight.id)}
                          className={cn(
                            'flex min-w-[9.5rem] flex-col rounded-card border px-3.5 py-3 text-left transition-colors duration-150 ease-out-soft sm:min-w-[11rem] lg:min-w-0 lg:w-full',
                            selected
                              ? 'border-gold/55 bg-gold-soft/40 text-ink'
                              : 'border-border bg-surface text-purple hover:border-border-strong hover:bg-navy-soft hover:text-ink',
                          )}
                        >
                          <span className="flex items-center gap-1.5">
                            {insight.planets.map((code) => (
                              <PlanetGlyph key={code} code={code} size="sm" />
                            ))}
                          </span>
                          <span className="mt-2 line-clamp-2 font-serif text-base text-ink">
                            {insight.category}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </aside>

                <section role="tabpanel" aria-label={active.category} className="space-y-4">
                  <div className="rounded-panel border border-border bg-surface p-5 sm:p-7">
                    <PastReadingDetail
                      insight={active}
                      onDownloadReport={() => {
                        if (!planUnlocked) {
                          setPaywallOpen(true)
                          return
                        }
                        setDownloadReady(true)
                      }}
                      reportPaid={!planUnlocked}
                      downloadReady={downloadReady}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="lg"
                    fullWidth
                    iconLeft={<MessageCircle className="size-4" strokeWidth={2} />}
                    onClick={() =>
                      navigate(
                        `${paths.ask}?q=${encodeURIComponent(
                          `Tell me more about my past in ${active.category.toLowerCase()}.`,
                        )}`,
                      )
                    }
                    className={cn(
                      'rounded-full border-0 btn-primary',
                      'shadow-[0_0_28px_-6px_rgba(201,145,115,0.55)]',
                      'hover:shadow-[0_0_36px_-4px_rgba(201,145,115,0.55)]',
                    )}
                  >
                    Ask about this
                  </Button>
                </section>
              </div>
            </PageContainer>
          </div>
        </div>
        {paywall}
      </>
    )
  }

  return (
    <>
      <div className="flex h-full min-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden lg:min-h-0">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar">
          <PageContainer width="wide" className="flex min-h-full flex-col py-5 sm:py-6 lg:py-8">
            <header className="relative shrink-0 text-center lg:text-left">
              <h1 className="font-serif text-[1.85rem] leading-tight text-ink text-balance sm:text-title lg:text-title-lg">
                Your past
              </h1>
              <p className="mx-auto mt-2 max-w-lg text-sm text-purple text-pretty lg:mx-0 sm:text-body">
              {planUnlocked
                ? `Choose up to ${MAX_PAST_SELECTIONS} areas to read from your chart.`
                : selectionsLocked
                  ? 'Your three areas are locked. Tap a locked card to change them with a plan.'
                  : stored.length > 0 && slotsLeft > 0
                    ? `You already chose ${stored.length}. Add up to ${slotsLeft} more — ${MAX_PAST_SELECTIONS} total.`
                    : `Choose up to ${MAX_PAST_SELECTIONS} areas. Your chart will show what it carried there.`}
            </p>
          </header>

          <section
            className="mt-6 flex min-h-0 flex-1 flex-col"
            aria-label={
              selectionsLocked && !planUnlocked
                ? 'Locked past areas'
                : `Choose up to ${MAX_PAST_SELECTIONS} past areas`
            }
          >
              <div className="grid grid-cols-2 gap-2.5 overflow-visible pt-1.5 sm:gap-3 lg:grid-cols-3">
                {PAST_INSIGHTS.map((insight, index) => {
                  const isOn = picked.includes(insight.id)
                  // Always lock remaining cards once 3 are picked.
                  const showLock = !isOn && atLimit
                  // Selected picks freeze only when the free set of 3 is locked.
                  const freezeSelected = selectionsLocked && !planUnlocked && isOn
                  return (
                    <PastOptionCard
                      key={insight.id}
                      insight={insight}
                      index={index}
                      selected={isOn}
                      disabled={freezeSelected}
                      showLock={showLock}
                      lockHint={
                        planUnlocked ? 'Locked · deselect one first' : 'Locked · plan to change'
                      }
                      onToggle={() => pressCard(insight.id)}
                    />
                  )
                })}
              </div>
            </section>

            <div className="mt-6 flex shrink-0 items-center justify-end gap-4 border-t border-border pt-4">
              <Button
                variant="ghost"
                size="md"
                onClick={openReveal}
                disabled={!canContinue}
                className={cn(
                  'px-7',
                  canContinue
                    ? 'rounded-full border-0 btn-primary shadow-[0_12px_32px_-12px_rgba(201,145,115,0.55)]'
                    : 'rounded-full border-0 bg-navy-soft text-muted',
                )}
              >
                {selectionsLocked && !planUnlocked
                  ? 'Open my past →'
                  : atLimit
                    ? 'Lock and continue'
                    : 'Save and continue'}
              </Button>
            </div>
          </PageContainer>
        </div>
      </div>
      {paywall}
    </>
  )
}

function PastOptionCard({
  insight,
  index,
  selected,
  disabled,
  showLock,
  lockHint = 'Locked',
  onToggle,
}: {
  insight: PastInsight
  index: number
  selected: boolean
  disabled: boolean
  showLock?: boolean
  lockHint?: string
  onToggle: () => void
}) {
  const locked = Boolean(showLock)

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      aria-disabled={locked || undefined}
      className={cn(
        'past-option-card group relative flex min-h-[11rem] flex-col overflow-hidden rounded-[1.35rem] border px-4 py-4 text-left sm:min-h-[12rem] sm:px-5 sm:py-5',
        'backdrop-blur-md transition-[border-color,transform,background-color,opacity,box-shadow] duration-300 ease-out-soft',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-glow/55 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        !locked && 'hover:-translate-y-1.5 hover:scale-[1.02] active:scale-[0.99]',
        selected
          ? 'border-blue-light/50 bg-gradient-to-br from-blue-glow/20 via-surface-accent to-surface'
          : locked
            ? 'cursor-pointer border-border/70 bg-surface-sunken/80 opacity-80 hover:border-blue-light/35 hover:opacity-100'
            : 'border-border/80 bg-gradient-to-br from-surface-accent/90 via-surface to-bg-secondary hover:border-blue-light/35 hover:from-blue-glow/10',
        disabled &&
          'cursor-not-allowed opacity-100 hover:translate-y-0 hover:scale-100 hover:border-blue-light/50',
      )}
      style={{ animationDelay: `${80 + index * 60}ms` }}
    >
      <span className="past-option-card__orb past-option-card__orb--a" aria-hidden />
      <span className="past-option-card__orb past-option-card__orb--b" aria-hidden />
      <span className="past-option-card__stars" aria-hidden />
      <span className="past-option-card__sheen" aria-hidden />

      {locked && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] bg-bg/35"
        />
      )}

      <div className="relative z-[3] flex items-start gap-3">
        <span
          className={cn(
            'past-option-card__glyphs inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5',
            selected
              ? 'border-blue-light/40 bg-blue-glow/20 text-blue-light'
              : locked
                ? 'border-border bg-surface-sunken text-muted'
                : 'border-border bg-surface text-blue-light/90 group-hover:border-blue-light/35',
          )}
        >
          {insight.planets.map((code) => (
            <PlanetGlyph key={code} code={code} size="sm" />
          ))}
        </span>
        <span
          className={cn(
            'ml-auto inline-flex size-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
            selected
              ? 'past-option-card__check--on border-blue-light bg-blue-glow text-white shadow-[0_0_14px_rgba(201,145,115,0.55)]'
              : locked
                ? 'past-lock-ring border-blue-light/40 bg-blue-glow/15 text-blue-light'
                : 'border-border text-transparent group-hover:border-blue-light/40',
          )}
          aria-hidden
        >
          {locked ? (
            <Lock className="size-3.5" strokeWidth={2.5} />
          ) : (
            <Check className="size-3" strokeWidth={3} />
          )}
        </span>
      </div>

      <p
        className={cn(
          'relative z-[3] mt-3.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]',
          locked ? 'text-faint' : 'text-blue-light/85',
        )}
      >
        Bhava {insight.bhava}
      </p>

      <h2
        className={cn(
          'past-option-card__title relative z-[3] mt-1 font-serif font-semibold leading-[1.05] tracking-[-0.03em]',
          'text-[1.7rem] sm:text-[1.9rem] lg:text-[2.05rem]',
          locked ? 'text-muted' : 'text-ink',
        )}
      >
        {insight.category}
      </h2>
      <p
        className={cn(
          'relative z-[3] mt-2 flex-1 text-[13.5px] leading-relaxed',
          locked ? 'text-faint' : 'text-text-secondary',
        )}
      >
        {insight.blurb}
      </p>

      {locked && (
        <p className="relative z-[3] mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-light/80">
          <Lock className="size-3" strokeWidth={2.5} aria-hidden />
          {lockHint}
        </p>
      )}
    </button>
  )
}

function PastReadingDetail({
  insight,
  onDownloadReport,
  reportPaid = false,
  downloadReady = false,
}: {
  insight: PastInsight
  onDownloadReport: () => void
  reportPaid?: boolean
  downloadReady?: boolean
}) {
  return (
    <article className="animate-fade-in space-y-5">
      <div className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-silver-300">
          {insight.category}
        </p>
        <p className="font-serif text-title text-ink text-pretty lg:text-title-lg">
          {insight.verdict}
        </p>
      </div>

      <section>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          What your chart points to
        </h3>
        <ul className="mt-3 space-y-2">
          {insight.points.map((point) => (
            <li key={point} className="flex gap-2 text-body text-ink text-pretty">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-info" aria-hidden />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          Planetary influence
        </h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {insight.planets.map((code: GrahaCode) => (
            <li
              key={code}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-sunken px-3 py-2"
            >
              <PlanetGlyph code={code} size="md" withName />
              <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted">
                {GRAHAS[code].english}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap items-end justify-between gap-3 border-t border-border pt-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
          Source · {bhavaRef(insight.bhava)} · {insight.source}
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={onDownloadReport}
          iconLeft={
            reportPaid ? (
              <Crown className="size-3.5" strokeWidth={2} />
            ) : (
              <Download className="size-3.5" strokeWidth={2} />
            )
          }
          className="rounded-full"
        >
          {downloadReady && !reportPaid ? 'Report ready' : 'Download report'}
          {reportPaid && (
            <span className="ml-1 font-mono text-[9px] uppercase tracking-[0.12em] text-silver-300">
              Plus
            </span>
          )}
        </Button>
      </div>
    </article>
  )
}
