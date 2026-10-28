import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Download, Sparkles } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { HindiPanchangDayDetail } from '@/components/panchang/HindiPanchangDayDetail'
import { PanchangDayTimeline } from '@/components/panchang/PanchangDayTimeline'
import { PanchangDownloadPicker } from '@/components/panchang/PanchangDownloadPicker'
import type { PanchangDayDetail } from '@/data/panchang-mock'
import { useDisclosure } from '@/hooks/useDisclosure'
import { cn } from '@/utils/cn'

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

function shiftMonth(iso: string, delta: number) {
  const { year, month, day } = partsFromIso(iso)
  const next = new Date(year, month + delta, 1)
  return isoFromParts(next.getFullYear(), next.getMonth(), day)
}

function todayIso() {
  const now = new Date()
  return isoFromParts(now.getFullYear(), now.getMonth(), now.getDate())
}

function monthShortLabel(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-IN', { month: 'short' })
}

/**
 * Hindi panchang day page — opens directly from the hub.
 * Date bar matches the calendar month/year control + day chips.
 */
export function HindiPanchangDayView({
  day,
  kindTitle = 'Hindi Panchang',
  onSelectDay,
  onFindMuhurat,
}: {
  day: PanchangDayDetail
  /** Regional card title shown above the day view. */
  kindTitle?: string
  onSelectDay: (iso: string) => void
  onFindMuhurat: () => void
}) {
  const downloadPicker = useDisclosure()
  const dateMenu = useDisclosure()
  const dateMenuRef = useRef<HTMLDivElement>(null)
  const today = todayIso()
  const { year, month, day: dayNum } = partsFromIso(day.date)
  const [menuYear, setMenuYear] = useState(year)
  const now = new Date()
  const ongoingMonth = now.getMonth()
  const ongoingYear = now.getFullYear()
  const canPrevYear = menuYear > YEAR_OPTIONS[0]!
  const canNextYear = menuYear < YEAR_OPTIONS[YEAR_OPTIONS.length - 1]!

  const yearChoices = YEAR_OPTIONS.includes(year)
    ? YEAR_OPTIONS
    : [...YEAR_OPTIONS, year].sort((a, b) => a - b)

  useEffect(() => {
    if (dateMenu.isOpen) setMenuYear(year)
  }, [dateMenu.isOpen, year])

  useEffect(() => {
    if (!dateMenu.isOpen) return
    function onPointerDown(event: MouseEvent) {
      if (!dateMenuRef.current?.contains(event.target as Node)) {
        dateMenu.close()
      }
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

  return (
    <div className="space-y-5">
      <p className="font-serif text-sm font-semibold text-ink sm:text-base">{kindTitle}</p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => onSelectDay(shiftMonth(day.date, -1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div ref={dateMenuRef} className="relative">
            <h2 className="min-w-0 text-center text-heading font-semibold tracking-tight text-ink sm:min-w-[11rem]">
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={dateMenu.isOpen}
                aria-label="Choose month and year"
                onClick={dateMenu.toggle}
                className={cn(
                  'inline-flex items-baseline gap-1.5 rounded-lg px-1.5 py-0.5',
                  'transition hover:bg-copper/15 hover:text-silver-300',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper',
                )}
              >
                <span>{MONTHS[month]}</span>
                <span>{year}</span>
                <span aria-hidden className="text-[0.65em] text-ink/50">
                  ▾
                </span>
              </button>
            </h2>

            {dateMenu.isOpen && (
              <div
                role="dialog"
                aria-label={`Months in ${menuYear}`}
                className={cn(
                  'absolute left-1/2 top-full z-40 mt-2 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2',
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
              </div>
            )}
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => onSelectDay(shiftMonth(day.date, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => onSelectDay(shiftDay(day.date, -1))}
          >
            <ChevronLeft className="size-4" />
            Prev
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => onSelectDay(today)}
            disabled={day.date === today}
          >
            Today
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => onSelectDay(shiftDay(day.date, 1))}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>

          <label className="group relative ml-1 inline-flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              Year
            </span>
            <span
              className={cn(
                'relative inline-flex items-center rounded-full border border-copper/45',
                'bg-gradient-to-r from-primary/20 to-secondary/15',
                'shadow-[0_0_0_1px_rgba(201,145,115,0.45),0_8_20_12_rgba(15,11,25,0.55)]',
                'transition group-hover:border-copper/70 group-hover:from-primary/30 group-hover:to-secondary/25',
              )}
            >
              <select
                value={year}
                onChange={(e) =>
                  onSelectDay(isoFromParts(Number(e.target.value), month, dayNum))
                }
                aria-label="Choose year"
                className={cn(
                  'appearance-none bg-transparent py-2 pl-4 pr-9',
                  'text-sm font-semibold text-ink outline-none',
                  'focus-visible:ring-2 focus-visible:ring-copper/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
                )}
              >
                {yearChoices.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <span
                aria-hidden
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.7em] text-silver-300"
              >
                ▾
              </span>
            </span>
          </label>
        </div>
      </div>

      <PanchangDayTimeline timeline={day.timeline} />

      <HindiPanchangDayDetail day={day} />

      <div className="grid gap-4 sm:grid-cols-2">
        <PromoCard
          title="Your panchang, offline"
          body="Save a PDF for the day, week, month, year — or pick custom dates. Kept in Downloads history."
          icon={<Download className="size-5" strokeWidth={1.75} />}
          accent="download"
          delayMs={0}
          cta={
            <Button
              variant="secondary"
              size="md"
              className="w-full rounded-full transition hover:scale-[1.02] active:scale-[0.99]"
              onClick={downloadPicker.open}
            >
              Download panchang
            </Button>
          }
        />
        <PromoCard
          title="Personalized muhurat"
          body={`Best start times for ${day.date.slice(8)} ${monthShortLabel(day.date)} — matched to your chart, not just the almanac.`}
          icon={<Sparkles className="size-5" strokeWidth={1.75} />}
          accent="muhurat"
          delayMs={80}
          cta={
            <Button
              variant="primary"
              size="md"
              className="w-full rounded-full transition hover:scale-[1.02] active:scale-[0.99]"
              onClick={onFindMuhurat}
            >
              Personalized muhurat
            </Button>
          }
        />
      </div>

      <PanchangDownloadPicker
        isOpen={downloadPicker.isOpen}
        onClose={downloadPicker.close}
        dateIso={day.date}
        locationLabel={day.place}
      />
    </div>
  )
}

function PromoCard({
  title,
  body,
  icon,
  accent,
  delayMs,
  cta,
}: {
  title: string
  body: string
  icon: ReactNode
  accent: 'download' | 'muhurat'
  delayMs: number
  cta: ReactNode
}) {
  const isDownload = accent === 'download'
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-5 sm:p-6',
        'animate-rise transition duration-300 hover:-translate-y-1 hover:shadow-raised',
        isDownload
          ? 'border-primary/40 bg-gradient-to-br from-primary/25 via-surface/90 to-secondary/15'
          : 'border-copper/45 bg-gradient-to-br from-[#6E4234]/25 via-surface/90 to-[#BF8466]/15',
      )}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-8 -top-10 size-36 rounded-full blur-2xl motion-safe:animate-pulse-soft',
          isDownload ? 'bg-primary/30' : 'bg-[#6E4234]/30',
        )}
      />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -bottom-12 -left-6 size-28 rounded-full blur-2xl motion-safe:animate-float',
          isDownload ? 'bg-secondary/25' : 'bg-[#BF8466]/20',
        )}
      />

      <div className="relative flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className={cn(
              'inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border shadow-sm motion-safe:animate-float',
              isDownload
                ? 'border-primary/40 bg-primary/20 text-silver-300'
                : 'border-copper/45 bg-copper/20 text-[#F2D7C7]',
            )}
          >
            {icon}
          </span>
          <div className="min-w-0 space-y-1">
            <h3 className="font-serif text-lg font-semibold tracking-tight text-ink text-balance sm:text-xl">
              {title}
            </h3>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-purple text-pretty">{body}</p>
        {cta}
      </div>
    </div>
  )
}
