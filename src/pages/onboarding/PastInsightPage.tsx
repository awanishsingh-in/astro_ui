import type { GrahaCode, RashiName } from '@/types/astrology'
import { ArrowLeft, ArrowUp, Check } from 'lucide-react'
import { useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { ChatPaywall } from '@/components/ask/ChatPaywall'
import { Button } from '@/components/common/Button'
import { GalaxyBackdrop } from '@/components/celestial/GalaxyBackdrop'
import { useAuth } from '@/auth/auth-context'
import { buildChart } from '@/data/chart-mock'
import {
  insightsByIds,
  MAX_PAST_SELECTIONS,
  PAST_INSIGHTS,
  type PastInsight,
  type PastInsightCategory,
} from '@/data/past-insights'
import { chartSeedFor } from '@/data/profiles'
import {
  hasChatUnlocked,
  hasSeenPastIntro,
  markPastIntroSeen,
  unlockChat,
} from '@/onboarding/past-intro'
import { paths } from '@/routes/paths'
import { bhavaRef, GRAHAS, rashiGlyph } from '@/utils/astro'
import { cn } from '@/utils/cn'
import { formatDateShort, formatTime12, firstNameOf } from '@/utils/format'

/** Shared glass surface for Know Your Past panels. */
const glassSurface =
  'rounded-[18px] border border-[rgba(180,160,255,0.14)] bg-[rgba(17,16,34,0.72)] shadow-[inset_0_1px_0_rgba(255,250,240,0.04)] backdrop-blur-md'

/**
 * Know Your Past — once after signup.
 * Choose up to three areas; full-screen reveal with one past at a time.
 */
export default function PastInsightPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [picked, setPicked] = useState<PastInsightCategory[]>([])
  const [revealOpen, setRevealOpen] = useState(false)
  const [activeId, setActiveId] = useState<PastInsightCategory | null>(null)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [chatUnlocked, setChatUnlocked] = useState(() =>
    user ? hasChatUnlocked(user.id) : false,
  )
  const pendingQuestion = useRef<string | null>(null)

  const chart = useMemo(() => {
    if (!user) return null
    return buildChart(chartSeedFor({ id: 'self', birthDetails: user.birthDetails }), 'D1')
  }, [user])

  const revealed = useMemo(() => insightsByIds(picked), [picked])
  const activeInsight = revealed.find((item) => item.id === activeId) ?? revealed[0] ?? null

  if (!user) return <Navigate to={paths.signUp} replace />
  if (hasSeenPastIntro(user.id)) return <Navigate to={paths.ask} replace />

  const moon = chart?.grahas.find((g) => g.graha === 'Mo')
  const atLimit = picked.length >= MAX_PAST_SELECTIONS

  const toggle = (id: PastInsightCategory) => {
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id)
      if (prev.length >= MAX_PAST_SELECTIONS) return prev
      return [...prev, id]
    })
  }

  const openReveal = () => {
    if (picked.length === 0) return
    setActiveId(picked[0])
    setRevealOpen(true)
  }

  const finish = () => {
    markPastIntroSeen(user.id)
    navigate(paths.ask, { replace: true })
  }

  const goToAsk = (question?: string) => {
    markPastIntroSeen(user.id)
    if (question) {
      navigate(`${paths.ask}?q=${encodeURIComponent(question)}`, { replace: true })
      return
    }
    navigate(paths.ask, { replace: true })
  }

  const askAboutPast = (question: string) => {
    const trimmed = question.trim()
    if (!trimmed) return
    if (!chatUnlocked) {
      pendingQuestion.current = trimmed
      setPaywallOpen(true)
      return
    }
    goToAsk(trimmed)
  }

  const confirmUnlock = (_planId: string) => {
    unlockChat(user.id)
    setChatUnlocked(true)
    setPaywallOpen(false)
    const question = pendingQuestion.current
    pendingQuestion.current = null
    goToAsk(question ?? undefined)
  }

  if (revealOpen && activeInsight) {
    return (
      <>
        <PastRevealScreen
          insights={revealed}
          activeId={activeInsight.id}
          onSelect={setActiveId}
          onBack={() => setRevealOpen(false)}
          onContinue={finish}
        />
        <ChatPaywall
          isOpen={paywallOpen}
          onClose={() => {
            pendingQuestion.current = null
            setPaywallOpen(false)
          }}
          onUnlock={confirmUnlock}
        />
      </>
    )
  }

  return (
    <GalaxyBackdrop
      intensity="quiet"
      className="h-dvh max-h-dvh overflow-hidden"
      contentClassName="relative flex h-dvh max-h-dvh flex-col overflow-hidden"
    >
      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-[90rem] flex-col overflow-hidden px-5 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-6">
        {/* Header — centered title, progress top-right */}
        <header className="relative shrink-0 animate-rise text-center">
          <p
            className={cn(
              'absolute top-0 right-0 font-mono text-[11px] uppercase tracking-[0.16em]',
              atLimit ? 'text-[#C9A96E]' : 'text-[#77728F]',
            )}
            aria-live="polite"
          >
            {picked.length} / {MAX_PAST_SELECTIONS}
          </p>

          <h1 className="font-serif text-[2.75rem] leading-[1.05] font-normal tracking-[-0.03em] text-[#F5F2FF] sm:text-[3.5rem] lg:text-[4rem]">
            Know your past.
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-[13px] leading-snug text-[#B6B1CE] text-pretty sm:text-[14px]">
            Choose up to {MAX_PAST_SELECTIONS} areas. Your chart will show what it carried there —
            or skip and continue.
          </p>
        </header>

        {/* Main fills remaining height — no page scroll */}
        <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:mt-5 lg:grid-cols-[minmax(0,32%)_minmax(0,1fr)] lg:items-stretch lg:gap-6">
          <div className="hidden min-h-0 animate-rise lg:block [animation-delay:60ms]">
            <ChartIdentityCard
              name={user.fullName}
              date={user.birthDetails.date}
              time={user.birthDetails.timeUnknown ? null : user.birthDetails.time}
              place={user.birthDetails.place.label}
              lagna={chart?.lagna.rashi}
              chandra={moon?.rashi}
              nakshatra={moon?.nakshatra.name}
              fill
            />
          </div>

          <section
            className="flex min-h-0 min-w-0 flex-col overflow-hidden"
            aria-label="Choose up to three past areas"
          >
            <div className="mb-2 flex shrink-0 items-center justify-between gap-3 lg:hidden">
              <ChartIdentityCard
                name={user.fullName}
                date={user.birthDetails.date}
                time={user.birthDetails.timeUnknown ? null : user.birthDetails.time}
                place={user.birthDetails.place.label}
                lagna={chart?.lagna.rashi}
                chandra={moon?.rashi}
                nakshatra={moon?.nakshatra.name}
                compact
              />
            </div>

            <p className="mb-2 shrink-0 text-[10px] font-medium uppercase tracking-[0.16em] text-[#B6B1CE]">
              Choose up to {MAX_PAST_SELECTIONS}
            </p>

            <div className="grid min-h-0 flex-1 grid-cols-2 gap-2.5 overflow-hidden sm:gap-3 lg:auto-rows-fr">
              {PAST_INSIGHTS.map((insight, index) => {
                const isOn = picked.includes(insight.id)
                const lockedOut = atLimit && !isOn
                return (
                  <PastOptionCard
                    key={insight.id}
                    insight={insight}
                    index={index}
                    selected={isOn}
                    disabled={lockedOut}
                    onToggle={() => toggle(insight.id)}
                  />
                )
              })}
            </div>
          </section>
        </div>

        {/* Ask + actions pinned to bottom of viewport */}
        <div className="mt-3 flex shrink-0 flex-col gap-3 sm:mt-4">
          <div className="mx-auto w-full max-w-lg animate-rise [animation-delay:160ms]">
            <PastAskPanel onAsk={askAboutPast} needsPlan={!chatUnlocked} />
          </div>

          <div className="flex items-center justify-between gap-4 animate-rise [animation-delay:200ms]">
            <button
              type="button"
              onClick={finish}
              className="py-1 text-sm font-medium text-[#B6B1CE] underline-offset-4 transition-colors hover:text-[#F5F2FF] hover:underline"
            >
              Skip for now
            </button>

            <Button
              variant="celestial"
              size="md"
              onClick={picked.length > 0 ? openReveal : finish}
              className="rounded-full px-6"
            >
              Continue →
            </Button>
          </div>
        </div>
      </div>

      <ChatPaywall
        isOpen={paywallOpen}
        onClose={() => {
          pendingQuestion.current = null
          setPaywallOpen(false)
        }}
        onUnlock={confirmUnlock}
      />
    </GalaxyBackdrop>
  )
}

