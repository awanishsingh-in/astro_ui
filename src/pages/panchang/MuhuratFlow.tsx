import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CalendarPlus, Lock, MapPin, Share2, Trash2 } from 'lucide-react'
import { useAuth } from '@/auth/auth-context'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { RemindCalendarChoice } from '@/components/calendar/RemindCalendarChoice'
import { useToast } from '@/components/feedback/toast-context'
import {
  buildGenericMuhuratResults,
  buildPersonalisedMuhuratResults,
  DEFAULT_SAVED_MUHURATS,
  MUHURAT_HOME_GROUPS,
  MUHURAT_LOOKUP_PURPOSES,
  MUHURAT_RECENT_SEARCHES,
  type MuhuratPurposeId,
  type SavedMuhurat,
} from '@/data/panchang-mock'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'
import { formatDayAndDate } from '@/utils/format'

/** Best-effort ISO date from labels like "Sun 11 Oct". */
function muhuratDateIso(dateLabel: string): string {
  const year = new Date().getFullYear()
  const parsed = new Date(`${dateLabel} ${year}`)
  if (Number.isNaN(parsed.getTime())) {
    return `${year}-01-01`
  }
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
}

type MuhuratScreen = 'home' | 'lookup' | 'generic' | 'personalised' | 'saved'

function QualityBars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-end gap-0.5" aria-label={`${value} of ${max} panchang quality`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={cn(
            'w-1 rounded-sm',
            i < value ? 'bg-copper' : 'bg-border-strong',
          )}
          style={{ height: `${6 + i * 2}px` }}
        />
      ))}
    </div>
  )
}

function purposeLabel(id: MuhuratPurposeId) {
  const all = [
    ...MUHURAT_LOOKUP_PURPOSES,
    ...MUHURAT_HOME_GROUPS.flatMap((g) => g.items),
  ]
  return all.find((p) => p.id === id)?.label ?? 'Muhurat'
}

/**
 * Muhurat — computed from panchang, not a fixed calendar date.
 * Free: generic city windows. Premium: re-ranked against the birth chart.
 * Screens: lookup (P6) → generic (P7) / personalised (P8) · premium home (P9) · saved (P10).
 */
