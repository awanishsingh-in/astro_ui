import type { GrahaCode } from '@/types/astrology'
import { ArrowLeft, Check, Crown, Download, Lock, MessageCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { ChatPaywall } from '@/components/ask/ChatPaywall'
import { Button } from '@/components/common/Button'
import { PastAeroSky } from '@/components/celestial/PastAeroSky'
import { useAuth } from '@/auth/auth-context'
import {
  insightsByIds,
  MAX_PAST_SELECTIONS,
  MIN_PAST_SELECTIONS,
  PAST_INSIGHTS,
  type PastInsight,
  type PastInsightCategory,
} from '@/data/past-insights'
import {
  hasActivePlan,
  hasSeenPastIntro,
  markPastIntroSeen,
  savePastSelections,
  unlockPlan,
} from '@/onboarding/past-intro'
import { paths } from '@/routes/paths'
import { bhavaRef, GRAHAS } from '@/utils/astro'
import { cn } from '@/utils/cn'

/** Shared glass surface for Know Your Past panels. */
const glassSurface =
  'rounded-[18px] border border-white/10 bg-surface/85 shadow-[inset_0_1px_0_rgba(253,248,244,0.08)] backdrop-blur-md'

const ADVENTURE_BTN =
  'rounded-full border-0 btn-primary shadow-[0_12px_32px_-12px_rgba(201,145,115,0.55)] focus-visible:outline-accent'

const ADVENTURE_BTN_SECONDARY = 'rounded-full btn-copper-outline'

/**
 * Know Your Past — once after signup.
 * Choose 1–3 areas; full-screen reveal with one past at a time.
 * Remaining cards stay open until all 3 free slots are filled.
 */
export default function PastInsightPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [picked, setPicked] = useState<PastInsightCategory[]>([])
  const [revealOpen, setRevealOpen] = useState(false)
  const [activeId, setActiveId] = useState<PastInsightCategory | null>(null)
  /** Freeze unselected cards only after all 3 free slots are used. */
  const [selectionsLocked, setSelectionsLocked] = useState(false)

  const revealed = useMemo(() => insightsByIds(picked), [picked])
  const activeInsight = revealed.find((item) => item.id === activeId) ?? revealed[0] ?? null

  if (!user) return <Navigate to={paths.signUp} replace />
  if (hasSeenPastIntro(user.id)) return <Navigate to={paths.ask} replace />

  const atLimit = picked.length >= MAX_PAST_SELECTIONS
  const canContinue = picked.length >= MIN_PAST_SELECTIONS

  const toggle = (id: PastInsightCategory) => {
    // After Lock and continue, the set cannot change on this screen.
    if (selectionsLocked) return
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id)
      if (prev.length >= MAX_PAST_SELECTIONS) return prev
      return [...prev, id]
    })
  }

  const openReveal = () => {
    if (!canContinue) return
    savePastSelections(user.id, picked)
    // “Lock and continue” freezes the three picks for Your Past (free tier).
    setSelectionsLocked(picked.length >= MAX_PAST_SELECTIONS)
    setActiveId(picked[0])
    setRevealOpen(true)
  }

  const goBackToChoices = () => {
    setRevealOpen(false)
  }

  const leave = (to: string, question?: string) => {
    if (picked.length > 0) savePastSelections(user.id, picked)
    markPastIntroSeen(user.id)
    if (question) {
      navigate(`${to}?q=${encodeURIComponent(question)}`, { replace: true })
      return
    }
    navigate(to, { replace: true })
  }

  const finish = () => leave(paths.ask)

  if (revealOpen && activeInsight) {
    return (
      <PastRevealScreen
        userId={user.id}
        insights={revealed}
        activeId={activeInsight.id}
        onSelect={setActiveId}
        onBack={goBackToChoices}
        onContinue={finish}
        onAsk={(question) => leave(paths.ask, question)}
      />
    )
  }

  return (
    <PastAeroSky
      className="h-dvh max-h-dvh overflow-hidden"
      contentClassName="relative flex h-dvh max-h-dvh flex-col overflow-hidden"
    >
      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col overflow-hidden px-5 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-6">
        <header className="relative shrink-0 animate-rise text-center">
          <h1 className="font-serif text-[2.75rem] leading-[1.05] font-normal tracking-[-0.03em] text-white sm:text-[3.5rem] lg:text-[4rem]">
            Know your past.
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-[13px] leading-snug text-text-secondary text-pretty sm:text-[14px]">
            {selectionsLocked
              ? 'Your three areas are locked. Open them to read, or keep exploring.'
              : `Pick up to ${MAX_PAST_SELECTIONS} areas — your chart shows what it carried there.`}
          </p>
        </header>

        <section
          className="mt-4 flex min-h-0 flex-1 flex-col lg:mt-5"
          aria-label={
            selectionsLocked
              ? 'Locked past areas'
              : `Choose up to ${MAX_PAST_SELECTIONS} past areas`
          }
        >
          <div className="grid min-h-0 flex-1 grid-cols-2 gap-2.5 overflow-visible pt-1.5 sm:gap-3 lg:auto-rows-fr lg:grid-cols-3">
            {PAST_INSIGHTS.map((insight, index) => {
              const isOn = picked.includes(insight.id)
              const lockedOut = selectionsLocked || (atLimit && !isOn)
              return (
                <PastOptionCard
                  key={insight.id}
                  insight={insight}
                  index={index}
                  selected={isOn}
                  disabled={lockedOut}
                  showLock={!isOn && (selectionsLocked || atLimit)}
                  onToggle={() => toggle(insight.id)}
                />
              )
            })}
          </div>
        </section>

        <div className="mt-3 flex shrink-0 items-center justify-between gap-4 animate-rise sm:mt-4 [animation-delay:200ms]">
          <button
            type="button"
            onClick={finish}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2.5',
              'text-sm font-semibold text-white/70 transition-all duration-200',
              'hover:border-accent/40 hover:bg-primary/15 hover:text-silver-300',
            )}
          >
            Skip this step →
          </button>

          <Button
            variant="ghost"
            size="md"
            onClick={openReveal}
            disabled={!canContinue}
            className={cn(
              'px-7',
              canContinue ? ADVENTURE_BTN : 'rounded-full border-0 bg-white/10 text-white/35',
            )}
          >
            {selectionsLocked
              ? 'Open my past →'
              : atLimit
                ? 'Lock and continue'
                : 'Save and continue'}
          </Button>
        </div>
      </div>
    </PastAeroSky>
  )
}