/** Full-screen past reader — areas on the left, detail on the right. */
function PastRevealScreen({
  insights,
  activeId,
  onSelect,
  onBack,
  onContinue,
}: {
  insights: PastInsight[]
  activeId: PastInsightCategory
  onSelect: (id: PastInsightCategory) => void
  onBack: () => void
  onContinue: () => void
}) {
  const active = insights.find((item) => item.id === activeId) ?? insights[0]

  return (
    <GalaxyBackdrop
      intensity="quiet"
      className="h-dvh max-h-dvh"
      contentClassName="relative flex h-dvh max-h-dvh flex-col overflow-hidden"
    >
      <header className="relative z-10 shrink-0 border-b border-[rgba(180,160,255,0.12)] px-4 pb-3 pt-safe sm:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-[90rem] items-center gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to choices"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[rgba(180,160,255,0.18)] bg-[rgba(17,16,34,0.65)] text-[#F5F2FF] transition-colors hover:border-[rgba(201,169,110,0.45)]"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C9A96E]">
              Your past
            </p>
            <p className="truncate text-sm text-[#B6B1CE]">
              {insights.length} area{insights.length === 1 ? '' : 's'} from your chart · tap a card
            </p>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid min-h-0 w-full max-w-[90rem] flex-1 grid-cols-1 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <aside
          className="shrink-0 border-b border-[rgba(180,160,255,0.12)] px-4 py-4 sm:px-8 lg:border-b-0 lg:border-r lg:border-[rgba(180,160,255,0.12)] lg:px-6 lg:py-6 xl:px-8"
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
                      ? 'border-[rgba(201,169,110,0.55)] bg-[rgba(42,36,96,0.45)] shadow-[0_0_0_1px_rgba(201,169,110,0.12)]'
                      : 'border-[rgba(180,160,255,0.14)] bg-[rgba(17,16,34,0.55)] hover:border-[rgba(201,169,110,0.3)]',
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {insight.planets.map((code) => (
                      <PlanetGlyph key={code} code={code} size="sm" tone="dark" />
                    ))}
                  </span>
                  <span className="mt-2 line-clamp-2 font-serif text-base text-[#F5F2FF]">
                    {insight.category}
                  </span>
                  <span className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#77728F]">
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
            <InsightDetail key={active.id} insight={active} tone="dark" />
          </div>
        </div>
      </div>

      <div className="relative z-20 shrink-0 border-t border-[rgba(180,160,255,0.12)] bg-[rgba(8,7,17,0.82)] backdrop-blur-xl pb-safe">
        <div className="mx-auto flex w-full max-w-[90rem] justify-end px-5 py-4 sm:px-8 lg:px-12">
          <Button
            variant="celestial"
            size="lg"
            onClick={onContinue}
            className="w-full rounded-full sm:w-auto sm:min-w-[14rem]"
          >
            Continue →
          </Button>
        </div>
      </div>
    </GalaxyBackdrop>
  )
}

function ChartIdentityCard({
  name,
  date,
  time,
  place,
  lagna,
  chandra,
  nakshatra,
  fill = false,
  compact = false,
}: {
  name: string
  date: string
  time: string | null
  place: string
  lagna?: RashiName
  chandra?: RashiName
  nakshatra?: string
  fill?: boolean
  compact?: boolean
}) {
  const when = [formatDateShort(date), time ? formatTime12(time) : 'Time unknown', place]
    .filter(Boolean)
    .join(' · ')

  if (compact) {
    return (
      <aside className={cn(glassSurface, 'w-full px-3.5 py-2.5')}>
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#C9A96E]">
              Your chart
            </p>
            <p className="truncate font-serif text-base text-[#F5F2FF]">{firstNameOf(name)}</p>
          </div>
          <p className="truncate text-[11px] text-[#77728F]">{when}</p>
        </div>
      </aside>
    )
  }

  return (
    <aside className={cn(glassSurface, 'flex h-full flex-col p-4 sm:p-5', fill && 'min-h-0')}>
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#C9A96E]">
        Your chart
      </p>
      <p className="mt-2 font-serif text-[1.35rem] leading-tight tracking-[-0.02em] text-[#F5F2FF]">
        {firstNameOf(name)}
      </p>
      <p className="mt-1.5 text-[12px] leading-snug text-[#B6B1CE] text-pretty">{when}</p>

      <div className="mt-auto border-t border-[rgba(180,160,255,0.12)] pt-4">
        <dl className="grid grid-cols-1 gap-3.5">
          <IdentityMark label="Lagna" value={lagna} glyph={lagna ? rashiGlyph(lagna) : ''} />
          <IdentityMark label="Chandra" value={chandra} glyph={chandra ? rashiGlyph(chandra) : ''} />
          <IdentityMark label="Nakshatra" value={nakshatra} />
        </dl>
      </div>
    </aside>
  )
}

function IdentityMark({
  label,
  value,
  glyph,
}: {
  label: string
  value?: string
  glyph?: string
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#77728F]">{label}</dt>
      <dd className="mt-1.5 flex items-baseline gap-1.5 text-[14px] text-[#F5F2FF]">
        {glyph ? <span className="text-[#C9A96E]">{glyph}</span> : null}
        <span className="truncate">{value ?? '—'}</span>
      </dd>
    </div>
  )
}

function PastOptionCard({
  insight,
  index,
  selected,
  disabled,
  onToggle,
}: {
  insight: PastInsight
  index: number
  selected: boolean
  disabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'group relative flex min-h-0 flex-col overflow-hidden rounded-[16px] border px-3.5 py-3 text-left',
        'transition-[border-color,transform,background-color,box-shadow,opacity] duration-250 ease-out-soft',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080711]',
        'animate-rise hover:-translate-y-0.5 lg:h-full',
        selected
          ? 'border-[rgba(201,169,110,0.55)] bg-[rgba(28,24,58,0.88)] shadow-[0_0_0_1px_rgba(201,169,110,0.1),0_12px_32px_-18px_rgba(201,169,110,0.35)]'
          : 'border-[rgba(180,160,255,0.14)] bg-[rgba(17,16,34,0.72)] shadow-[inset_0_1px_0_rgba(255,250,240,0.04)] backdrop-blur-md hover:border-[rgba(180,160,255,0.28)] hover:bg-[rgba(22,20,42,0.85)]',
        disabled &&
          'cursor-not-allowed opacity-40 hover:translate-y-0 hover:border-[rgba(180,160,255,0.14)] hover:bg-[rgba(17,16,34,0.72)]',
      )}
      style={{ animationDelay: `${120 + index * 50}ms` }}
    >
      <div className="flex items-start gap-2">
        <span className="flex items-center gap-1 text-[#C9A96E]/90">
          {insight.planets.map((code) => (
            <PlanetGlyph key={code} code={code} size="sm" tone="dark" />
          ))}
        </span>
        <span className="ml-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-[#77728F]">
          {insight.period}
        </span>
        <span
          className={cn(
            'ml-auto inline-flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-250',
            selected
              ? 'border-[#C9A96E] bg-[#C9A96E] text-[#080711]'
              : 'border-[rgba(180,160,255,0.28)] text-transparent',
          )}
          aria-hidden
        >
          <Check className="size-2.5" strokeWidth={3} />
        </span>
      </div>

      <h2 className="mt-2 font-serif text-[1.05rem] leading-tight tracking-[-0.01em] text-[#F5F2FF]">
        {insight.category}
      </h2>
      <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-[#B6B1CE] lg:line-clamp-3">
        {insight.blurb}
      </p>
    </button>
  )
}