function shortDayLabel(iso: string) {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(d.getTime())) return formatDayAndDate(iso)
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function MuhuratFlow({
  locationLabel,
  isPremium,
  dateIso,
}: {
  locationLabel: string
  isPremium: boolean
  /** Calendar / panchang day this muhurat view is anchored to. */
  dateIso: string
}) {
  const toast = useToast()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [screen, setScreen] = useState<MuhuratScreen>(isPremium ? 'home' : 'lookup')
  const [purpose, setPurpose] = useState<MuhuratPurposeId>('griha-pravesh')
  const [fromDate, setFromDate] = useState('01 Oct 2026')
  const [toDate, setToDate] = useState('31 Oct 2026')
  const [city, setCity] = useState(locationLabel)
  const dayLabel = shortDayLabel(dateIso)
  const [saved, setSaved] = useState<SavedMuhurat[]>(DEFAULT_SAVED_MUHURATS)
  const [savedFilter, setSavedFilter] = useState<'all' | 'self' | 'family' | 'upcoming'>('all')
  const [hasBirthProfile] = useState(true)
  const [remindTarget, setRemindTarget] = useState<{
    id: string
    title: string
    when: string
    dateIso: string
  } | null>(null)

  const label = purposeLabel(purpose)
  const genericRows = useMemo(() => buildGenericMuhuratResults(label), [label])
  const personalRows = useMemo(() => buildPersonalisedMuhuratResults(), [])

  function runSearch(nextPurpose?: MuhuratPurposeId) {
    if (nextPurpose) setPurpose(nextPurpose)
    setScreen(isPremium && hasBirthProfile ? 'personalised' : 'generic')
  }

  function saveWindow(row: { dateLabel: string; window: string }, matched: boolean) {
    if (!isPremium) {
      toast.info('Saved locally', {
        description: 'Sign in to sync push reminders across devices.',
      })
      return
    }
    const id = `s-${Date.now()}`
    setSaved((prev) => [
      {
        id,
        purpose: label,
        forLabel: matched ? 'Self' : 'Generic',
        dateLabel: row.dateLabel,
        window: row.window.replace(/\s/g, ''),
        status: 'No reminder yet',
      },
      ...prev,
    ])
    toast.success('Muhurat saved', { description: `${label} · ${row.dateLabel}` })
    setScreen('saved')
  }

  const remindSheet = (
    <RemindCalendarChoice
      isOpen={Boolean(remindTarget)}
      onClose={() => setRemindTarget(null)}
      onSaved={() => {
        if (!remindTarget) return
        setSaved((prev) =>
          prev.map((row) =>
            row.id === remindTarget.id ? { ...row, status: 'Notification on' } : row,
          ),
        )
      }}
      title={remindTarget?.title ?? ''}
      whenLabel={remindTarget?.when ?? ''}
      dateIso={remindTarget?.dateIso ?? ''}
      kind="muhurat"
    />
  )

  if (screen === 'saved') {
    return (
      <>
      <SavedMuhuratsView
        items={saved}
        filter={savedFilter}
        onFilter={setSavedFilter}
        onBack={() => setScreen(isPremium ? 'home' : 'lookup')}
        onRemind={(item) => {
          if (!user) {
            toast.info('Sign in to set a push reminder')
            return
          }
          setRemindTarget({
            id: item.id,
            title: `${item.purpose} muhurat`,
            when: `${item.dateLabel} · ${item.window}`,
            dateIso: muhuratDateIso(item.dateLabel),
          })
        }}
        onRemove={(id) => {
          setSaved((prev) => prev.filter((s) => s.id !== id))
          toast.info('Removed from saved')
        }}
      />
      {remindSheet}
      </>
    )
  }

  if (screen === 'generic') {
    return (
      <GenericResultsView
        purpose={label}
        range={`${fromDate.replace(/^\d+\s/, '')}–${toDate}`}
        city={city}
        rows={genericRows}
        isPremium={isPremium}
        onChange={() => setScreen('lookup')}
        onSave={(row) => saveWindow(row, false)}
        onUnlock={() => {
          if (isPremium) {
            setScreen('personalised')
            return
          }
          toast.info('Premium unlocks personalised muhurat', {
            description: 'Same windows, filtered against your chart.',
            action: { label: 'Account', onClick: () => navigate(paths.account) },
          })
        }}
      />
    )
  }

  if (screen === 'personalised') {
    if (isPremium && !hasBirthProfile) {
      return (
        <Card padding="lg" tone="gold" className="gap-3 border-copper/40">
          <Badge tone="gold" mono className="w-fit">
            <Lock className="mr-1 size-3" aria-hidden />
            Premium · birth profile needed
          </Badge>
          <h2 className="text-heading font-semibold text-ink text-pretty">
            Add your birth date, time and place to personalise these times.
          </h2>
          <p className="text-sm text-muted text-pretty">
            Never a blank screen, never a second payment prompt — results render as soon as the chart
            is on file.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="primary" size="sm" className="rounded-full" to={paths.profile}>
              Add birth details
            </Button>
            <Button variant="secondary" size="sm" className="rounded-full" onClick={() => setScreen('generic')}>
              View generic windows
            </Button>
          </div>
        </Card>
      )
    }

    return (
      <PersonalisedResultsView
        purpose={label}
        rows={personalRows}
        onChange={() => setScreen('lookup')}
        onSave={(row) => saveWindow(row, true)}
        onHome={() => setScreen('home')}
      />
    )
  }

  if (screen === 'home' && isPremium) {
    return (
      <PremiumHomeView
        locationLabel={city}
        dayLabel={dayLabel}
        savedCount={saved.filter((s) => !s.past).length}
        onPick={(id) => {
          setPurpose(id)
          setScreen('lookup')
        }}
        onCustom={() => {
          setPurpose('other')
          setScreen('lookup')
        }}
        onSaved={() => setScreen('saved')}
        onSeeToday={() => runSearch('griha-pravesh')}
      />
    )
  }

  return (
    <LookupView
      purpose={purpose}
      onPurpose={setPurpose}
      fromDate={fromDate}
      toDate={toDate}
      city={city}
      onFrom={setFromDate}
      onTo={setToDate}
      onCity={setCity}
      isPremium={isPremium}
      onSubmit={() => runSearch()}
      onSeePremiumDiff={() => {
        toast.info('Personalised muhurat', {
          description: 'Premium re-ranks windows against dasha, transits and your doshas.',
          action: { label: 'Account', onClick: () => navigate(paths.account) },
        })
      }}
    />
  )
}

