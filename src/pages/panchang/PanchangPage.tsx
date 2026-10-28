import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SectionHeader } from '@/components/common/SectionHeader'
import { useToast } from '@/components/feedback/toast-context'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import {
  PanchangAlertsView,
} from '@/components/panchang/PanchangExtraViews'
import { HindiPanchangDayView } from '@/components/panchang/HindiPanchangDayView'
import { PanchangHub } from '@/components/panchang/PanchangHub'
import { PanchangTabs, type PanchangTabId, type TimingsSubId } from '@/components/panchang/PanchangTabs'
import { PanchangTithiView } from '@/components/panchang/PanchangTithiView'
import { PanchangTimingsView } from '@/components/panchang/PanchangTimingsView'
import { useAuth } from '@/auth/auth-context'
import {
  panchangKindTitle,
  parsePanchangKind,
  type PanchangKindId,
} from '@/data/panchang-hub'
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
import { MuhuratFlow } from '@/pages/panchang/MuhuratFlow'
import { paths } from '@/routes/paths'

function parseTab(raw: string | null): PanchangTabId {
  if (
    raw === 'today' ||
    raw === 'tithi' ||
    raw === 'timings' ||
    raw === 'muhurat' ||
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
 * Panchang tab opens the Hindu Panchang card hub first; Hindi opens the day view.
 * Downloads live under the account menu.
 */
export default function PanchangPage() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = parseTab(params.get('tab'))
  const timingsSub = parseTimingsSub(params.get('timing'))
  const kind = parsePanchangKind(params.get('kind'))

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

  // Old `?tab=downloads` links open the Downloads list page.
  useEffect(() => {
    if (params.get('tab') !== 'downloads') return
    navigate(paths.downloads, { replace: true })
  }, [params, navigate])

  const setTab = useCallback(
    (next: PanchangTabId) => {
      const copy = new URLSearchParams(params)
      if (next === 'today') copy.delete('tab')
      else copy.set('tab', next)
      if (next !== 'timings') copy.delete('timing')
      // Leaving Panchang tab clears the hub selection.
      if (next !== 'today') copy.delete('kind')
      setParams(copy, { replace: true })
    },
    [params, setParams],
  )

  const setKind = useCallback(
    (next: PanchangKindId | null) => {
      const copy = new URLSearchParams(params)
      copy.delete('tab')
      if (next) copy.set('kind', next)
      else copy.delete('kind')
      setParams(copy, { replace: true })
    },
    [params, setParams],
  )

  const setDayDate = useCallback(
    (iso: string) => {
      setDateIso(iso)
      const copy = new URLSearchParams(params)
      copy.set('date', iso)
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
      <MobileHeader title="Panchang & muhurat" titleAs="p" user={user} />

      <PageContainer width="wide">
        <article className="animate-rise space-y-7">
          <header className="space-y-5">
            <SectionHeader
              as="h1"
              size="lg"
              title="Panchang & muhurat"
              description="Is this time good? Limbs, timings, and muhurat — computed from the panchang for your city."
            />
            <PanchangTabs active={tab} onChange={setTab} />
          </header>

          {tab === 'today' && !kind && <PanchangHub onSelect={setKind} />}

          {tab === 'today' && kind && (
            <HindiPanchangDayView
              day={day}
              kindTitle={panchangKindTitle(kind)}
              onSelectDay={setDayDate}
              onFindMuhurat={() => setTab('muhurat')}
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
              onSelectDay={setDayDate}
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
