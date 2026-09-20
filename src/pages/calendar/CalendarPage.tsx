import { MapPin } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ErrorState } from '@/components/common/ErrorState'
import { SectionHeader } from '@/components/common/SectionHeader'
import { Skeleton } from '@/components/common/Skeleton'
import { CalendarViewTabs, type CalendarViewId } from '@/components/calendar/CalendarViewTabs'
import { FestivalsCalendarView } from '@/components/calendar/FestivalsCalendarView'
import { HinduCalendarView } from '@/components/calendar/HinduCalendarView'
import { MonthCalendarView } from '@/components/calendar/MonthCalendarView'
import { RemindAccountGate } from '@/components/calendar/RemindAccountGate'
import { VratsCalendarView } from '@/components/calendar/VratsCalendarView'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { useAuth } from '@/auth/auth-context'
import { festivalsForYear, vratsForYear } from '@/data/calendar-catalog'
import { useAsync } from '@/hooks/useAsync'
import { PageContainer } from '@/layouts/PageContainer'
import { getMonthCalendar } from '@/services/calendar.service'
import type { FestivalCategory, FestivalEntry, VratEntry, VratKind } from '@/types/astrology'

function todayIso(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function parseView(raw: string | null): CalendarViewId {
  if (raw === 'festivals' || raw === 'vrats' || raw === 'hindu' || raw === 'month') return raw
  return 'month'
}

/**
 * Calendar — what happens on a date.
 * Month grid, festivals, Hindu calendar (free & open).
 * Vrat & Ekadashi: free to read, account to remember.
 */
export default function CalendarPage() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const view = parseView(params.get('view'))

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedIso, setSelectedIso] = useState(todayIso())
  const [festivalCategory, setFestivalCategory] = useState<'all' | FestivalCategory>('all')
  const [vratFilter, setVratFilter] = useState<'all' | VratKind>('all')
  const [selectedVratId, setSelectedVratId] = useState<string | null>(null)
  const [hinduPaksha, setHinduPaksha] = useState<'Shukla' | 'Krishna'>('Shukla')
  const [reckoning, setReckoning] = useState<'amanta' | 'purnimanta'>('amanta')
  const [selectedTithi, setSelectedTithi] = useState(7)
  const [remindTarget, setRemindTarget] = useState<{ title: string; when: string } | null>(null)

  const { status, data, error, retry } = useAsync(
    (signal) => getMonthCalendar(viewYear, viewMonth, signal),
    [viewYear, viewMonth],
  )

  const festivals = useMemo(() => festivalsForYear(viewYear), [viewYear])
  const vrats = useMemo(() => vratsForYear(viewYear), [viewYear])

  const setView = useCallback(
    (next: CalendarViewId) => {
      const copy = new URLSearchParams(params)
      if (next === 'month') copy.delete('view')
      else copy.set('view', next)
      setParams(copy, { replace: true })
    },
    [params, setParams],
  )

  const shiftMonth = useCallback(
    (delta: number) => {
      const next = new Date(viewYear, viewMonth + delta, 1)
      setViewYear(next.getFullYear())
      setViewMonth(next.getMonth())
      setSelectedIso(
        `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-01`,
      )
    },
    [viewMonth, viewYear],
  )

  const goToday = useCallback(() => {
    const today = new Date()
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelectedIso(todayIso())
  }, [])

  const openRemind = (title: string, dateIso: string) => {
    const when = new Date(`${dateIso}T12:00:00`).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    })
    setRemindTarget({ title, when })
  }

  if (!user) return null

  return (
    <>
      <MobileHeader title="Calendar" titleAs="p" showBack user={user} />

      <PageContainer width="wide">
        {status === 'error' && view === 'month' ? (
          <ErrorState error={error} onRetry={retry} title="Calendar did not load" />
        ) : (
          <article className="animate-rise space-y-7">
            <header className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <SectionHeader
                  as="h1"
                  size="lg"
                  title="Calendar"
                  description="What happens on a date — festivals, vrats, and the Hindu month. Free and open."
                />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/90 bg-surface/90 px-3.5 py-2 text-sm text-muted shadow-sm">
                  <MapPin className="size-3.5 shrink-0 text-copper" aria-hidden />
                  Delhi, India
                </span>
              </div>
              <CalendarViewTabs active={view} onChange={setView} />
            </header>

            {view === 'month' &&
              (status === 'loading' || status === 'idle' || !data ? (
                <div className="space-y-4">
                  <Skeleton className="h-80 w-full rounded-card" />
                </div>
              ) : (
                <MonthCalendarView
                  year={viewYear}
                  month={viewMonth}
                  days={data}
                  selectedIso={selectedIso}
                  todayIso={todayIso()}
                  onSelect={setSelectedIso}
                  onShiftMonth={shiftMonth}
                  onToday={goToday}
                />
              ))}

            {view === 'festivals' && (
              <FestivalsCalendarView
                festivals={festivals}
                year={viewYear}
                category={festivalCategory}
                onCategory={setFestivalCategory}
                onRemind={(f: FestivalEntry) => openRemind(f.name, f.date)}
                onShowMonth={() => setView('month')}
              />
            )}

            {view === 'vrats' && (
              <VratsCalendarView
                vrats={vrats}
                year={viewYear}
                filter={vratFilter}
                selectedId={selectedVratId}
                onFilter={setVratFilter}
                onSelect={setSelectedVratId}
                onRemind={(v: VratEntry) => openRemind(v.name, v.date)}
              />
            )}

            {view === 'hindu' && (
              <HinduCalendarView
                year={viewYear}
                paksha={hinduPaksha}
                onPaksha={setHinduPaksha}
                reckoning={reckoning}
                onReckoning={setReckoning}
                selectedTithi={selectedTithi}
                onSelectTithi={setSelectedTithi}
                onSwitchGregorian={() => setView('month')}
              />
            )}
          </article>
        )}
      </PageContainer>

      <RemindAccountGate
        isOpen={Boolean(remindTarget)}
        onClose={() => setRemindTarget(null)}
        title={remindTarget?.title ?? ''}
        whenLabel={remindTarget?.when ?? ''}
      />
    </>
  )
}