function LookupView({
  purpose,
  onPurpose,
  fromDate,
  toDate,
  city,
  onFrom,
  onTo,
  onCity,
  isPremium,
  onSubmit,
  onSeePremiumDiff,
}: {
  purpose: MuhuratPurposeId
  onPurpose: (id: MuhuratPurposeId) => void
  fromDate: string
  toDate: string
  city: string
  onFrom: (v: string) => void
  onTo: (v: string) => void
  onCity: (v: string) => void
  isPremium: boolean
  onSubmit: () => void
  onSeePremiumDiff: () => void
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.75fr)] lg:gap-7 xl:items-start">
      <Card padding="lg" className="gap-6 border-border/80 sm:gap-7 sm:p-7">
        <h2 className="text-heading font-semibold text-ink text-pretty">
          What do you need an auspicious time for?
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:gap-3.5 lg:grid-cols-4">
          {MUHURAT_LOOKUP_PURPOSES.map((p) => {
            const active = purpose === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPurpose(p.id)}
                className={cn(
                  'flex min-h-[4.25rem] flex-col items-start gap-2.5 rounded-2xl border px-3.5 py-3.5 text-left transition sm:min-h-0 sm:flex-row sm:items-center sm:gap-3 sm:px-4',
                  active
                    ? 'border-copper bg-copper/15 text-ink'
                    : 'border-border/80 bg-surface-sunken/40 text-muted hover:border-copper/40 hover:text-ink',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'size-3.5 shrink-0 rounded-sm',
                    active ? 'bg-copper' : 'bg-border-strong',
                  )}
                />
                <span className="text-sm font-medium leading-snug text-pretty">{p.label}</span>
              </button>
            )
          })}
        </div>

        <div className="grid gap-4 sm:grid-cols-3 sm:gap-4">
          <Field label="From" value={fromDate} onChange={onFrom} />
          <Field label="To" value={toDate} onChange={onTo} />
          <Field label="City" value={city} onChange={onCity} />
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:gap-4">
          <Button variant="primary" size="lg" className="rounded-full sm:shrink-0" onClick={onSubmit}>
            Show auspicious times
          </Button>
          <p className="max-w-xs text-xs leading-relaxed text-muted">
            {isPremium
              ? 'Will match windows to your chart when birth details are on file.'
              : 'Generic panchang windows — free, no sign-in'}
          </p>
        </div>
      </Card>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          Two kinds of muhurat
        </p>
        <Card padding="lg" className="gap-0 border-border/80">
          <p className="text-sm leading-relaxed text-ink text-pretty">
            <strong className="font-semibold">Generic</strong> — from the panchang for your city. Same
            for everyone. Free.
          </p>
        </Card>
        <Card padding="lg" tone="gold" className="gap-3.5 border-copper/35">
          <Badge tone="gold" mono className="w-fit">
            <Lock className="mr-1 size-3" aria-hidden />
            Premium
          </Badge>
          <p className="text-sm leading-relaxed text-ink text-pretty">
            <strong className="font-semibold">Personalised</strong> — the same windows filtered against
            your birth chart: dasha, transits, and your own doshas.
          </p>
          {!isPremium && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-1 w-fit rounded-full"
              onClick={onSeePremiumDiff}
            >
              See what changes
            </Button>
          )}
        </Card>
        <div className="flex min-h-32 flex-1 items-center justify-center rounded-2xl border border-dashed border-border-strong/80 px-4 py-8 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Illustration
        </div>
      </aside>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block space-y-2">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border/80 bg-surface-sunken/50 px-3.5 py-3 text-sm text-ink outline-none transition focus:border-copper"
      />
    </label>
  )
}

function GenericResultsView({
  purpose,
  range,
  city,
  rows,
  isPremium,
  onChange,
  onSave,
  onUnlock,
}: {
  purpose: string
  range: string
  city: string
  rows: ReturnType<typeof buildGenericMuhuratResults>
  isPremium: boolean
  onChange: () => void
  onSave: (row: { dateLabel: string; window: string }) => void
  onUnlock: () => void
}) {
  const visible = rows.slice(0, 5)
  return (
    <Card padding="lg" className="gap-4 border-border/80">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink">
          <span className="font-semibold">{purpose}</span>
          <span className="text-muted">
            {' '}
            · {range} · {city}
          </span>
        </p>
        <Button variant="secondary" size="sm" className="rounded-full" onClick={onChange}>
          Change
        </Button>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {rows.length} windows found
        </p>
        <p className="text-xs text-muted">Sorted by panchang quality</p>
      </div>

      <ul className="divide-y divide-border/70">
        {visible.map((row) => (
          <li
            key={row.id}
            className={cn(
              'flex flex-wrap items-center gap-3 py-3.5 sm:flex-nowrap',
              row.faded && 'opacity-55',
            )}
          >
            <div className="min-w-[7.5rem]">
              <p className="text-sm font-semibold text-ink">{row.dateLabel}</p>
              <p className="font-mono text-xs text-muted">{row.window}</p>
            </div>
            <p className="min-w-0 flex-1 text-sm text-muted">
              {row.meta.split(' · ').slice(0, 2).join(' · ')}
            </p>
            <QualityBars value={row.quality} />
            <Button variant="secondary" size="sm" className="rounded-full" onClick={() => onSave(row)}>
              Save
            </Button>
          </li>
        ))}
      </ul>

      <Card padding="md" tone="gold" className="flex flex-col gap-3 border-copper/35 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge tone="gold" mono className="w-fit">
            <Lock className="mr-1 size-3" aria-hidden />
            Premium
          </Badge>
          <h3 className="mt-2 text-sub font-semibold text-ink text-pretty">
            These are generic windows — not matched to your chart
          </h3>
          <p className="mt-1 text-sm text-muted text-pretty">
            Personalised muhurat re-ranks them against your dasha, transits and doshas, and rules out
            days that clash with your chart.
          </p>
        </div>
        <Button variant="primary" size="sm" className="shrink-0 rounded-full" onClick={onUnlock}>
          {isPremium ? 'Match to my chart' : 'Unlock personalised muhurat'}
        </Button>
      </Card>
    </Card>
  )
}

