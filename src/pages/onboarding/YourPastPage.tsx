import type { GrahaCode } from '@/types/astrology'
import { ArrowLeft, Check, Lock, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { ChatPaywall } from '@/components/ask/ChatPaywall'
import { QuestionComposer } from '@/components/ask/QuestionComposer'
import { Button } from '@/components/common/Button'
import { MobileHeader } from '@/components/navigation/MobileHeader'
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

  const atLimit = picked.length >= MAX_PAST_SELECTIONS
  const slotsLeft = Math.max(0, MAX_PAST_SELECTIONS - picked.length)
  const canContinue = picked.length >= MIN_PAST_SELECTIONS
  const revealed = useMemo(() => insightsByIds(picked), [picked])
  const active = revealed.find((item) => item.id === activeId) ?? revealed[0] ?? null

  if (!user) return null

  const pressCard = (id: PastInsightCategory) => {
    const isOn = picked.includes(id)

    // Already at 3: unselected cards need a plan to change the set.
    if (!isOn && atLimit) {
      if (!planUnlocked) {
        setPaywallOpen(true)
        return
      }
      return
    }

    // Free tier at full lock: selected picks stay fixed until Plus.
    if (selectionsLocked && !planUnlocked) return

    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id)
      if (prev.length >= MAX_PAST_SELECTIONS) return prev
      return [...prev, id]
    })
  }

  const openReveal = () => {
    if (!canContinue) return
    savePastSelections(user.id, picked)
    // Lock the set only once all free slots are filled.
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
  }

  const paywall = (
    <ChatPaywall
      isOpen={paywallOpen}
      onClose={() => setPaywallOpen(false)}
      onUnlock={confirmPlan}
      title="Unlock your past picks"
      description="Free readings cover up to three areas. Cyklos Plus lets you change which ones you read."
      benefit="Upgrade to change your past areas anytime — still up to three at once."
      unlockLabel="Unlock past editing"
    />
  )

  if (revealOpen && active) {
    return (
      <>
        <div className="flex h-[calc(100dvh-var(--spacing-bottomnav))] flex-col overflow-hidden lg:h-full">
          <MobileHeader
            title="Your Past"
            titleAs="p"
            user={user}
            showBack
            onBack={() => setRevealOpen(false)}
          />

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar">
            <PageContainer width="wide" className="space-y-5 py-5 sm:py-6 lg:py-8">
              <header className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setRevealOpen(false)}
                  aria-label="Back to choices"
                  className="mt-0.5 hidden size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink transition-colors hover:border-gold/45 hover:bg-navy-soft lg:inline-flex"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <div className="min-w-0">
                  <p className="font-mono text-label uppercase tracking-[0.14em] text-gold-deep">
                    Your past
                  </p>
                  <h1 className="mt-1 font-serif text-[1.65rem] leading-tight text-ink sm:text-title">
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
                          <span className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">
                            {insight.period}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </aside>

                <section
                  role="tabpanel"
                  aria-label={active.category}
                  className="rounded-panel border border-border bg-surface p-5 sm:p-7"
                >
                  <PastReadingDetail
                    insight={active}
                    onAsk={(question) =>
                      navigate(`${paths.ask}?q=${encodeURIComponent(question)}`)
                    }
                    onLookCalculation={() => navigate(paths.chart)}
                  />
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
      <div className="flex h-[calc(100dvh-var(--spacing-bottomnav))] flex-col overflow-hidden lg:h-full">
        <MobileHeader title="Your Past" titleAs="p" user={user} />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar">
          <PageContainer width="wide" className="flex min-h-full flex-col py-5 sm:py-6 lg:py-8">
            <header className="relative shrink-0 text-center lg:text-left">
              <p
                className={cn(
                  'absolute top-0 right-0 font-mono text-[11px] uppercase tracking-[0.16em] lg:static lg:mb-2',
                  atLimit || selectionsLocked ? 'text-gold-deep' : 'text-muted',
                )}
                aria-live="polite"
              >
                {selectionsLocked && !planUnlocked
                  ? 'Locked'
                  : `${picked.length} / ${MAX_PAST_SELECTIONS}`}
              </p>

              <p className="font-mono text-label uppercase tracking-[0.14em] text-gold-deep">
                Chart history
              </p>
              <h1 className="mt-1 font-serif text-[1.85rem] leading-tight text-ink text-balance sm:text-title lg:text-title-lg">
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
            <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-muted lg:text-left">
              {selectionsLocked && !planUnlocked
                ? 'Selections locked · tap a lock to upgrade'
                : slotsLeft > 0 && stored.length > 0
                  ? `${slotsLeft} left · up to ${MAX_PAST_SELECTIONS}`
                  : `Choose up to ${MAX_PAST_SELECTIONS}`}
            </p>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
                {PAST_INSIGHTS.map((insight, index) => {
                  const isOn = picked.includes(insight.id)
                  const showLock =
                    !planUnlocked && !isOn && atLimit
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
                      onToggle={() => pressCard(insight.id)}
                    />
                  )
                })}
              </div>
            </section>

            <div className="mt-6 flex shrink-0 items-center justify-end gap-4 border-t border-border pt-4">
              <Button
                variant="primary"
                size="md"
                onClick={openReveal}
                disabled={!canContinue}
                className="rounded-full px-6"
              >
                {selectionsLocked && !planUnlocked ? 'Continue →' : 'Lock and continue'}
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
  onToggle,
}: {
  insight: PastInsight
  index: number
  selected: boolean
  disabled: boolean
  showLock?: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'group relative flex min-h-[9.5rem] flex-col overflow-hidden rounded-card border px-3.5 py-3 text-left sm:min-h-[10.5rem]',
        'transition-[border-color,transform,background-color,box-shadow,opacity] duration-200 ease-out-soft',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/55 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'animate-rise hover:-translate-y-0.5',
        selected
          ? 'border-gold/55 bg-gold-soft/35 shadow-[0_0_0_1px_rgba(220,132,79,0.12)]'
          : showLock
            ? 'border-border bg-surface opacity-70 hover:border-gold/40 hover:opacity-100 hover:bg-navy-soft'
            : 'border-border bg-surface hover:border-border-strong hover:bg-navy-soft',
        disabled &&
          'cursor-not-allowed opacity-100 hover:translate-y-0 hover:border-gold/55 hover:bg-gold-soft/35',
      )}
      style={{ animationDelay: `${80 + index * 40}ms` }}
    >
      <div className="flex items-start gap-2">
        <span className="flex items-center gap-1 text-gold-deep/90">
          {insight.planets.map((code) => (
            <PlanetGlyph key={code} code={code} size="sm" />
          ))}
        </span>
        <span className="ml-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-muted">
          {insight.period}
        </span>
        <span
          className={cn(
            'ml-auto inline-flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-200',
            selected
              ? 'border-gold bg-gold text-midnight'
              : showLock
                ? 'border-gold/35 bg-gold-soft text-gold-deep'
                : 'border-border text-transparent',
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

      <h2 className="mt-2 font-serif text-[1.05rem] leading-tight tracking-[-0.01em] text-ink">
        {insight.category}
      </h2>
      <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-purple lg:line-clamp-3">
        {insight.blurb}
      </p>
    </button>
  )
}

function PastReadingDetail({
  insight,
  onAsk,
  onLookCalculation,
}: {
  insight: PastInsight
  onAsk: (question: string) => void
  onLookCalculation: () => void
}) {
  return (
    <article className="animate-fade-in space-y-5">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-gold-deep">
          {insight.category} · {insight.period}
        </p>
        <p className="mt-2 font-serif text-title text-ink text-pretty lg:text-title-lg">
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
              <span className="mt-2 size-1 shrink-0 rounded-full bg-gold" aria-hidden />
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

      <p className="border-t border-border pt-4 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
        Source · {bhavaRef(insight.bhava)} · {insight.source}
      </p>

      <div className="space-y-3 border-t border-border pt-5">
        <QuestionComposer
          key={insight.id}
          variant="bar"
          placeholder={`Ask about your past in ${insight.category.toLowerCase()}…`}
          onAsk={onAsk}
        />
        <Button
          variant="primary"
          size="md"
          onClick={onLookCalculation}
          iconLeft={<Sparkles className="size-4" strokeWidth={1.75} />}
          className="w-full rounded-full sm:w-auto"
        >
          Look your calculation
        </Button>
      </div>
    </article>
  )
}