function PastAskPanel({
  onAsk,
  needsPlan,
}: {
  onAsk: (question: string) => void
  /** User can always type; send opens the plan paywall until purchased. */
  needsPlan: boolean
}) {
  const [value, setValue] = useState('')
  const canSend = value.trim().length > 0

  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    if (!canSend) return
    // Always accept the question — answers stay locked until a plan is purchased.
    onAsk(value.trim())
    setValue('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      submit()
    }
  }

  return (
    <div className="space-y-2">
      <div className={cn(glassSurface, 'overflow-hidden')}>
        <div className="flex items-center gap-2 border-b border-[rgba(180,160,255,0.1)] px-4 py-2">
          <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#C9A96E]">
            <span aria-hidden>✦</span>
            Ask Cyklos
          </p>
          <p className="hidden truncate text-[12px] text-[#77728F] sm:block">
            What does your past say about you?
          </p>
        </div>

        <form onSubmit={submit} className="flex items-center gap-2.5 px-3 py-2">
          <label htmlFor="past-ask-input" className="sr-only">
            Ask Cyklos about your past
          </label>
          <input
            id="past-ask-input"
            type="text"
            value={value}
            placeholder="Ask Cyklos…"
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            className="min-w-0 flex-1 bg-transparent text-[14px] text-[#F5F2FF] outline-none placeholder:text-[#77728F]"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label={needsPlan ? 'Ask — plan required to see the answer' : 'Ask this question'}
            className={cn(
              'inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-[background-color,transform] duration-200',
              canSend
                ? 'bg-[#C9A96E] text-[#080711] hover:scale-[1.03] active:scale-100'
                : 'bg-[rgba(180,160,255,0.1)] text-[#77728F]',
            )}
          >
            <ArrowUp className="size-3.5" strokeWidth={2.25} />
          </button>
        </form>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-center text-[9px] font-medium uppercase tracking-[0.12em] text-[#77728F]">
        <span aria-hidden className="text-[#C9A96E]">
          ✦
        </span>
        {needsPlan
          ? 'Type freely · answers unlock with a plan'
          : 'Read from your birth chart · never from a generic horoscope'}
      </p>
    </div>
  )
}

