import type { GrahaCode } from '@/types/astrology'
import { ArrowLeft, Check, Home, Lock, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { QuestionComposer } from '@/components/ask/QuestionComposer'
import { Button } from '@/components/common/Button'
import { GalaxyBackdrop } from '@/components/celestial/GalaxyBackdrop'
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
  hasSeenPastIntro,
  markPastIntroSeen,
  savePastSelections,
} from '@/onboarding/past-intro'
import { paths } from '@/routes/paths'
import { bhavaRef, GRAHAS } from '@/utils/astro'
import { cn } from '@/utils/cn'

/** Shared glass surface for Know Your Past panels. */
const glassSurface =
  'rounded-[18px] border border-celestial-line/80 bg-indigo-deep/72 shadow-[inset_0_1px_0_rgba(253,248,244,0.04)] backdrop-blur-md'

/**
 * Know Your Past — once after signup.
 * Choose 1–3 areas; full-screen reveal with one past at a time.
 * After Lock and continue, going back keeps the picks frozen.
 */
export default function PastInsightPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [picked, setPicked] = useState<PastInsightCategory[]>([])
  const [revealOpen, setRevealOpen] = useState(false)
  const [activeId, setActiveId] = useState<PastInsightCategory | null>(null)
  /** Once locked, the three picks cannot be changed — even after going back. */
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
    setSelectionsLocked(true)
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
        insights={revealed}
        activeId={activeInsight.id}
        onSelect={setActiveId}
        onBack={goBackToChoices}
        onHome={() => leave(paths.home)}
        onContinue={finish}
        onAsk={(question) => leave(paths.ask, question)}
        onLookCalculation={() => leave(paths.chart)}
      />
    )
  }

  return (
    <GalaxyBackdrop
      intensity="quiet"
      className="h-dvh max-h-dvh overflow-hidden"
      contentClassName="relative flex h-dvh max-h-dvh flex-col overflow-hidden"
    >
      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col overflow-hidden px-5 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-6">
        <header className="relative shrink-0 animate-rise text-center">
          <p
            className={cn(
              'absolute top-0 right-0 font-mono text-[11px] uppercase tracking-[0.16em]',
              atLimit || selectionsLocked ? 'text-gold-deep' : 'text-muted',
            )}
            aria-live="polite"
          >
            {selectionsLocked ? 'Locked' : `${picked.length} / ${MAX_PAST_SELECTIONS}`}
          </p>

          <h1 className="font-serif text-[2.75rem] leading-[1.05] font-normal tracking-[-0.03em] text-ink sm:text-[3.5rem] lg:text-[4rem]">
            Know your past.
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-[13px] leading-snug text-purple text-pretty sm:text-[14px]">
            {selectionsLocked
              ? 'Your areas are locked. Continue to read them, or skip for now.'
              : `Choose up to ${MAX_PAST_SELECTIONS} areas. Your chart will show what it carried there — or skip and continue.`}
          </p>
        </header>

        <section
          className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden lg:mt-5"
          aria-label={
            selectionsLocked
              ? 'Locked past areas'
              : `Choose up to ${MAX_PAST_SELECTIONS} past areas`
          }
        >
          <p className="mb-2 shrink-0 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-purple">
            {selectionsLocked
              ? 'Selections locked'
              : `Choose up to ${MAX_PAST_SELECTIONS}`}
          </p>

          <div className="grid min-h-0 flex-1 grid-cols-2 gap-2.5 overflow-hidden sm:gap-3 lg:auto-rows-fr lg:grid-cols-3">
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
            className="py-1 text-sm font-medium text-purple underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Skip for now
          </button>

          <Button
            variant="celestial"
            size="md"
            onClick={openReveal}
            disabled={!canContinue}
            className="rounded-full px-6"
          >
            {selectionsLocked ? 'Continue →' : 'Lock and continue'}
          </Button>
        </div>
      </div>
    </GalaxyBackdrop>
  )
}

