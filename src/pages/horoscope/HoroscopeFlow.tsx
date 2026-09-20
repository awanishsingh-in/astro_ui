import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Sparkles } from 'lucide-react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import {
  buildHoroscopeDateChips,
  buildSignHoroscopeSummary,
  type HoroscopePeriod,
} from '@/data/horoscope-hub'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'
import type { RashiName } from '@/types/astrology'
import { RASHIS } from '@/utils/astro'
import { cn } from '@/utils/cn'

/**
 * Immersive horoscope hub — full-bleed width, no side rail.
 * Signs in a grid (no scroll) · span · dates · summary · personalise.
 */
export default function HoroscopeFlow() {
  const navigate = useNavigate()
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
    navigate(paths.horoscope('daily-personal'))
  }

  function openFullReading() {
    navigate(paths.horoscope(period))
  }

  return (
    <PageContainer width="full" className="pb-16 pt-4 sm:pt-6 lg:px-10">
      <article className="animate-rise space-y-8 sm:space-y-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
              Horoscope
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              What’s written for you
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted text-pretty sm:text-base">
              Pick your sign, a span, and a date. Personalise when you want it from your chart.
            </p>
          </div>
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

        {/* All 12 rashis — full-width grid, no scroll */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Moon sign / rashi
            </p>
            <p className="text-sm text-muted">
              {RASHIS.find((r) => r.name === rashi)?.english} · {rashi}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-3">
            {RASHIS.map((r) => {
              const active = rashi === r.name
              return (
                <button
                  key={r.name}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setRashi(r.name)}
                  className={cn(
                    'flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-3.5 transition sm:min-h-[5rem] sm:gap-2 sm:py-4',
                    active
                      ? 'border-copper bg-copper/15 text-copper shadow-[0_0_0_1px_rgba(220,132,79,0.4)]'
                      : 'border-border/80 bg-surface/90 text-ink hover:border-copper/40',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn('text-2xl sm:text-3xl', active ? 'text-copper' : 'text-gold')}
                  >
                    {r.glyph}
                  </span>
                  <span className="text-sm font-semibold sm:text-base">{r.name}</span>
                  <span className="text-[10px] text-muted sm:text-xs">{r.english}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Daily / Weekly / Monthly */}
        <section className="space-y-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Span
          </p>
          <div
            role="tablist"
            aria-label="Horoscope period"
            className="flex w-full max-w-lg gap-1 rounded-full border border-border/80 bg-surface-sunken/60 p-1.5"
          >
            {(['daily', 'weekly', 'monthly'] as const).map((p) => {
              const active = period === p
              return (
                <button
                  key={p}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    'flex-1 rounded-full px-4 py-2.5 text-sm font-medium capitalize transition-colors',
                    active
                      ? 'bg-copper text-midnight shadow-sm'
                      : 'text-muted hover:bg-navy-soft hover:text-ink',
                  )}
                >
                  {p}
                </button>
              )
            })}
          </div>
        </section>

        {/* Dates — horizontal strip, drag to scroll */}
        <section className="space-y-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            {period === 'daily' ? 'Pick a day' : period === 'weekly' ? 'Pick a week' : 'Pick a month'}
          </p>
          <DateStrip
            chips={chips}
            selectedId={selectedChipId}
            period={period}
            onSelect={setSelectedChipId}
          />
        </section>

        {summary && (
          <Card padding="lg" className="flex flex-col gap-5 border-border/80 sm:gap-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1.5">
                <Badge tone="neutral" mono>
                  {period}
                </Badge>
                <h2 className="text-heading font-semibold text-ink sm:text-2xl">
                  {summary.headline}
                </h2>
                <p className="text-xs text-muted sm:text-sm">{summary.dateLabel}</p>
              </div>
              <p className="rounded-full border border-border/80 px-3 py-1 text-xs font-medium text-muted">
                Mood · {summary.mood}
              </p>
            </div>

            <p className="max-w-4xl text-base leading-relaxed text-ink text-pretty sm:text-lg">
              {summary.summary}
            </p>

            <ul className="grid gap-3 border-t border-border/60 pt-5 sm:grid-cols-3 sm:gap-5">
              {summary.bullets.map((line) => (
                <li key={line} className="flex gap-3 text-sm leading-relaxed text-muted text-pretty">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-copper" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-2 border-t border-border/60 pt-5">
              <Button variant="secondary" size="sm" className="rounded-full" onClick={openFullReading}>
                Open full reading
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => navigate(paths.horoscopeReadings)}
              >
                Love, career & more
              </Button>
            </div>
          </Card>
        )}

        <div className="flex flex-col items-center gap-3 pb-4 pt-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full max-w-lg rounded-full"
            iconLeft={<Sparkles className="size-4" />}
            onClick={openPersonal}
          >
            Read personalised horoscope
          </Button>
          <p className="max-w-md text-center text-xs leading-relaxed text-muted text-pretty">
            Uses your birth chart — dasha, transits, and the houses this reading cares about.
          </p>
        </div>
      </article>
    </PageContainer>
  )
}

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
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<{ active: boolean; moved: boolean; startX: number; scrollLeft: number }>({
    active: false,
    moved: false,
    startX: 0,
    scrollLeft: 0,
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const selected = el.querySelector<HTMLElement>('[data-selected="true"]')
    if (!selected) return
    const left = selected.offsetLeft - el.clientWidth / 2 + selected.clientWidth / 2
    el.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [selectedId, period])

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    drag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
    }
    el.setPointerCapture(e.pointerId)
    el.style.cursor = 'grabbing'
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current.active || !ref.current) return
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) > 4) drag.current.moved = true
    ref.current.scrollLeft = drag.current.scrollLeft - dx
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    drag.current.active = false
    const el = ref.current
    if (el) {
      el.releasePointerCapture(e.pointerId)
      el.style.cursor = 'grab'
    }
  }

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label="Dates"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="flex cursor-grab gap-3 overflow-x-auto px-1 py-2 select-none [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
    >
      {chips.map((chip) => {
        const active = chip.id === selectedId
        return (
          <button
            key={chip.id}
            type="button"
            role="option"
            aria-selected={active}
            data-selected={active ? 'true' : undefined}
            onClick={() => {
              if (drag.current.moved) return
              onSelect(chip.id)
            }}
            className={cn(
              'flex size-[4.75rem] shrink-0 flex-col items-center justify-center rounded-full border transition sm:size-[5.25rem]',
              active
                ? 'border-copper bg-copper text-midnight shadow-[0_0_24px_-8px_rgba(220,132,79,0.65)]'
                : 'border-border-strong bg-surface text-ink hover:border-copper/50',
            )}
          >
            {period === 'monthly' ? (
              <>
                <span className="text-sm font-semibold sm:text-base">{chip.label}</span>
                <span
                  className={cn(
                    'mt-0.5 text-[10px] uppercase',
                    active ? 'opacity-80' : 'text-muted',
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
                    active ? 'opacity-80' : 'text-muted',
                  )}
                >
                  {chip.weekday}
                </span>
                <span className="text-lg font-semibold leading-none sm:text-xl">{chip.dayNum}</span>
                <span
                  className={cn(
                    'mt-0.5 text-[10px] uppercase',
                    active ? 'opacity-70' : 'text-muted',
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
  )
}

