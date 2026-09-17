import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/common/Skeleton'
import { CelestialCard } from '@/components/celestial/CelestialCard'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { useAuth } from '@/auth/auth-context'
import { useAsync } from '@/hooks/useAsync'
import { PageContainer } from '@/layouts/PageContainer'
import type { CalendarDay, CalendarEventKind } from '@/types/astrology'
import { getMonthCalendar } from '@/services/calendar.service'
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

const EVENT_BADGE: Record<CalendarEventKind, 'gold' | 'neutral' | 'navy'> = {
  festival: 'gold',
  vrat: 'navy',
  ekadashi: 'neutral',
}

function isoParts(iso: string): { year: number; month: number; day: number } {
  const [y, m, d] = iso.split('-').map(Number)
  return { year: y ?? 0, month: (m ?? 1) - 1, day: d ?? 1 }
}

function isSameIso(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10)
}

function isCurrentMonth(iso: string, year: number, month: number): boolean {
  const { year: y, month: m } = isoParts(iso)
  return y === year && m === month
}

function todayIso(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Hindu calendar — month grid with panchang, festivals and vrats per day.
 */
export default function CalendarPage() {
  const { user } = useAuth()
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedIso, setSelectedIso] = useState(todayIso())

  const { status, data, error, retry } = useAsync(
    (signal) => getMonthCalendar(viewYear, viewMonth, signal),
    [viewYear, viewMonth],
  )

  const selectedDay = useMemo(
    () => data?.find((day) => isSameIso(day.date, selectedIso)),
    [data, selectedIso],
  )

  const shiftMonth = useCallback(
    (delta: number) => {
      const next = new Date(viewYear, viewMonth + delta, 1)
      setViewYear(next.getFullYear())
      setViewMonth(next.getMonth())
      if (delta !== 0 && !isCurrentMonth(selectedIso, next.getFullYear(), next.getMonth())) {
        setSelectedIso(
          `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-01`,
        )
      }
    },
    [viewMonth, viewYear, selectedIso],
  )

  const goToday = useCallback(() => {
    const today = new Date()
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelectedIso(todayIso())
  }, [])

  if (!user) return null

  return (
    <>
      <MobileHeader title="Calendar" titleAs="p" showBack user={user} />

      <PageContainer width="content">
        {status === 'error' ? (
          <ErrorState error={error} onRetry={retry} title="Calendar did not load" />
        ) : (
          <article className="animate-rise space-y-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1">
                <p className="font-mono text-label uppercase text-muted">Hindu calendar</p>
                <h1 className="font-serif text-title font-normal text-ink text-balance lg:text-title-lg">
                  {MONTHS[viewMonth]} {viewYear}
                </h1>
                <p className="max-w-md text-sub text-purple text-pretty">
                  Panchang, tithi, nakshatra and festivals — tap any day for details.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => shiftMonth(-1)}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </Button>
                <Button variant="secondary" size="sm" onClick={goToday}>
                  Today
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => shiftMonth(1)}
                  aria-label="Next month"
                >
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              </div>
            </header>

            {status === 'loading' || status === 'idle' || !data ? (
              <CalendarSkeleton />
            ) : (
              <>
                <Card tone="default" padding="md" className="overflow-hidden">
                  <div className="grid grid-cols-7 gap-px rounded-control bg-border/60">
                    {WEEKDAYS.map((label) => (
                      <div
                        key={label}
                        className="bg-surface-sunken/80 px-1 py-2 text-center font-mono text-[10px] uppercase tracking-wider text-muted"
                      >
                        {label}
                      </div>
                    ))}

                    {data.map((day) => {
                      const { day: dayNum } = isoParts(day.date)
                      const inMonth = isCurrentMonth(day.date, viewYear, viewMonth)
                      const isToday = isSameIso(day.date, todayIso())
                      const isSelected = isSameIso(day.date, selectedIso)
                      const headline =
                        day.events.find((e) => e.kind === 'festival') ??
                        day.events.find((e) => e.kind === 'vrat') ??
                        day.events[0]

                      return (
                        <button
                          key={day.date}
                          type="button"
                          onClick={() => setSelectedIso(day.date.slice(0, 10))}
                          className={cn(
                            'relative flex min-h-[4.75rem] flex-col items-start gap-0.5 bg-surface/95 p-1.5 text-left transition-colors sm:p-2',
                            !inMonth && 'opacity-40',
                            isSelected && 'bg-gold-soft/80 ring-1 ring-inset ring-copper/40',
                            !isSelected && 'hover:bg-navy-soft/50',
                          )}
                        >
                          <span
                            className={cn(
                              'inline-flex size-6 items-center justify-center rounded-full text-sm font-medium',
                              isToday && 'bg-copper text-on-celestial',
                              !isToday && 'text-ink',
                            )}
                          >
                            {dayNum}
                          </span>
                          {inMonth && headline ? (
                            <span className="line-clamp-2 text-[9px] font-medium leading-tight text-gold-deep sm:text-[10px]">
                              {headline.name}
                            </span>
                          ) : (
                            inMonth && (
                              <span className="line-clamp-2 text-[10px] leading-tight text-muted">
                                {day.tithi.replace(/^Shukla |^Krishna /, '')}
                              </span>
                            )
                          )}
                          {day.events.length > 1 && inMonth && (
                            <span
                              aria-hidden
                              className="absolute bottom-1.5 right-1.5 size-1.5 rounded-full bg-gold-deep"
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </Card>

                {selectedDay ? (
                  <DayDetail day={selectedDay} />
                ) : (
                  <Card tone="sunken" padding="md">
                    <p className="text-sub text-purple">Select a day to see panchang details.</p>
                  </Card>
                )}
              </>
            )}
          </article>
        )}
      </PageContainer>
    </>
  )
}

function DayDetail({ day }: { day: CalendarDay }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <CelestialCard motifs={['stars']} tone="midnight" seed={day.date} padding="lg">
        <header className="space-y-2">
          <p className="font-mono text-label uppercase text-gold-soft-line">
            {formatDayAndDate(day.date)}
          </p>
          <h2 className="font-serif text-title font-normal text-on-celestial text-balance">
            {day.tithi}
          </h2>
          <p className="text-sub text-on-celestial-muted">
            {day.vaar} · {day.paksha} paksha
          </p>
        </header>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <PanchangItem label="Nakshatra" value={day.nakshatra} />
          <PanchangItem label="Yoga" value={day.yoga} />
          <PanchangItem label="Karana" value={day.karana} />
          <PanchangItem label="Paksha" value={day.paksha} />
        </dl>
      </CelestialCard>

      <Card tone="default" padding="lg" className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-gold-deep" aria-hidden />
          <h3 className="font-mono text-label uppercase text-muted">Observances</h3>
        </div>

        {day.events.length === 0 ? (
          <p className="text-sub text-purple text-pretty">
            No major festival or vrat on this day in the almanac.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {day.events.map((event) => (
              <li
                key={`${event.kind}-${event.name}`}
                className="flex items-center justify-between gap-3 rounded-control border border-border/80 bg-surface-sunken/50 px-3 py-2.5"
              >
                <span className="text-sub text-ink">{event.name}</span>
                <Badge tone={EVENT_BADGE[event.kind]} mono>
                  {event.kind}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function PanchangItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-control border border-gold-border/30 bg-on-celestial/5 px-3 py-2.5">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-gold-soft-line">
        {label}
      </dt>
      <dd className="mt-0.5 text-sub font-medium text-on-celestial">{value}</dd>
    </div>
  )
}

function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-72 w-full rounded-card" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-48 rounded-card" />
        <Skeleton className="h-48 rounded-card" />
      </div>
    </div>
  )
}
