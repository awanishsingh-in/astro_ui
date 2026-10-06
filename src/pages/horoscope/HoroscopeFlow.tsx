import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  ChevronRight,
  Heart,
  HeartPulse,
  LayoutGrid,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { useAuth } from '@/auth/auth-context'
import { Button } from '@/components/common/Button'
import { RubberSegment } from '@/components/common/RubberSegment'
import {
  buildHoroscopeDateChips,
  buildSignHoroscopeSummary,
  type HoroscopePeriod,
  type HoroscopeVerticalId,
} from '@/data/horoscope-hub'
import { PageContainer } from '@/layouts/PageContainer'
import { hasYearlyHoroscopeUnlocked } from '@/onboarding/past-intro'
import { YearlyHoroscopeCheckout } from '@/pages/horoscope/YearlyHoroscopeCheckout'
import { useProfiles } from '@/profiles/profiles-context'
import { paths } from '@/routes/paths'
import dhanuIcon from '@/assets/zodiac/dhanu.jpg'
import kanyaIcon from '@/assets/zodiac/kanya.jpg'
import karkaIcon from '@/assets/zodiac/karka.jpg'
import kumbhaIcon from '@/assets/zodiac/kumbha.jpg'
import makaraIcon from '@/assets/zodiac/makara.jpg'
import meenaIcon from '@/assets/zodiac/meena.jpg'
import meshaIcon from '@/assets/zodiac/mesha.jpg'
import mithunaIcon from '@/assets/zodiac/mithuna.jpg'
import simhaIcon from '@/assets/zodiac/simha.jpg'
import tulaIcon from '@/assets/zodiac/tula.jpg'
import vrishabhaIcon from '@/assets/zodiac/vrishabha.jpg'
import vrischikaIcon from '@/assets/zodiac/vrischika.jpg'
import type { RashiName } from '@/types/astrology'
import { RASHIS } from '@/utils/astro'
import { cn } from '@/utils/cn'

/** Illustrated art for each moon sign / rashi card. */
const RASHI_ART: Record<RashiName, string> = {
  Mesha: meshaIcon,
  Vrishabha: vrishabhaIcon,
  Mithuna: mithunaIcon,
  Karka: karkaIcon,
  Simha: simhaIcon,
  Kanya: kanyaIcon,
  Tula: tulaIcon,
  Vrischika: vrischikaIcon,
  Dhanu: dhanuIcon,
  Makara: makaraIcon,
  Kumbha: kumbhaIcon,
  Meena: meenaIcon,
}

/**
 * Immersive horoscope hub — full-bleed width, no side rail.
 * Signs in one horizontal strip · span · dates · summary · personalise.
 */
