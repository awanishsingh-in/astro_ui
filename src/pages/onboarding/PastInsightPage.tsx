import type { GrahaCode } from '@/types/astrology'
import { ArrowLeft, Check, Crown, Download, Lock, Orbit } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { ChatPaywall } from '@/components/ask/ChatPaywall'
import { QuestionComposer } from '@/components/ask/QuestionComposer'
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
  'rounded-[18px] border border-white/10 bg-[#0e0820]/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md'

const ADVENTURE_BTN =
  'rounded-full border-0 bg-gradient-to-r from-[#7c4dff] to-[#3a7bd5] text-white shadow-[0_12px_32px_-12px_rgba(124,77,255,0.75)] hover:from-[#8b5cff] hover:to-[#4a8be5] focus-visible:outline-[#c4a0ff]'

const ADVENTURE_BTN_SECONDARY =
  'rounded-full border border-white/15 bg-[#0e0820] text-white hover:border-[#c4a0ff]/40 hover:bg-[#7c4dff]/15'

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
    // Only lock remaining cards once all 3 free slots are filled.
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
        onLookCalculation={() => leave(paths.chart)}
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
          <p className="mx-auto mt-2 max-w-lg text-[13px] leading-snug text-white/55 text-pretty sm:text-[14px]">
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
              'hover:border-[#c4a0ff]/40 hover:bg-[#7c4dff]/15 hover:text-white',
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
            {selectionsLocked ? 'Open my past →' : 'Save and continue'}
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
  onLookCalculation,
}: {
  userId: string
  insights: PastInsight[]
  activeId: PastInsightCategory
  onSelect: (id: PastInsightCategory) => void
  onBack: () => void
  onContinue: () => void
  onAsk: (question: string) => void
  onLookCalculation: () => void
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
        contentClassName="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-[#07041a]/40"
      >
        <header className="relative z-10 shrink-0 border-b border-white/10 px-4 pb-3 pt-safe sm:px-8 lg:px-12">
          <div className="mx-auto flex w-full max-w-[90rem] items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to choices"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#0e0820]/80 text-white transition-colors hover:border-[#c4a0ff]/45"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#c4a0ff]">
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
                        ? 'border-[#c4a0ff]/55 bg-[#7c4dff]/25 shadow-[0_0_0_1px_rgba(124,77,255,0.2)]'
                        : 'border-white/10 bg-[#0e0820]/70 hover:border-[#c4a0ff]/30',
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
                  onLookCalculation={onLookCalculation}
                  onDownloadReport={requestDownload}
                  reportPaid={!planUnlocked}
                  downloadReady={downloadReady}
                />
              </div>

              <QuestionComposer
                key={`ask-${active.id}`}
                variant="bar"
                tone="adventure"
                className="w-full"
                placeholder={`Ask about your past in ${active.category.toLowerCase()}…`}
                onAsk={onAsk}
              />
            </div>
          </div>
        </div>

        <div className="relative z-20 shrink-0 border-t border-white/10 bg-[#07041a]/92 backdrop-blur-xl pb-safe">
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
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      aria-disabled={disabled}
      className={cn(
        'past-option-card group relative flex min-h-0 flex-col overflow-hidden rounded-[18px] border px-4 py-3.5 text-left sm:px-4 sm:py-4',
        'transition-[border-color,transform,background-color,opacity] duration-300 ease-out-soft',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4a0ff]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07041a]',
        'hover:-translate-y-1 hover:scale-[1.015] active:scale-[0.99] lg:h-full',
        selected
          ? 'border-[#c4a0ff]/60 bg-[#1a1238]'
          : 'border-white/12 bg-[#12102a] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-[#c4a0ff]/40 hover:bg-[#18143a]',
        disabled &&
          'cursor-not-allowed opacity-55 hover:translate-y-0 hover:scale-100 hover:border-white/12 hover:bg-[#12102a]',
        selected && disabled && 'opacity-100',
      )}
      style={{ animationDelay: `${90 + index * 70}ms` }}
    >
      <span className="past-option-card__sheen" aria-hidden />

      <div className="relative z-[1] flex items-start gap-2">
        <span className="past-option-card__glyphs flex items-center gap-1.5 text-[#c4a0ff]">
          {insight.planets.map((code) => (
            <PlanetGlyph key={code} code={code} size="sm" tone="dark" />
          ))}
        </span>
        <span
          className={cn(
            'ml-auto inline-flex size-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
            selected
              ? 'past-option-card__check--on border-[#c4a0ff] bg-[#7c4dff] text-white shadow-[0_0_12px_rgba(124,77,255,0.55)]'
              : showLock
                ? 'border-[#c4a0ff]/40 bg-[#7c4dff]/20 text-[#c4a0ff]'
                : 'border-white/20 text-transparent group-hover:border-[#c4a0ff]/35',
          )}
          aria-hidden
        >
          {showLock && !selected ? (
            <Lock className="size-2.5" strokeWidth={2.5} />
          ) : (
            <Check className="size-2.5" strokeWidth={3} />
          )}
        </span>
      </div>

      <h2
        className={cn(
          'past-option-card__title relative z-[1] mt-3 font-serif font-semibold leading-[1.05] tracking-[-0.03em] text-white',
          'text-[1.65rem] sm:text-[1.85rem] lg:text-[2rem]',
        )}
      >
        {insight.category}
      </h2>
      <p className="relative z-[1] mt-2 flex-1 text-[13px] leading-relaxed text-white/60 sm:text-[13.5px] sm:leading-relaxed">
        {insight.blurb}
      </p>
    </button>
  )
}

function InsightDetail({
  insight,
  onLookCalculation,
  onDownloadReport,
  reportPaid = false,
  downloadReady = false,
}: {
  insight: PastInsight
  onLookCalculation?: () => void
  onDownloadReport?: () => void
  /** When true, download is gated behind Plus. */
  reportPaid?: boolean
  downloadReady?: boolean
}) {
  return (
    <article className="animate-fade-in space-y-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2.5">
          <p className="pt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#c4a0ff]">
            {insight.category}
          </p>

          {(onLookCalculation || onDownloadReport) && (
            <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
              {onLookCalculation && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLookCalculation}
                  iconLeft={<Orbit className="size-3.5" strokeWidth={2} />}
                  className={ADVENTURE_BTN}
                >
                  Look your calculation
                </Button>
              )}
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
                    <span className="ml-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#c4a0ff]">
                      Plus
                    </span>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        <p className="font-serif text-title text-white text-pretty lg:text-title-lg">
          {insight.verdict}
        </p>
      </div>

      <section>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
          What your chart points to
        </h3>
        <ul className="mt-3 space-y-2">
          {insight.points.map((point) => (
            <li key={point} className="flex gap-2 text-body text-white/70 text-pretty">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#5ed7f2]" aria-hidden />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
          Planetary influence
        </h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {insight.planets.map((code: GrahaCode) => (
            <li
              key={code}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#07041a]/55 px-3 py-2"
            >
              <PlanetGlyph code={code} size="md" withName tone="dark" />
              <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-white/45">
                {GRAHAS[code].english}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="border-t border-white/10 pt-4 text-[10px] font-medium uppercase tracking-[0.14em] text-white/35">
        Source · {bhavaRef(insight.bhava)} · {insight.source}
      </p>
    </article>
  )
}