/** Full-screen past reader — areas on the left, detail on the right. */
function PastRevealScreen({
  userId,
  insights,
  activeId,
  onSelect,
  onBack,
  onContinue,
  onAsk,
}: {
  userId: string
  insights: PastInsight[]
  activeId: PastInsightCategory
  onSelect: (id: PastInsightCategory) => void
  onBack: () => void
  onContinue: () => void
  onAsk: (question: string) => void
}) {
  const active = insights.find((item) => item.id === activeId) ?? insights[0]
  const [planUnlocked, setPlanUnlocked] = useState(() => hasActivePlan(userId))
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [downloadReady, setDownloadReady] = useState(false)

  const requestDownload = () => {
    if (!planUnlocked) {
      setPaywallOpen(true)
      return
    }
    setDownloadReady(true)
  }

  const confirmPlan = (_planId: string) => {
    unlockPlan(userId)
    setPlanUnlocked(true)
    setPaywallOpen(false)
    setDownloadReady(true)
  }

  return (
    <>
      <PastAeroSky
        className="h-dvh max-h-dvh"
        contentClassName="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-bg/40"
      >
        <header className="relative z-10 shrink-0 border-b border-white/10 px-4 pb-3 pt-safe sm:px-8 lg:px-12">
          <div className="mx-auto flex w-full max-w-[90rem] items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to choices"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-surface/80 text-white transition-colors hover:border-accent/45"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-silver-300">
                Your past
              </p>
              <p className="truncate text-sm text-white/55">
                {insights.length} area{insights.length === 1 ? '' : 's'} from your chart · tap a card
              </p>
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid min-h-0 w-full max-w-[90rem] flex-1 grid-cols-1 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          <aside
            className="shrink-0 border-b border-white/10 px-4 py-4 sm:px-8 lg:border-b-0 lg:border-r lg:border-white/10 lg:px-6 lg:py-6 xl:px-8"
            aria-label="Selected past areas"
          >
            <div
              className="flex gap-2 overflow-x-auto pt-1 no-scrollbar sm:gap-3 lg:flex-col lg:overflow-visible"
              role="tablist"
            >
              {insights.map((insight) => {
                const selected = insight.id === active.id
                return (
                  <button
                    key={insight.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => onSelect(insight.id)}
                    className={cn(
                      'flex min-w-[9.5rem] flex-col rounded-[16px] border px-3.5 py-3 text-left transition-[border-color,background-color,box-shadow] duration-250 ease-out-soft sm:min-w-[11rem] lg:min-w-0 lg:w-full',
                      selected
                        ? 'border-accent/55 bg-primary/25 shadow-[0_0_0_1px_rgba(201,145,115,0.45)]'
                        : 'border-white/10 bg-surface/70 hover:border-accent/30',
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      {insight.planets.map((code) => (
                        <PlanetGlyph key={code} code={code} size="sm" tone="dark" />
                      ))}
                    </span>
                    <span className="mt-2 line-clamp-2 font-serif text-base text-white">
                      {insight.category}
                    </span>
                  </button>
                )
              })}
            </div>
          </aside>

          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar px-5 py-6 sm:px-8 lg:px-10 lg:py-8"
            role="tabpanel"
            aria-label={active.category}
          >
            <div className="flex w-full flex-col gap-4">
              <div className={cn(glassSurface, 'w-full p-5 sm:p-7 lg:p-8')}>
                <InsightDetail
                  key={active.id}
                  insight={active}
                  onDownloadReport={requestDownload}
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
                  onAsk(`Tell me more about my past in ${active.category.toLowerCase()}.`)
                }
                className={cn(
                  'rounded-full border-0 btn-primary',
                  'shadow-[0_0_28px_-6px_rgba(201,145,115,0.55)]',
                  'hover:shadow-[0_0_36px_-4px_rgba(201,145,115,0.55)]',
                )}
              >
                Ask about this
              </Button>
            </div>
          </div>
        </div>

        <div className="relative z-20 shrink-0 border-t border-white/10 bg-bg/92 backdrop-blur-xl pb-safe">
          <div className="mx-auto flex w-full max-w-[90rem] items-center justify-end gap-4 px-5 py-4 sm:px-8 lg:px-12">
            <Button
              variant="ghost"
              size="lg"
              onClick={onContinue}
              className={cn(ADVENTURE_BTN, 'sm:min-w-[14rem]')}
            >
              Continue →
            </Button>
          </div>
        </div>
      </PastAeroSky>

      <ChatPaywall
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onUnlock={confirmPlan}
        title="Download needs a plan"
        description="Past reports are included with Cyklos Plus. Unlock to save this reading as a PDF."
        benefit="Plus unlocks downloadable past reports — keep a copy of what your chart carried."
        unlockLabel="Unlock downloads"
      />
    </>
  )
}

function PastOptionCard({
  insight,
  index,
  selected,
  disabled,
  showLock,
  onToggle,
}: {
  insight: PastInsight
  index: number
  selected: boolean
  disabled: boolean
  /** Lock mark on cards that cannot be chosen. */
  showLock?: boolean
  onToggle: () => void
}) {
  const locked = Boolean(showLock && !selected)

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      aria-disabled={disabled || locked}
      className={cn(
        'past-option-card group relative flex min-h-0 flex-col overflow-hidden rounded-[1.35rem] border px-4 py-4 text-left sm:px-5 sm:py-5',
        'backdrop-blur-md transition-[border-color,transform,background-color,opacity,box-shadow] duration-300 ease-out-soft',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-glow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]',
        !locked && 'hover:-translate-y-1.5 hover:scale-[1.02] active:scale-[0.99]',
        'lg:h-full',
        selected
          ? 'border-blue-light/55 bg-gradient-to-br from-blue-glow/25 via-[#2E1623] to-[#1B101D]'
          : locked
            ? 'cursor-not-allowed border-white/10 bg-[#0F0B19]/90 opacity-70'
            : 'border-white/14 bg-gradient-to-br from-[#2E1623]/95 via-[#1B101D] to-[#0F0B19] shadow-[inset_0_1px_0_rgba(253,248,244,0.08)] hover:border-blue-light/40 hover:from-blue-glow/15 hover:via-[#2E1623] hover:to-[#1B101D]',
        disabled &&
          !locked &&
          'cursor-not-allowed opacity-55 hover:translate-y-0 hover:scale-100 hover:border-white/14',
        selected && disabled && 'opacity-100',
      )}
      style={{ animationDelay: `${90 + index * 70}ms` }}
    >
      <span className="past-option-card__orb past-option-card__orb--a" aria-hidden />
      <span className="past-option-card__orb past-option-card__orb--b" aria-hidden />
      <span className="past-option-card__stars" aria-hidden />
      <span className="past-option-card__sheen" aria-hidden />

      {locked && (
        <span aria-hidden className="pointer-events-none absolute inset-0 z-[2] bg-black/30" />
      )}

      <div className="relative z-[3] flex items-start gap-3">
        <span
          className={cn(
            'past-option-card__glyphs inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5',
            selected
              ? 'border-blue-light/40 bg-blue-glow/20 text-blue-light shadow-[0_0_18px_-6px_rgba(201,145,115,0.55)]'
              : locked
                ? 'border-white/10 bg-white/5 text-white/35'
                : 'border-white/15 bg-white/5 text-blue-light/90 group-hover:border-blue-light/35 group-hover:bg-blue-glow/15',
          )}
        >
          {insight.planets.map((code) => (
            <PlanetGlyph key={code} code={code} size="sm" tone="dark" />
          ))}
        </span>
        <span
          className={cn(
            'ml-auto inline-flex size-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
            selected
              ? 'past-option-card__check--on border-blue-light bg-blue-glow text-white shadow-[0_0_16px_rgba(201,145,115,0.55)]'
              : locked
                ? 'border-blue-light/35 bg-blue-glow/15 text-blue-light'
                : 'border-white/25 bg-black/20 text-transparent group-hover:border-blue-light/45',
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
          'relative z-[3] mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]',
          locked ? 'text-white/30' : 'text-blue-light/80',
        )}
      >
        Bhava {insight.bhava}
      </p>

      <h2
        className={cn(
          'past-option-card__title relative z-[3] mt-1 font-serif font-semibold leading-[1.05] tracking-[-0.03em]',
          'text-[1.75rem] sm:text-[1.95rem] lg:text-[2.15rem]',
          locked ? 'text-white/40' : 'text-white',
        )}
      >
        {insight.category}
      </h2>
      <p
        className={cn(
          'relative z-[3] mt-2.5 flex-1 text-[13.5px] leading-relaxed sm:text-[14px]',
          locked ? 'text-white/35' : 'text-text-secondary',
        )}
      >
        {insight.blurb}
      </p>

      {locked && (
        <p className="relative z-[3] mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-light/75">
          <Lock className="size-3" strokeWidth={2.5} aria-hidden />
          Locked
        </p>
      )}

      {selected && !locked && (
        <p className="relative z-[3] mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-light">
          Selected
        </p>
      )}
    </button>
  )
}