function PersonalisedResultsView({
  purpose,
  rows,
  onChange,
  onSave,
  onHome,
}: {
  purpose: string
  rows: ReturnType<typeof buildPersonalisedMuhuratResults>
  onChange: () => void
  onSave: (row: { dateLabel: string; window: string }) => void
  onHome: () => void
}) {
  const toast = useToast()
  return (
    <Card padding="lg" className="gap-4 border-border/80">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink">
          <span className="font-semibold">{purpose}</span>
          <span className="text-muted"> · matched to </span>
          <span className="inline-flex items-center rounded-full bg-copper/15 px-2.5 py-0.5 text-xs font-medium text-ink">
            Self · 14 Mar 1994 · Patna ▾
          </span>
        </p>
        <Button variant="secondary" size="sm" className="rounded-full" onClick={onChange}>
          Change search
        </Button>
      </div>

      <ul className="divide-y divide-border/70">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center gap-3 py-3.5 sm:flex-nowrap">
            <div className="min-w-[7.5rem]">
              <p className="text-sm font-semibold text-ink">{row.dateLabel}</p>
              <p className="font-mono text-xs text-muted">{row.window}</p>
            </div>
            <p className="min-w-0 flex-1 text-sm text-muted text-pretty">{row.chartNote}</p>
            <QualityBars value={row.quality} />
            <Button variant="secondary" size="sm" className="rounded-full" onClick={() => onSave(row)}>
              Save
            </Button>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() =>
              toast.success('PDF queued', { description: 'Personalised muhurat sheet.' })
            }
          >
            Download as PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            iconLeft={<CalendarPlus className="size-3.5" />}
            onClick={() => toast.success('Added to calendar')}
          >
            Add to calendar
          </Button>
        </div>
        <button
          type="button"
          onClick={onHome}
          className="text-xs text-muted underline-offset-2 hover:underline"
        >
          Two windows from the generic list were ruled out for this chart
        </button>
      </div>
    </Card>
  )
}