export default function HoroscopeFlow() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profiles } = useProfiles()
  const [checkout, setCheckout] = useState(false)
  const [yearlyUnlocked, setYearlyUnlocked] = useState(() =>
    user ? hasYearlyHoroscopeUnlocked(user.id) : false,
  )
  const [period, setPeriod] = useState<HoroscopePeriod>('daily')
  const [rashi, setRashi] = useState<RashiName>('Simha')
  const chips = buildHoroscopeDateChips(period)
  const todayIso = chips.find((c) => {
    const now = new Date()
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    return c.iso === iso
  })?.id
  const [selectedChipId, setSelectedChipId] = useState(
    () => todayIso ?? chips[3]?.id ?? chips[0]?.id ?? '',
  )

  useEffect(() => {
    if (!user) {
      setYearlyUnlocked(false)
      return
    }
    setYearlyUnlocked(hasYearlyHoroscopeUnlocked(user.id))
  }, [user])

  useEffect(() => {
    const next = buildHoroscopeDateChips(period)
    const now = new Date()
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const match = next.find((c) => c.iso === iso) ?? next[Math.min(3, next.length - 1)]
    if (match) setSelectedChipId(match.id)
  }, [period])

  const selectedChip = chips.find((c) => c.id === selectedChipId) ?? chips[0]
  const summary = selectedChip
    ? buildSignHoroscopeSummary(rashi, 'general', period, selectedChip.iso)
    : null

  function openPersonal() {
    if (yearlyUnlocked) {
      navigate(paths.horoscope('yearly-personal'))
      return
    }
    setCheckout(true)
  }

  function openFullReading() {
    navigate(paths.horoscope(period))
  }

  if (checkout) {
    return (
      <YearlyHoroscopeCheckout
        profiles={profiles}
        onClose={() => setCheckout(false)}
        onUnlocked={() => setYearlyUnlocked(true)}
      />
    )
  }

  return (
    <PageContainer
      width="wide"
      className="pb-16 pt-4 sm:pt-6 px-6 sm:px-8 lg:px-12 xl:px-16"
    >
      <article className="animate-rise space-y-8 sm:space-y-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Select your zodiac sign
          </h1>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            iconLeft={<LayoutGrid className="size-3.5" />}
            onClick={() => navigate(paths.horoscopeReadings)}
          >
            All readings
          </Button>
        </header>

        {/* Sign strip is for the free hub only — hidden after personalised unlock. */}
        {!yearlyUnlocked && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Moon sign / rashi
              </p>
              <p className="text-sm text-muted">
                {RASHIS.find((r) => r.name === rashi)?.english} · {rashi}
              </p>
            </div>
            <RashiStrip selected={rashi} onSelect={setRashi} />
          </section>
        )}

        {/* Daily / Weekly / Monthly */}
        <section className="mx-auto flex w-full max-w-lg flex-col items-center space-y-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Span
          </p>
          <RubberSegment
            className="w-full border border-border/70"
            aria-label="Horoscope period"
            items={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
            ]}
            value={period}
            onChange={(next) => setPeriod(next as HoroscopePeriod)}
            size="lg"
            radius={22}
            inset={4}
            trackColor="var(--color-surface-sunken)"
            thumbColor="var(--color-copper)"
            textColor="var(--color-muted)"
            activeTextColor="var(--color-midnight)"
          />
        </section>

        {/* Dates — horizontal strip, drag to scroll */}
        <section className="mx-auto flex w-full flex-col items-center space-y-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            {period === 'daily' ? 'Pick a day' : period === 'weekly' ? 'Pick a week' : 'Pick a month'}
          </p>
          <div className="w-full py-3">
            <DateStrip
              chips={chips}
              selectedId={selectedChipId}
              period={period}
              onSelect={setSelectedChipId}
            />
          </div>
        </section>

        {summary && (
          <article
            className={cn(
              'relative overflow-hidden rounded-[1.75rem] border border-[#7c4dff]/40',
              'bg-[linear-gradient(155deg,#24105a_0%,#120e28_42%,#0d1a38_100%)]',
              'px-5 py-6 shadow-[0_0_0_1px_rgba(124,77,255,0.15),0_28px_64px_-28px_rgba(124,77,255,0.75)]',
              'sm:px-8 sm:py-8',
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-[#7c4dff]/35 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-28 -left-10 h-52 w-52 rounded-full bg-[#3a7bd5]/25 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#c4a0ff]/70 to-transparent"
            />

            <div className="relative flex flex-col gap-6 sm:gap-7">
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c4a0ff]/35 bg-[#7c4dff]/20 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e8d6ff]">
                      <Sparkles className="size-3" aria-hidden />
                      {period}
                    </span>
                    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/70">
                      {summary.english} · {summary.rashi}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="font-serif text-3xl font-semibold tracking-tight text-white text-pretty sm:text-4xl">
                      {summary.headline}
                    </h2>
                    <p className="text-sm text-white/55">{summary.dateLabel}</p>
                  </div>
                </div>
                <p
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border border-[#9dffc0]/30',
                    'bg-[#1a3d2a]/70 px-3.5 py-1.5 text-xs font-semibold text-[#9dffc0]',
                    'shadow-[0_0_20px_-8px_rgba(157,255,192,0.65)]',
                  )}
                >
                  Mood · {summary.mood}
                </p>
              </header>

              <p className="max-w-3xl text-base leading-relaxed text-white/80 text-pretty sm:text-lg">
                {summary.summary}
              </p>

              <section className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c4a0ff]">
                    By area
                  </p>
                  <p className="text-[11px] text-white/40">Tap a lane for the full read</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3.5">
                  {summary.verticals.map((vertical) => {
                    const Icon = VERTICAL_ICON[vertical.id]
                    return (
                      <button
                        key={vertical.id}
                        type="button"
                        onClick={() => navigate(paths.horoscope(vertical.id))}
                        className={cn(
                          'group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-white/10',
                          'bg-white/[0.04] px-4 py-4 text-left backdrop-blur-sm',
                          'transition duration-200',
                          'hover:-translate-y-0.5 hover:border-[#9b6dff]/55 hover:bg-[#7c4dff]/15',
                          'hover:shadow-[0_16px_36px_-18px_rgba(124,77,255,0.85)]',
                          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c4dff]',
                        )}
                      >
                        <div
                          aria-hidden
                          className="pointer-events-none absolute -right-8 -top-8 size-20 rounded-full bg-[#7c4dff]/20 blur-2xl transition group-hover:bg-[#7c4dff]/40"
                        />
                        <div className="relative flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              'inline-flex size-9 items-center justify-center rounded-xl',
                              'border border-[#c4a0ff]/35 bg-[#7c4dff]/25 text-[#e8d6ff]',
                              'shadow-[0_0_20px_-8px_rgba(196,160,255,0.8)]',
                            )}
                          >
                            <Icon className="size-4" aria-hidden strokeWidth={2} />
                          </span>
                          <ChevronRight
                            className="size-4 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-[#e8d6ff]"
                            aria-hidden
                          />
                        </div>
                        <div className="relative space-y-1.5">
                          <p className="text-base font-semibold text-white">{vertical.label}</p>
                          <p className="text-xs leading-relaxed text-white/60 text-pretty sm:text-[13px]">
                            {vertical.blurb}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>

              <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-full"
                  onClick={openFullReading}
                  iconRight={<ChevronRight className="size-3.5" />}
                >
                  Open full reading
                </Button>
                <button
                  type="button"
                  onClick={() => navigate(paths.horoscopeReadings)}
                  className="text-sm font-medium text-white/55 underline-offset-4 transition hover:text-white hover:underline"
                >
                  Love, career & more
                </button>
              </div>
            </div>
          </article>
        )}

        {/* Spacer so content clears the fixed CTA */}
        <div className="h-32" aria-hidden />
      </article>

      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-30 border-t border-border/80',
          'bg-canvas/95 backdrop-blur-md pb-safe',
        )}
      >
        <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-2 px-5 py-3.5 sm:px-6">
          <Button
            variant="primary"
            size="lg"
            className="w-full rounded-full"
            iconLeft={<Sparkles className="size-4" />}
            onClick={openPersonal}
          >
            Read personalised horoscope
          </Button>
          <p className="max-w-md text-center text-xs leading-relaxed text-muted text-pretty">
            Uses your birth chart — dasha, transits, and the houses this reading cares about.
          </p>
        </div>
      </div>
    </PageContainer>
  )
}

