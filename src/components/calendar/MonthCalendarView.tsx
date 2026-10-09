import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Lock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { festivalOnDate, nextFestivals } from '@/data/calendar-catalog'
import { useDisclosure } from '@/hooks/useDisclosure'
import { paths } from '@/routes/paths'
import type { CalendarDay, CalendarEventKind } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { formatDayAndDate } from '@/utils/format'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

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

function isoParts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return { year: y ?? 0, month: (m ?? 1) - 1, day: d ?? 1 }
}

function isSameIso(a: string, b: string) {
  return a.slice(0, 10) === b.slice(0, 10)
}

function isCurrentMonth(iso: string, year: number, month: number) {
  const { year: y, month: m } = isoParts(iso)
  return y === year && m === month
}

function shortTithi(tithi: string) {
  return tithi
    .replace(/^Shukla /, 'S')
    .replace(/^Krishna /, 'K')
    .replace('Pratipada', '1')
    .replace('Dwitiya', '2')
    .replace('Tritiya', '3')
    .replace('Chaturthi', '4')
    .replace('Panchami', '5')
    .replace('Shashthi', '6')
    .replace('Saptami', '7')
    .replace('Ashtami', '8')
    .replace('Navami', '9')
    .replace('Dashami', '10')
    .replace('Ekadashi', '11')
    .replace('Dwadashi', '12')
    .replace('Trayodashi', '13')
    .replace('Chaturdashi', '14')
    .replace('Purnima', 'Pu')
    .replace('Amavasya', 'Am')
}

function pillClass(kind: CalendarEventKind) {
  if (kind === 'festival') return 'bg-copper/25 text-pale-copper border-copper/45'
  return 'bg-navy-soft text-purple border-border/80'
}

const YEAR_OPTIONS = Array.from({ length: 21 }, (_, i) => 2016 + i)

export interface MonthCalendarViewProps {
  year: number
  month: number
  days: CalendarDay[]
  selectedIso: string
  todayIso: string
  onSelect: (iso: string) => void
  onShiftMonth: (delta: number) => void
  /** Jump to a specific year + month (0–11). */
  onNavigate: (year: number, month: number) => void
  locationLabel?: string
}

/**
 * Gregorian month grid + day detail rail — festivals and vrats as free, open calendar.
 */