function PremiumHomeView({
  locationLabel,
  dayLabel,
  savedCount,
  onPick,
  onCustom,
  onSaved,
  onSeeToday,
}: {
  locationLabel: string
  dayLabel: string
  savedCount: number
  onPick: (id: MuhuratPurposeId) => void
  onCustom: () => void
  onSaved: () => void
  onSeeToday: () => void
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.7fr)]">
      <div className="space-y-4">
        <Card
          padding="md"
          tone="gold"
          className="flex flex-wrap items-center justify-between gap-3 border-copper/35"
        >
          <div>
            <p className="text-sub font-semibold text-ink">
              Today for you — Self · {dayLabel}
            </p>
            <p className="mt-0.5 text-sm text-muted text-pretty">
              Best window 11:48 – 12:36, clear of your Saturn transit — avoid 09:12 – 10:44
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted">
              <MapPin className="size-3" aria-hidden /> {locationLabel}
            </p>
          </div>
          <Button variant="secondary" size="sm" className="rounded-full" onClick={onSeeToday}>
            See all for this day
          </Button>
        </Card>

        <Card padding="lg" className="gap-4 border-border/80">
          <h2 className="text-heading font-semibold text-ink text-pretty">
            What do you need an auspicious time for?
          </h2>
          <div className="space-y-5">
            {MUHURAT_HOME_GROUPS.map((group) => (
              <div key={group.id}>
                <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {group.title}
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onPick(item.id)}
                      className="flex items-center gap-2 rounded-xl border border-border/80 bg-surface-sunken/40 px-3 py-2.5 text-left text-sm text-ink transition hover:border-copper/50"
                    >
                      <span className="size-3.5 shrink-0 rounded-sm bg-border-strong" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onCustom}
            className="w-full rounded-xl border border-border-strong bg-surface-sunken/50 px-4 py-3 text-left text-sm font-medium text-ink transition hover:border-copper/50"
          >
            Something else — custom search
            <span className="mt-0.5 block text-xs font-normal text-muted">
              Opens the same picker, with your chart already attached.
            </span>
          </button>
        </Card>
      </div>

      <aside className="space-y-4">
        <Card padding="md" className="gap-3 border-border/80">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              Saved muhurats ({savedCount})
            </p>
            <button
              type="button"
              onClick={onSaved}
              className="text-xs text-copper underline-offset-2 hover:underline"
            >
              All saved
            </button>
          </div>
          <ul className="space-y-2.5">
            {DEFAULT_SAVED_MUHURATS.filter((s) => !s.past)
              .slice(0, 3)
              .map((s) => (
                <li key={s.id} className="text-sm text-ink">
                  <span className="font-medium">{s.purpose}</span>
                  <span className="text-muted"> · {s.forLabel}</span>
                  <p className="text-xs text-muted">
                    {s.dateLabel} · {s.window}
                  </p>
                </li>
              ))}
          </ul>
        </Card>

        <Card padding="md" className="gap-2 border-border/80">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Recent searches
          </p>
          <ul className="space-y-1.5">
            {MUHURAT_RECENT_SEARCHES.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={onCustom}
                  className="text-sm text-copper underline-offset-2 hover:underline"
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Button variant="primary" size="md" className="w-full rounded-full" to={paths.ask}>
          Ask Cyklos about a date
        </Button>
      </aside>
    </div>
  )
}

function SavedMuhuratsView({
  items,
  filter,
  onFilter,
  onBack,
  onRemind,
  onRemove,
}: {
  items: SavedMuhurat[]
  filter: 'all' | 'self' | 'family' | 'upcoming'
  onFilter: (f: 'all' | 'self' | 'family' | 'upcoming') => void
  onBack: () => void
  onRemind: (item: SavedMuhurat) => void
  onRemove: (id: string) => void
}) {
  const toast = useToast()
  const upcoming = items.filter((s) => !s.past)
  const past = items.filter((s) => s.past)
  const filtered = upcoming.filter((s) => {
    if (filter === 'self') return s.forLabel.toLowerCase().includes('self')
    if (filter === 'family') return !s.forLabel.toLowerCase().includes('self')
    return true
  })

  const chips: { id: typeof filter; label: string }[] = [
    { id: 'all', label: 'All profiles' },
    { id: 'self', label: 'Self' },
    { id: 'family', label: 'Family' },
    { id: 'upcoming', label: 'Upcoming only' },
  ]

  return (
    <Card padding="lg" className="gap-4 border-border/80">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-muted underline-offset-2 hover:underline"
          >
            Back
          </button>
          <h2 className="text-heading font-semibold text-ink">Saved muhurats</h2>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onFilter(c.id)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition',
                filter === c.id
                  ? 'bg-copper text-midnight'
                  : 'border border-border-strong text-muted hover:text-ink',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-border/70">
        {filtered.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-3 py-3.5 sm:flex-nowrap">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">
                {s.purpose}{' '}
                <span className="font-normal text-muted">/ For {s.forLabel}</span>
              </p>
              <p className="text-xs text-muted">
                {s.dateLabel} · {s.window}
              </p>
              <p className="mt-0.5 text-xs text-muted">{s.status}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                iconLeft={<Bell className="size-3.5" />}
                onClick={() => onRemind(s)}
              >
                {s.status.toLowerCase().includes('notification') ? 'Reminded' : 'Remind me'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                onClick={() => toast.info('Opening window')}
              >
                View
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                onClick={() => toast.success('PDF ready')}
              >
                PDF
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                aria-label="Share"
                onClick={() => toast.info('Share link copied')}
              >
                <Share2 className="size-3.5" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                aria-label="Remove"
                onClick={() => onRemove(s.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {filter !== 'upcoming' && past.length > 0 && (
        <div className="pt-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Past
          </p>
          <ul className="mt-2 space-y-2">
            {past.map((s) => (
              <li key={s.id} className="text-sm text-muted">
                {s.purpose} · {s.forLabel} · {s.dateLabel} — {s.status.toLowerCase()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