/** Full-screen past reader — areas on the left, detail on the right. */
function PastRevealScreen({
  insights,
  activeId,
  onSelect,
  onBack,
  onHome,
  onContinue,
  onAsk,
  onLookCalculation,
}: {
  insights: PastInsight[]
  activeId: PastInsightCategory
  onSelect: (id: PastInsightCategory) => void
  onBack: () => void
  onHome: () => void
  onContinue: () => void
  onAsk: (question: string) => void
  onLookCalculation: () => void
}) {
  const active = insights.find((item) => item.id === activeId) ?? insights[0]

  return (
    <GalaxyBackdrop
      intensity="quiet"
      className="h-dvh max-h-dvh"
      contentClassName="relative flex h-dvh max-h-dvh flex-col overflow-hidden"
    >
      <header className="relative z-10 shrink-0 border-b border-celestial-line px-4 pb-3 pt-safe sm:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-[90rem] items-center gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to choices"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-celestial-line bg-indigo-deep/65 text-ink transition-colors hover:border-gold/45"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold-deep">
              Your past
            </p>
            <p className="truncate text-sm text-purple">
              {insights.length} area{insights.length === 1 ? '' : 's'} from your chart · tap a card
            </p>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid min-h-0 w-full max-w-[90rem] flex-1 grid-cols-1 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <aside
          className="shrink-0 border-b border-celestial-line px-4 py-4 sm:px-8 lg:border-b-0 lg:border-r lg:border-celestial-line lg:px-6 lg:py-6 xl:px-8"
          aria-label="Selected past areas"
        >
          <div
            className="flex gap-2 overflow-x-auto no-scrollbar sm:gap-3 lg:flex-col lg:overflow-visible"
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
                      ? 'border-gold/55 bg-deep-burgundy/55 shadow-[0_0_0_1px_rgba(220,132,79,0.12)]'
                      : 'border-celestial-line/80 bg-indigo-deep/55 hover:border-gold/30',
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {insight.planets.map((code) => (
                      <PlanetGlyph key={code} code={code} size="sm" tone="dark" />
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

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar px-5 py-6 sm:px-8 lg:px-10 lg:py-8"
          role="tabpanel"
          aria-label={active.category}
        >
          <div className={cn(glassSurface, 'p-5 sm:p-7')}>
            <InsightDetail
              key={active.id}
              insight={active}
              tone="dark"
              onAsk={onAsk}
              onLookCalculation={onLookCalculation}
            />
          </div>
        </div>
      </div>

      <div className="relative z-20 shrink-0 border-t border-celestial-line bg-midnight/82 backdrop-blur-xl pb-safe">
        <div className="mx-auto flex w-full max-w-[90rem] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={onHome}
            className="inline-flex items-center gap-2 py-1 text-sm font-medium text-purple transition-colors hover:text-ink"
          >
            <Home className="size-4" strokeWidth={1.75} />
            Home
          </button>

          <Button
            variant="celestial"
            size="lg"
            onClick={onContinue}
            className="rounded-full sm:min-w-[14rem]"
          >
            Continue →
          </Button>
        </div>
      </div>
    </GalaxyBackdrop>
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
        'group relative flex min-h-0 flex-col overflow-hidden rounded-[16px] border px-3.5 py-3 text-left',
        'transition-[border-color,transform,background-color,box-shadow,opacity] duration-250 ease-out-soft',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/55 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight',
        'animate-rise hover:-translate-y-0.5 lg:h-full',
        selected
          ? 'border-gold/55 bg-nebula-plum/90 shadow-[0_0_0_1px_rgba(220,132,79,0.1),0_12px_32px_-18px_rgba(220,132,79,0.35)]'
          : 'border-celestial-line/80 bg-indigo-deep/72 shadow-[inset_0_1px_0_rgba(253,248,244,0.04)] backdrop-blur-md hover:border-muted-plum hover:bg-nebula-plum/85',
        disabled &&
          'cursor-not-allowed opacity-45 hover:translate-y-0 hover:border-celestial-line/80 hover:bg-indigo-deep/72',
        selected && disabled && 'opacity-100',
      )}
      style={{ animationDelay: `${120 + index * 50}ms` }}
    >
      <div className="flex items-start gap-2">
        <span className="flex items-center gap-1 text-gold-deep/90">
          {insight.planets.map((code) => (
            <PlanetGlyph key={code} code={code} size="sm" tone="dark" />
          ))}
        </span>
        <span className="ml-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-muted">
          {insight.period}
        </span>
        <span
          className={cn(
            'ml-auto inline-flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-250',
            selected
              ? 'border-gold bg-gold text-midnight'
              : showLock
                ? 'border-gold/35 bg-gold-soft/55 text-gold-deep'
                : 'border-celestial-line text-transparent',
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

function InsightDetail({
  insight,
  tone = 'light',
  onAsk,
  onLookCalculation,
}: {
  insight: PastInsight
  tone?: 'light' | 'dark'
  onAsk?: (question: string) => void
  onLookCalculation?: () => void
}) {
  const dark = tone === 'dark'
  return (
    <article className="animate-fade-in space-y-5">
      <div>
        <p
          className={cn(
            'text-[11px] font-medium uppercase tracking-[0.16em]',
            dark ? 'text-gold-deep' : 'text-muted',
          )}
        >
          {insight.category} · {insight.period}
        </p>
        <p
          className={cn(
            'mt-2 font-serif text-title text-pretty lg:text-title-lg',
            dark ? 'text-ink' : 'text-ink',
          )}
        >
          {insight.verdict}
        </p>
      </div>

      <section>
        <h3
          className={cn(
            'text-[11px] font-medium uppercase tracking-[0.14em]',
            dark ? 'text-purple' : 'text-muted',
          )}
        >
          What your chart points to
        </h3>
        <ul className="mt-3 space-y-2">
          {insight.points.map((point) => (
            <li
              key={point}
              className={cn(
                'flex gap-2 text-body text-pretty',
                dark ? 'text-purple' : 'text-ink',
              )}
            >
              <span className="mt-2 size-1 shrink-0 rounded-full bg-gold" aria-hidden />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3
          className={cn(
            'text-[11px] font-medium uppercase tracking-[0.14em]',
            dark ? 'text-purple' : 'text-muted',
          )}
        >
          Planetary influence
        </h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {insight.planets.map((code: GrahaCode) => (
            <li
              key={code}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-2',
                dark
                  ? 'border-celestial-line/80 bg-midnight/45'
                  : 'border-border bg-surface-sunken',
              )}
            >
              <PlanetGlyph code={code} size="md" withName tone={dark ? 'dark' : 'light'} />
              <span
                className={cn(
                  'text-[10px] font-medium uppercase tracking-[0.1em]',
                  dark ? 'text-muted' : 'text-muted',
                )}
              >
                {GRAHAS[code].english}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p
        className={cn(
          'border-t pt-4 text-[10px] font-medium uppercase tracking-[0.14em]',
          dark
            ? 'border-celestial-line text-muted'
            : 'border-border text-muted',
        )}
      >
        Source · {bhavaRef(insight.bhava)} · {insight.source}
      </p>

      {(onAsk || onLookCalculation) && (
        <div
          className={cn(
            'space-y-3 border-t pt-5',
            dark ? 'border-celestial-line' : 'border-border',
          )}
        >
          {onAsk && (
            <QuestionComposer
              key={insight.id}
              variant="bar"
              tone={dark ? 'dark' : 'light'}
              placeholder={`Ask about your past in ${insight.category.toLowerCase()}…`}
              onAsk={onAsk}
            />
          )}
          {onLookCalculation && (
            <Button
              variant={dark ? 'celestial' : 'primary'}
              size="md"
              onClick={onLookCalculation}
              iconLeft={<Sparkles className="size-4" strokeWidth={1.75} />}
              className="w-full rounded-full sm:w-auto"
            >
              Look your calculation
            </Button>
          )}
        </div>
      )}
    </article>
  )
}