function InsightDetail({
  insight,
  tone = 'light',
}: {
  insight: PastInsight
  tone?: 'light' | 'dark'
}) {
  const dark = tone === 'dark'
  return (
    <article className="animate-fade-in space-y-5">
      <div>
        <p
          className={cn(
            'text-[11px] font-medium uppercase tracking-[0.16em]',
            dark ? 'text-[#C9A96E]' : 'text-muted',
          )}
        >
          {insight.category} · {insight.period}
        </p>
        <p
          className={cn(
            'mt-2 font-serif text-title text-pretty lg:text-title-lg',
            dark ? 'text-[#F5F2FF]' : 'text-ink',
          )}
        >
          {insight.verdict}
        </p>
      </div>

      <section>
        <h3
          className={cn(
            'text-[11px] font-medium uppercase tracking-[0.14em]',
            dark ? 'text-[#B6B1CE]' : 'text-muted',
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
                dark ? 'text-[#B6B1CE]' : 'text-ink',
              )}
            >
              <span className="mt-2 size-1 shrink-0 rounded-full bg-[#C9A96E]" aria-hidden />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3
          className={cn(
            'text-[11px] font-medium uppercase tracking-[0.14em]',
            dark ? 'text-[#B6B1CE]' : 'text-muted',
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
                  ? 'border-[rgba(180,160,255,0.16)] bg-[rgba(8,7,17,0.45)]'
                  : 'border-border bg-surface-sunken',
              )}
            >
              <PlanetGlyph code={code} size="md" withName tone={dark ? 'dark' : 'light'} />
              <span
                className={cn(
                  'text-[10px] font-medium uppercase tracking-[0.1em]',
                  dark ? 'text-[#77728F]' : 'text-muted',
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
            ? 'border-[rgba(180,160,255,0.12)] text-[#77728F]'
            : 'border-border text-muted',
        )}
      >
        Source · {bhavaRef(insight.bhava)} · {insight.source}
      </p>
    </article>
  )
}
