import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SectionHeader } from '@/components/common/SectionHeader'
import { useToast } from '@/components/feedback/toast-context'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import {
  PanchangAlertsView,
} from '@/components/panchang/PanchangExtraViews'
import { PanchangTabs, type PanchangTabId, type TimingsSubId } from '@/components/panchang/PanchangTabs'
import { LocationPill } from '@/components/panchang/PanchangTodayView'
import { PanchangTodayView } from '@/components/panchang/PanchangTodayView'
import { PanchangTithiView } from '@/components/panchang/PanchangTithiView'
import { PanchangTimingsView } from '@/components/panchang/PanchangTimingsView'
import { useAuth } from '@/auth/auth-context'
import {
  DEFAULT_PANCHANG_ALERTS,
  buildAvoidWindows,
  buildChoghadiya,
  buildHora,
  buildPanchangDay,
  type PanchangAlertPref,
} from '@/data/panchang-mock'
import { PageContainer } from '@/layouts/PageContainer'
import { hasActivePlan } from '@/onboarding/past-intro'
import { PanchangDownloadsFlow } from '@/pages/panchang/DownloadsFlow'
import { MuhuratFlow } from '@/pages/panchang/MuhuratFlow'

function parseTab(raw: string | null): PanchangTabId {
  if (
    raw === 'today' ||
    raw === 'tithi' ||
    raw === 'timings' ||
    raw === 'muhurat' ||
    raw === 'downloads' ||
    raw === 'alerts'
  ) {
    return raw
  }
  return 'today'
}

function parseTimingsSub(raw: string | null): TimingsSubId {
  if (raw === 'choghadiya' || raw === 'hora' || raw === 'rahu') return raw
  return 'choghadiya'
}

function shiftIso(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function todayIso(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function parseDateParam(raw: string | null): string {
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  return todayIso()
}

/**
 * Panchang & muhurat — is this time good?
 * Today, tithi & nakshatra, Timings (choghadiya, hora, Rahu kaal), muhurat, downloads, alerts.
 */
export default function PanchangPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const tab = parseTab(params.get('tab'))
  const timingsSub = parseTimingsSub(params.get('timing'))

  const [dateIso, setDateIso] = useState(() => parseDateParam(params.get('date')))
  const [choghadiyaPeriod, setChoghadiyaPeriod] = useState<'day' | 'night'>('day')
  const [horaSpan, setHoraSpan] = useState<'day' | 'night'>('day')
  const [alerts, setAlerts] = useState<PanchangAlertPref[]>(DEFAULT_PANCHANG_ALERTS)

  const day = useMemo(() => buildPanchangDay(dateIso), [dateIso])
  const choghadiya = useMemo(() => buildChoghadiya(choghadiyaPeriod), [choghadiyaPeriod])
  const horas = useMemo(() => buildHora(horaSpan), [horaSpan])
  const avoid = useMemo(() => buildAvoidWindows(), [])
  const isPremium = Boolean(user && hasActivePlan(user.id))

  // Calendar (and other) deep-links pass `?date=YYYY-MM-DD`.
  useEffect(() => {
    const fromUrl = params.get('date')
    if (!fromUrl) return
    const next = parseDateParam(fromUrl)
    setDateIso((prev) => (prev === next ? prev : next))
  }, [params])

  const setTab = useCallback(
    (next: PanchangTabId) => {
      const copy = new URLSearchParams(params)
      if (next === 'today') copy.delete('tab')
      else copy.set('tab', next)
      if (next !== 'timings') copy.delete('timing')
      setParams(copy, { replace: true })
    },
    [params, setParams],
  )

  const setTiming = useCallback(
    (next: TimingsSubId) => {
      const copy = new URLSearchParams(params)
      copy.set('tab', 'timings')
      if (next === 'choghadiya') copy.delete('timing')
      else copy.set('timing', next)
      setParams(copy, { replace: true })
    },
    [params, setParams],
  )

  if (!user) return null

  return (
    <>
      <MobileHeader title="Panchang & muhurat" titleAs="p" showBack user={user} />

      <PageContainer width="wide">
        <article className="animate-rise space-y-7">
          <header className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <SectionHeader
                as="h1"
                size="lg"
                title="Panchang & muhurat"
                description="Is this time good? Limbs, timings, and muhurat — computed from the panchang for your city."
              />
              <LocationPill label={day.place} />
            </div>
            <PanchangTabs active={tab} onChange={setTab} />
          </header>

          {tab === 'today' && (
            <PanchangTodayView
              day={day}
              onPrev={() => setDateIso((d) => shiftIso(d, -1))}
              onNext={() => setDateIso((d) => shiftIso(d, 1))}
              onFindMuhurat={() => setTab('muhurat')}
              onDownload={() => setTab('downloads')}
            />
          )}

          {tab === 'tithi' && <PanchangTithiView day={day} />}

          {tab === 'timings' && (
            <PanchangTimingsView
              day={day}
              sub={timingsSub}
              onSub={setTiming}
              choghadiyaPeriod={choghadiyaPeriod}
              onChoghadiyaPeriod={setChoghadiyaPeriod}
              choghadiya={choghadiya}
              horaSpan={horaSpan}
              onHoraSpan={setHoraSpan}
              horas={horas}
              avoid={avoid}
            />
          )}

          {tab === 'muhurat' && (
            <MuhuratFlow
              locationLabel={day.place}
              isPremium={isPremium}
              dateIso={dateIso}
            />
          )}

          {tab === 'downloads' && (
            <PanchangDownloadsFlow
              locationLabel={day.place}
              dateIso={dateIso}
              isStandard={isPremium}
            />
          )}

          {tab === 'alerts' && (
            <PanchangAlertsView
              alerts={alerts}
              onToggle={(id) =>
                setAlerts((prev) =>
                  prev.map((row) => (row.id === id ? { ...row, enabled: !row.enabled } : row)),
                )
              }
              onSave={() =>
                toast.success('Alerts saved', {
                  description: 'Push and email preferences updated for this device.',
                })
              }
            />
          )}
        </article>
      </PageContainer>
    </>
  )
}
