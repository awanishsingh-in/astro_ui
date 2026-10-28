import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, ChevronLeft, ChevronRight, Flame } from 'lucide-react'
import { Button } from '@/components/common/Button'
import {
  buildDailyMuhuratDetail,
  DAILY_MUHURAT_CARDS,
  type DailyMuhuratId,
} from '@/data/daily-muhurat'
import { useDisclosure } from '@/hooks/useDisclosure'
import { cn } from '@/utils/cn'
import { formatDayAndDate } from '@/utils/format'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const YEAR_OPTIONS = Array.from({ length: 21 }, (_, i) => 2016 + i)

function partsFromIso(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return { year: y ?? 0, month: (m ?? 1) - 1, day: d ?? 1 }
}

function isoFromParts(year: number, month: number, day: number) {
  const last = new Date(year, month + 1, 0).getDate()
  const clamped = Math.min(day, last)
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(clamped).padStart(2, '0')}`
}

function shiftDay(iso: string, delta: number) {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + delta)
  return isoFromParts(d.getFullYear(), d.getMonth(), d.getDate())
}

function todayIso() {
  const now = new Date()
  return isoFromParts(now.getFullYear(), now.getMonth(), now.getDate())
}

/**
 * Muhurat tab hub — date controls + stacked cards that expand in place.
 */
export function DailyMuhuratHub({
  dateIso,
  onSelectDay,
}: {
  dateIso: string
  onSelectDay: (iso: string) => void
}) {
  const [openId, setOpenId] = useState<DailyMuhuratId | null>(null)
  const dateMenu = useDisclosure()
  const dateTriggerRef = useRef<HTMLButtonElement>(null)
  const datePanelRef = useRef<HTMLDivElement>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null)
  const today = todayIso()
  const { year, month, day: dayNum } = partsFromIso(dateIso)
  const [menuYear, setMenuYear] = useState(year)
  const now = new Date()
  const ongoingMonth = now.getMonth()
  const ongoingYear = now.getFullYear()
  const canPrevYear = menuYear > YEAR_OPTIONS[0]!
  const canNextYear = menuYear < YEAR_OPTIONS[YEAR_OPTIONS.length - 1]!

  useEffect(() => {
    if (dateMenu.isOpen) setMenuYear(year)
  }, [dateMenu.isOpen, year])

  useLayoutEffect(() => {
    if (!dateMenu.isOpen) {
      setMenuPos(null)
      return
    }
    function place() {
      const el = dateTriggerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const width = Math.min(320, window.innerWidth - 16)
      const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8)
      setMenuPos({ top: rect.bottom + 8, left })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [dateMenu.isOpen])

  useEffect(() => {
    if (!dateMenu.isOpen) return
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (
        dateTriggerRef.current?.contains(target) ||
        datePanelRef.current?.contains(target)
      ) {
        return
      }
      dateMenu.close()
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') dateMenu.close()
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [dateMenu])

  function toggle(id: DailyMuhuratId) {
    setOpenId((prev) => (prev === id ? null : id))
  }

  const selectedDateLabel = formatDayAndDate(dateIso)

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="min-w-0 tracking-tight text-ink">
          <button
            ref={dateTriggerRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={dateMenu.isOpen}
            aria-label={`Selected date ${selectedDateLabel}, ${year}. Choose month and year`}
            onClick={dateMenu.toggle}
            className={cn(
              'inline-flex flex-col items-start gap-0.5 rounded-xl border border-border/70 bg-surface/80 px-3 py-2',
              'transition hover:border-copper/45 hover:bg-copper/10',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper',
            )}
          >
            <span className="inline-flex items-baseline gap-1.5 text-heading font-semibold">
              <span>
                {dayNum} {MONTHS[month]} {year}
              </span>
              <span aria-hidden className="text-[0.65em] text-ink/50">
                ▾
              </span>
            </span>
            <span className="text-xs font-medium text-muted">{selectedDateLabel}</span>
          </button>
        </h2>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => onSelectDay(shiftDay(dateIso, -1))}
          >
            <ChevronLeft className="size-4" />
            Prev
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => onSelectDay(today)}
            disabled={dateIso === today}
          >
            Today
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => onSelectDay(shiftDay(dateIso, 1))}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {dateMenu.isOpen &&
        menuPos &&
        createPortal(
          <div
            ref={datePanelRef}
            role="dialog"
            aria-label={`Months in ${menuYear}`}
            style={{ top: menuPos.top, left: menuPos.left }}
            className={cn(
              'fixed z-50 w-[min(20rem,calc(100vw-1rem))]',
              'rounded-2xl border border-border/80 bg-surface p-3 shadow-overlay',
            )}
          >
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Previous year"
                disabled={!canPrevYear}
                onClick={() => setMenuYear((y) => y - 1)}
                className={cn(
                  'inline-flex size-8 items-center justify-center rounded-full border border-border/80 text-ink',
                  'transition hover:border-copper/40 hover:bg-copper/10',
                  'disabled:pointer-events-none disabled:opacity-35',
                )}
              >
                <ChevronLeft className="size-4" />
              </button>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">
                {menuYear}
              </p>
              <button
                type="button"
                aria-label="Next year"
                disabled={!canNextYear}
                onClick={() => setMenuYear((y) => y + 1)}
                className={cn(
                  'inline-flex size-8 items-center justify-center rounded-full border border-border/80 text-ink',
                  'transition hover:border-copper/40 hover:bg-copper/10',
                  'disabled:pointer-events-none disabled:opacity-35',
                )}
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {MONTHS.map((label, index) => {
                const selectedMonth = menuYear === year && index === month
                const isOngoing = menuYear === ongoingYear && index === ongoingMonth
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      onSelectDay(isoFromParts(menuYear, index, dayNum))
                      dateMenu.close()
                    }}
                    className={cn(
                      'rounded-xl border px-1.5 py-2.5 text-center text-xs font-semibold transition sm:text-sm',
                      selectedMonth
                        ? 'border-copper/60 bg-copper/20 text-silver-300'
                        : isOngoing
                          ? 'border-copper/35 bg-copper/10 text-ink'
                          : 'border-transparent text-ink hover:border-copper/30 hover:bg-copper/10',
                    )}
                  >
                    {label}
                    {isOngoing && (
                      <span className="mt-0.5 block font-mono text-[8px] font-semibold uppercase tracking-wide text-silver-300/80">
                        Now
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>,
          document.body,
        )}

      <ul className="flex flex-col gap-4">
        {DAILY_MUHURAT_CARDS.map((card, index) => {
          const open = openId === card.id
          const preview = buildDailyMuhuratDetail(card.id, dateIso)
          return (
            <li key={card.id}>
              <div
                className={cn(
                  'overflow-hidden rounded-2xl border bg-surface/90 shadow-card transition',
                  open
                    ? 'border-copper/50 shadow-raised'
                    : 'border-border/80 hover:border-copper/45',
                  'animate-rise',
                )}
                style={{ animationDelay: `${Math.min(index, 7) * 40}ms` }}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => toggle(card.id)}
                  className={cn(
                    'group flex w-full items-stretch gap-5 text-left sm:gap-6',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper',
                  )}
                >
                  <div
                    className={cn(
                      'relative flex min-h-[6.5rem] w-[5.5rem] shrink-0 items-center justify-center bg-gradient-to-br sm:min-h-[7.5rem] sm:w-32',
                      card.accent,
                      open && 'min-h-[8rem] sm:min-h-[9rem] sm:w-36',
                    )}
                  >
                    <span
                      className={cn(
                        'relative inline-flex items-center justify-center rounded-2xl border border-white/15 bg-black/25 text-[#F2D7C7] shadow-lg transition',
                        open ? 'size-16 sm:size-[4.5rem]' : 'size-14 sm:size-16 group-hover:scale-105',
                      )}
                    >
                      {card.id === 'pancha-pakshi' ? (
                        <span className="font-serif text-xl font-semibold sm:text-2xl">5</span>
                      ) : (
                        <Flame
                          className={cn(open ? 'size-8 sm:size-10' : 'size-7 sm:size-8')}
                          strokeWidth={1.5}
                        />
                      )}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-5 pr-2 sm:py-6">
                    <div>
                      <p
                        className={cn(
                          'font-semibold text-ink',
                          open
                            ? 'font-serif text-xl sm:text-2xl'
                            : 'text-base sm:text-lg',
                        )}
                      >
                        {card.title}
                      </p>
                      <p className="mt-1 text-sm text-muted sm:text-base">{card.blurb}</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-surface-sunken/50 px-3 py-2.5 sm:max-w-md">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-silver-400">
                        Summary
                      </p>
                      <p className="mt-1 text-xs font-medium text-ink">{selectedDateLabel}</p>
                      <p className="mt-0.5 text-sm font-semibold tabular-nums text-silver-300">
                        {preview.primaryRange}
                      </p>
                      <p className="mt-0.5 text-xs leading-snug text-muted text-pretty">
                        {card.summary}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      'mr-5 size-6 shrink-0 self-center text-muted transition sm:mr-6',
                      open && 'rotate-180 text-silver-300',
                    )}
                  />
                </button>

                {open && (
                  <ExpandedMuhuratBody
                    id={card.id}
                    dateIso={dateIso}
                    onOpenRelated={(rid) => setOpenId(rid)}
                  />
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ExpandedMuhuratBody({
  id,
  dateIso,
  onOpenRelated,
}: {
  id: DailyMuhuratId
  dateIso: string
  onOpenRelated: (id: DailyMuhuratId) => void
}) {
  const detail = useMemo(() => buildDailyMuhuratDetail(id, dateIso), [id, dateIso])

  return (
    <div className="animate-rise space-y-4 border-t border-border/60 px-4 py-5 sm:px-6">
      <div
        className={cn(
          'rounded-2xl border border-copper/35 px-4 py-6 text-center sm:px-6',
          'bg-gradient-to-b from-[#6E4234]/20 via-surface/80 to-[#BF8466]/10',
        )}
      >
        <p className="font-serif text-2xl font-semibold tracking-tight text-silver-300 sm:text-3xl">
          {detail.primaryRange}
        </p>
        <p className="mt-2 text-sm font-medium text-ink">{detail.weekdayLabel}</p>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          {detail.durationLabel}
        </p>
      </div>

      <p className="text-xs leading-relaxed text-muted text-pretty sm:text-sm">{detail.note}</p>

      <div className="space-y-2">
        <p className="font-serif text-base font-semibold text-ink">About {detail.title}</p>
        {detail.about.map((para) => (
          <p key={para.slice(0, 36)} className="text-sm leading-relaxed text-purple text-pretty">
            {para}
          </p>
        ))}
      </div>

      {detail.windows.length > 1 && (
        <ul className="divide-y divide-border/50 rounded-xl border border-border/60">
          {detail.windows.map((row, i) => (
            <li
              key={`${row.label}-${i}`}
              className="flex flex-wrap items-start justify-between gap-2 px-3 py-2.5"
            >
              <div>
                <p className={cn('text-sm font-semibold', row.good ? 'text-silver-300' : 'text-ink')}>
                  {row.label}
                </p>
                {row.note && <p className="text-xs text-muted">{row.note}</p>}
              </div>
              <p className="text-sm tabular-nums text-ink">{row.range}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        {detail.related.slice(0, 3).map((rid) => {
          const related = DAILY_MUHURAT_CARDS.find((c) => c.id === rid)
          if (!related) return null
          return (
            <button
              key={rid}
              type="button"
              onClick={() => onOpenRelated(rid)}
              className="rounded-full border border-border/80 px-3 py-1.5 text-xs font-medium text-ink transition hover:border-copper/50 hover:text-silver-300"
            >
              {related.title}
            </button>
          )
        })}
      </div>
    </div>
  )
}