function RashiStrip({
  selected,
  onSelect,
}: {
  selected: RashiName
  onSelect: (name: RashiName) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<{
    active: boolean
    moved: boolean
    capturing: boolean
    pointerId: number | null
    startX: number
    scrollLeft: number
  }>({
    active: false,
    moved: false,
    capturing: false,
    pointerId: null,
    startX: 0,
    scrollLeft: 0,
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const active = el.querySelector<HTMLElement>('[data-selected="true"]')
    if (!active) return
    const left = active.offsetLeft - el.clientWidth / 2 + active.clientWidth / 2
    el.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [selected])

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el || e.button !== 0) return
    drag.current = {
      active: true,
      moved: false,
      capturing: false,
      pointerId: e.pointerId,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current.active || !ref.current) return
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) <= 6) return
    drag.current.moved = true
    if (!drag.current.capturing) {
      drag.current.capturing = true
      try {
        ref.current.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      ref.current.style.cursor = 'grabbing'
    }
    ref.current.scrollLeft = drag.current.scrollLeft - dx
  }

  function onPointerUp() {
    drag.current.active = false
    drag.current.capturing = false
    drag.current.pointerId = null
    const el = ref.current
    if (el) el.style.cursor = 'grab'
  }

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label="Moon sign"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="flex cursor-grab flex-nowrap gap-3 overflow-x-auto px-1 py-5 select-none [scrollbar-width:none] active:cursor-grabbing sm:gap-3.5 sm:py-6 [&::-webkit-scrollbar]:hidden"
    >
      {RASHIS.map((r) => {
        const active = selected === r.name
        return (
          <button
            key={r.name}
            type="button"
            role="option"
            aria-selected={active}
            data-selected={active ? 'true' : undefined}
            onClick={() => {
              if (drag.current.moved) return
              onSelect(r.name)
            }}
            className={cn(
              'group/rashi relative flex h-[12.5rem] w-[7.25rem] shrink-0 flex-col items-end justify-end overflow-hidden rounded-[1.25rem] border px-3 pb-4 pt-3 transition sm:h-[13.5rem] sm:w-[8.25rem] sm:pb-5 sm:pt-4',
              active
                ? 'border-copper text-copper shadow-[0_0_0_1px_rgba(124,77,255,0.45),0_0_28px_-8px_rgba(124,77,255,0.75)]'
                : 'border-border/80 text-ink hover:border-copper/40',
            )}
          >
            {/* Soft background art only — no foreground icon */}
            <img
              src={RASHI_ART[r.name]}
              alt=""
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-0 size-full object-cover transition duration-300',
                'scale-110 group-hover/rashi:scale-[1.15]',
                active ? 'opacity-80' : 'opacity-70 group-hover/rashi:opacity-75',
              )}
            />
            <div
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-0',
                'bg-gradient-to-t from-[#0a0818]/90 via-[#0a0818]/45 to-[#0a0818]/15',
                active && 'from-[#14082e]/88 via-[#14082e]/40 to-[#7c4dff]/10',
              )}
            />

            <div className="relative z-[1] flex w-full flex-col items-center gap-0.5 text-center">
              <span
                className={cn(
                  'text-base font-semibold drop-shadow-sm sm:text-lg',
                  active ? 'text-copper' : 'text-white',
                )}
              >
                {r.name}
              </span>
              <span aria-hidden className={cn('text-lg leading-none', active ? 'text-copper/70' : 'text-white/45')}>
                {r.glyph}
              </span>
              <span
                className={cn(
                  'text-xs sm:text-sm',
                  active ? 'text-copper/80' : 'text-white/65',
                )}
              >
                {r.english}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

