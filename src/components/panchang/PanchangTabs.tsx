import { cn } from '@/utils/cn'

export type PanchangTabId =
  | 'today'
  | 'tithi'
  | 'timings'
  | 'muhurat'
  | 'downloads'
  | 'alerts'

export type TimingsSubId = 'choghadiya' | 'hora' | 'rahu'

export const PANCHANG_TABS: { id: PanchangTabId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'tithi', label: 'Tithi & nakshatra' },
  { id: 'timings', label: 'Timings' },
  { id: 'muhurat', label: 'Muhurat' },
  { id: 'downloads', label: 'Downloads' },
  { id: 'alerts', label: 'Alerts' },
]

export const TIMINGS_SUBS: { id: TimingsSubId; label: string }[] = [
  { id: 'choghadiya', label: 'Choghadiya' },
  { id: 'hora', label: 'Hora' },
  { id: 'rahu', label: 'Rahu kaal & doshas' },
]

export function PanchangTabs({
  active,
  onChange,
}: {
  active: PanchangTabId
  onChange: (id: PanchangTabId) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Panchang sections"
      className="flex flex-wrap gap-1 rounded-full border border-border/80 bg-surface-sunken/60 p-1.5"
    >
      {PANCHANG_TABS.map((tab) => {
        const selected = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              selected
                ? 'bg-copper text-midnight shadow-sm'
                : 'text-muted hover:bg-navy-soft hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export function TimingsSubTabs({
  active,
  onChange,
}: {
  active: TimingsSubId
  onChange: (id: TimingsSubId) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Timings">
      {TIMINGS_SUBS.map((tab) => {
        const selected = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              selected
                ? 'border-copper/50 bg-copper/15 text-ink'
                : 'border-border text-muted hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