export function MonthCalendarView({
  year,
  month,
  days,
  selectedIso,
  todayIso,
  onSelect,
  onShiftMonth,
  onNavigate,
  locationLabel = 'Delhi, India',
}: MonthCalendarViewProps) {
  const monthMenu = useDisclosure()
  const monthMenuRef = useRef<HTMLDivElement>(null)
  const [menuYear, setMenuYear] = useState(year)
  const selected = days.find((d) => isSameIso(d.date, selectedIso))
  const festival = selected ? festivalOnDate(selected.date) : undefined
  const upcoming = nextFestivals(selectedIso, 1)
  const now = new Date()
  const ongoingMonth = now.getMonth()
  const ongoingYear = now.getFullYear()
  const canPrevYear = menuYear > YEAR_OPTIONS[0]!
  const canNextYear = menuYear < YEAR_OPTIONS[YEAR_OPTIONS.length - 1]!

  useEffect(() => {
    if (monthMenu.isOpen) setMenuYear(year)
  }, [monthMenu.isOpen, year])

  useEffect(() => {
    if (!monthMenu.isOpen) return
    function onPointerDown(event: MouseEvent) {
      if (!monthMenuRef.current?.contains(event.target as Node)) {
        monthMenu.close()
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') monthMenu.close()
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [monthMenu])

  const yearChoices = YEAR_OPTIONS.includes(year)
    ? YEAR_OPTIONS
    : [...YEAR_OPTIONS, year].sort((a, b) => a - b)

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,21rem)] xl:items-start xl:gap-7">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onShiftMonth(-1)}
              aria-label="Previous month"
              className="rounded-full"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div ref={monthMenuRef} className="relative">
              <h2 className="min-w-[11rem] text-center text-heading font-semibold tracking-tight text-ink">
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={monthMenu.isOpen}
                  aria-label="Choose month and year"
                  onClick={monthMenu.toggle}
                  className={cn(
                    'inline-flex items-baseline gap-1.5 rounded-lg px-1.5 py-0.5',
                    'transition hover:bg-copper/15 hover:text-copper',
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

              {monthMenu.isOpen && (
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
                      const isOngoing =
                        menuYear === ongoingYear && index === ongoingMonth
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            onNavigate(menuYear, index)
                            monthMenu.close()
                          }}
                          className={cn(
                            'rounded-xl border px-1.5 py-2.5 text-center text-xs font-semibold transition sm:text-sm',
                            selectedMonth
                              ? 'border-copper/60 bg-copper/20 text-copper'
                              : isOngoing
                                ? 'border-copper/35 bg-copper/10 text-ink'
                                : 'border-transparent text-ink hover:border-copper/30 hover:bg-copper/10',
                          )}
                        >
                          {label}
                          {isOngoing && (
                            <span className="mt-0.5 block font-mono text-[8px] font-semibold uppercase tracking-wide text-copper/80">
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
              onClick={() => onShiftMonth(1)}
              aria-label="Next month"
              className="rounded-full"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <label className="group relative inline-flex items-center gap-2.5">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              Year
            </span>
            <span
              className={cn(
                'relative inline-flex items-center rounded-full border border-copper/45',
                'bg-gradient-to-r from-[#7c4dff]/20 to-[#3a7bd5]/15',
                'shadow-[0_0_0_1px_rgba(124,77,255,0.12),0_8px_20px_-12px_rgba(124,77,255,0.55)]',
                'transition group-hover:border-copper/70 group-hover:from-[#7c4dff]/30 group-hover:to-[#3a7bd5]/25',
              )}
            >
              <select
                value={year}
                onChange={(e) => onNavigate(Number(e.target.value), month)}
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
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.7em] text-copper"
              >
                ▾
              </span>
            </span>
          </label>
        </div>

        <Card padding="none" className="overflow-hidden border-border/80">
          <div className="grid grid-cols-7 border-b border-border/60 bg-surface-sunken/50">
            {WEEKDAYS.map((label) => (
              <div
                key={label}
                className="px-1.5 py-3 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted"
              >
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border/50">
            {days.map((day) => {
              const { day: dayNum } = isoParts(day.date)
              const inMonth = isCurrentMonth(day.date, year, month)
              const isToday = isSameIso(day.date, todayIso)
              const isSelected = isSameIso(day.date, selectedIso)
              const headline =
                day.events.find((e) => e.kind === 'festival') ??
                day.events.find((e) => e.kind === 'ekadashi') ??
                day.events.find((e) => e.kind === 'vrat')

              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => onSelect(day.date.slice(0, 10))}
                  className={cn(
                    'relative flex min-h-[4.75rem] flex-col gap-1.5 p-2 text-left transition-colors sm:min-h-[5.5rem] sm:p-2.5',
                    !inMonth && 'bg-surface-sunken/30 opacity-45',
                    inMonth && 'bg-surface/90',
                    isSelected && 'bg-copper/12 ring-1 ring-inset ring-copper/50',
                    !isSelected && inMonth && 'hover:bg-navy-soft/50',
                  )}
                >
                  <div className="flex w-full items-start justify-between gap-1">
                    <span
                      className={cn(
                        'inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold',
                        isToday && 'bg-copper text-midnight',
                        !isToday && 'text-ink',
                      )}
                    >
                      {dayNum}
                    </span>
                    {inMonth && (
                      <span className="pt-0.5 font-mono text-[9px] uppercase tracking-wide text-muted">
                        {shortTithi(day.tithi)}
                      </span>
                    )}
                  </div>
                  {inMonth && headline && (
                    <span
                      className={cn(
                        'mt-auto line-clamp-2 rounded-md border px-2 py-1.5 text-[10px] font-medium leading-tight',
                        pillClass(headline.kind),
                      )}
                    >
                      {headline.name}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </Card>
      </div>

      <aside className="xl:sticky xl:top-6">
        <Card padding="lg" className="flex flex-col gap-5 border-border/80 sm:gap-6 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                {selected ? formatDayAndDate(selected.date) : 'Select a day'}
              </p>
              {selected && (
                <p className="text-xs leading-relaxed text-muted text-pretty">
                  {selected.hinduMonth}, {selected.paksha} Paksha
                  {selected.samvat ? ` · ${selected.samvat}` : ''}
                </p>
              )}
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-muted">
              <MapPin className="size-3 text-copper" aria-hidden />
              {locationLabel.split(',')[0]}
            </span>
          </div>

          {festival && (
            <div className="rounded-2xl border border-copper/35 bg-copper/10 p-4 sm:p-5">
              <p className="font-semibold text-ink">{festival.name}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted text-pretty">{festival.blurb}</p>
              <Link
                to={paths.calendarFestival(festival.id)}
                className="mt-3 inline-flex text-sm font-medium text-gold-deep hover:underline"
              >
                Read full details →
              </Link>
            </div>
          )}

          {selected ? (
            <dl className="space-y-3.5 border-t border-border/60 pt-4">
              <RailRow label="Tithi" value={`${selected.tithi} → ${selected.tithiEnds ?? '—'}`} />
              <RailRow
                label="Nakshatra"
                value={`${selected.nakshatra} → ${selected.nakshatraEnds ?? '—'}`}
              />
              <RailRow label="Yoga" value={`${selected.yoga} → ${selected.yogaEnds ?? '—'}`} />
              <RailRow
                label="Karana"
                value={`${selected.karana} → ${selected.karanaEnds ?? '—'}`}
              />
              <RailRow
                label="Sunrise / Sunset"
                value={`${selected.sunrise ?? '—'} / ${selected.sunset ?? '—'}`}
              />
              <RailRow label="Rahu kaal" value={selected.rahuKaal ?? '—'} />
            </dl>
          ) : (
            <p className="text-sm text-muted">Tap a date on the grid for panchang.</p>
          )}

          {!festival && selected && (
            <div className="rounded-2xl border border-border/70 bg-surface-sunken/60 p-4 sm:p-5">
              <p className="text-xs leading-relaxed text-muted text-pretty">
                No festival today.
                {upcoming[0]
                  ? ` Next: ${upcoming[0].name}, ${formatShort(upcoming[0].date)}.`
                  : ''}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3.5 border-t border-border/60 pt-5">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-left text-sm text-muted"
              disabled
              title="Needs a plan"
            >
              <Lock className="size-3.5 shrink-0" aria-hidden />
              Match this day to your chart
            </button>

            <div className="flex flex-col gap-2.5">
              <Button
                variant="secondary"
                size="md"
                className="w-full rounded-full"
                to={`${paths.panchang}?tab=muhurat&date=${selectedIso.slice(0, 10)}`}
              >
                Find muhurat for this day
              </Button>
              <Button
                variant="primary"
                size="md"
                className="w-full rounded-full"
                iconLeft={<Download className="size-3.5" />}
                to={`${paths.panchang}?tab=downloads&date=${selectedIso.slice(0, 10)}`}
              >
                Download panchang
              </Button>
              <p className="pt-1 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                PDF / Cal — opens in Panchang
              </p>
            </div>
          </div>
        </Card>
      </aside>
    </div>
  )
}

function RailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <dt className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">
        {label}
      </dt>
      <dd className="text-right font-medium leading-snug text-ink text-pretty">{value}</dd>
    </div>
  )
}

function formatShort(iso: string) {
  const { day, month } = isoParts(iso)
  return `${day} ${MONTHS[month]?.slice(0, 3) ?? ''}`
}

export function EventKindBadge({ kind }: { kind: CalendarEventKind }) {
  return (
    <Badge tone={kind === 'festival' ? 'gold' : kind === 'ekadashi' ? 'navy' : 'neutral'} mono>
      {kind}
    </Badge>
  )
}