const VERTICAL_ICON: Record<
  HoroscopeVerticalId,
  typeof Briefcase
> = {
  career: Briefcase,
  love: Heart,
  health: HeartPulse,
  finance: Wallet,
}

const DATE_CHIP_PX = 84
const DATE_GAP_PX = 12
const DATE_STRIDE = DATE_CHIP_PX + DATE_GAP_PX

/**
 * Fixed-center date lens (transform carousel):
 * Purple disc is CSS-pinned to 50%. The chip row translates so the active
 * index always sits on that same center — no overflow scroll math.
 */
function DateStrip({
  chips,
  selectedId,
  period,
  onSelect,
}: {
  chips: ReturnType<typeof buildHoroscopeDateChips>
  selectedId: string
  period: HoroscopePeriod
  onSelect: (id: string) => void
}) {
  const indexOfId = (id: string) => {
    const i = chips.findIndex((c) => c.id === id)
    return i < 0 ? 0 : i
  }

  const [activeIndex, setActiveIndex] = useState(() => indexOfId(selectedId))
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const activeIndexRef = useRef(activeIndex)
  const wheelLock = useRef(0)
  const dragRef = useRef<{
    active: boolean
    startX: number
    originIndex: number
    moved: boolean
    pointerId: number | null
    samples: { t: number; x: number }[]
  }>({
    active: false,
    startX: 0,
    originIndex: 0,
    moved: false,
    pointerId: null,
    samples: [],
  })

  activeIndexRef.current = activeIndex

  // Keep the lens on the selected chip when span / list / selection changes.
  useLayoutEffect(() => {
    setActiveIndex(indexOfId(selectedId))
    setDragX(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, period, chips.map((c) => c.id).join('|')])

  const clampIndex = (i: number) => Math.max(0, Math.min(chips.length - 1, i))

  const commitIndex = (i: number) => {
    const next = clampIndex(i)
    setActiveIndex(next)
    setDragX(0)
    const id = chips[next]?.id
    if (id && id !== selectedId) onSelect(id)
  }

  // While dragging, keep transform anchored to the drag origin so the row follows the finger.
  const originIndex = dragging ? dragRef.current.originIndex : activeIndex
  const liveIndex = dragging
    ? clampIndex(originIndex + Math.round(-dragX / DATE_STRIDE))
    : activeIndex
  const trackX = -DATE_CHIP_PX / 2 - originIndex * DATE_STRIDE + dragX

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    dragRef.current = {
      active: true,
      startX: e.clientX,
      originIndex: activeIndexRef.current,
      moved: false,
      pointerId: e.pointerId,
      samples: [{ t: performance.now(), x: e.clientX }],
    }
    setDragging(true)
    setDragX(0)
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== e.pointerId) return
    const dx = e.clientX - dragRef.current.startX
    if (Math.abs(dx) > 3) dragRef.current.moved = true
    const now = performance.now()
    dragRef.current.samples.push({ t: now, x: e.clientX })
    if (dragRef.current.samples.length > 6) dragRef.current.samples.shift()
    setDragX(dx)
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return
    if (
      dragRef.current.pointerId !== null &&
      e.pointerId !== dragRef.current.pointerId
    ) {
      return
    }
    const dx = e.clientX - dragRef.current.startX
    const moved = dragRef.current.moved
    const origin = dragRef.current.originIndex
    const samples = dragRef.current.samples
    dragRef.current.active = false
    dragRef.current.pointerId = null
    setDragging(false)
    if (!moved) {
      setDragX(0)
      return
    }

    // Momentum from recent pointer samples (px / ms → coast distance).
    let velocity = 0
    if (samples.length >= 2) {
      const first = samples[0]!
      const last = samples[samples.length - 1]!
      const dt = last.t - first.t
      if (dt > 0) velocity = (last.x - first.x) / dt
    }
    const coast = velocity * 160 // ms of glide
    const projected = -dx - coast
    const delta = Math.round(projected / DATE_STRIDE)
    commitIndex(origin + delta)
  }

  const onWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (Math.abs(delta) < 6) return
    e.preventDefault()
    const now = performance.now()
    if (now - wheelLock.current < 220) return
    wheelLock.current = now
    commitIndex(activeIndexRef.current + (delta > 0 ? 1 : -1))
  }

  return (
    <div
      className="relative w-full cursor-grab touch-none select-none active:cursor-grabbing"
      style={{ height: DATE_CHIP_PX }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onWheel={onWheel}
    >
      {/* Pinned purple disc — always the geometric center */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute left-1/2 top-0 z-[1] -translate-x-1/2',
          'rounded-full bg-copper',
          'shadow-[0_0_34px_-4px_rgba(124,77,255,0.95)]',
        )}
        style={{ width: DATE_CHIP_PX, height: DATE_CHIP_PX }}
      />

      <div
        role="listbox"
        aria-label="Dates"
        className="absolute inset-0 z-[2] overflow-hidden"
        style={{
          WebkitMaskImage:
            'linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)',
          maskImage: 'linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)',
        }}
      >
        <div
          className="absolute top-0 flex will-change-transform"
          style={{
            left: '50%',
            gap: DATE_GAP_PX,
            transform: `translate3d(${trackX}px, 0, 0)`,
            transition: dragging
              ? 'none'
              : 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {chips.map((chip, index) => {
            const inLens = index === liveIndex
            return (
              <button
                key={chip.id}
                type="button"
                role="option"
                aria-selected={inLens}
                onClick={() => {
                  if (dragRef.current.moved) return
                  commitIndex(index)
                }}
                className={cn(
                  'flex shrink-0 flex-col items-center justify-center rounded-full border bg-transparent',
                  'transition-colors duration-200',
                  inLens ? 'border-transparent text-midnight' : 'border-border-strong text-ink',
                )}
                style={{ width: DATE_CHIP_PX, height: DATE_CHIP_PX }}
              >
                {period === 'monthly' ? (
                  <>
                    <span className="text-sm font-semibold sm:text-base">{chip.label}</span>
                    <span
                      className={cn(
                        'mt-0.5 text-[10px] uppercase',
                        inLens ? 'text-midnight/75' : 'text-muted',
                      )}
                    >
                      {new Date(`${chip.iso}T12:00:00`).getFullYear()}
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className={cn(
                        'text-[10px] font-medium uppercase tracking-wide sm:text-[11px]',
                        inLens ? 'text-midnight/75' : 'text-muted',
                      )}
                    >
                      {chip.weekday}
                    </span>
                    <span className="text-lg font-semibold leading-none sm:text-xl">
                      {chip.dayNum}
                    </span>
                    <span
                      className={cn(
                        'mt-0.5 text-[10px] uppercase',
                        inLens ? 'text-midnight/70' : 'text-muted',
                      )}
                    >
                      {chip.monthShort}
                    </span>
                  </>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