function InsightDetail({
  insight,
  onDownloadReport,
  reportPaid = false,
  downloadReady = false,
}: {
  insight: PastInsight
  onDownloadReport?: () => void
  /** When true, download is gated behind Plus. */
  reportPaid?: boolean
  downloadReady?: boolean
}) {
  return (
    <article className="animate-fade-in space-y-5">
      <div className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-silver-300">
          {insight.category}
        </p>
        <p className="font-serif text-title text-white text-pretty lg:text-title-lg">
          {insight.verdict}
        </p>
      </div>

      <section>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
          What your chart points to
        </h3>
        <ul className="mt-3 space-y-2">
          {insight.points.map((point) => (
            <li key={point} className="flex gap-2 text-body text-text-secondary text-pretty">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
          Planetary influence
        </h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {insight.planets.map((code: GrahaCode) => (
            <li
              key={code}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-bg/55 px-3 py-2"
            >
              <PlanetGlyph code={code} size="md" withName tone="dark" />
              <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted">
                {GRAHAS[code].english}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap items-end justify-between gap-3 border-t border-white/10 pt-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-secondary">
          Source · {bhavaRef(insight.bhava)} · {insight.source}
        </p>
        {onDownloadReport && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownloadReport}
            iconLeft={
              reportPaid ? (
                <Crown className="size-3.5" strokeWidth={2} />
              ) : (
                <Download className="size-3.5" strokeWidth={2} />
              )
            }
            className={ADVENTURE_BTN_SECONDARY}
          >
            {downloadReady && !reportPaid ? 'Report ready' : 'Download report'}
            {reportPaid && (
              <span className="ml-1 font-mono text-[9px] uppercase tracking-[0.12em] text-silver-300">
                Plus
              </span>
            )}
          </Button>
        )}
      </div>
    </article>
  )
}
