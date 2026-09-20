import { cn } from '@/utils/cn'

export type CalendarViewId = 'month' | 'festivals' | 'vrats' | 'hindu'

export const CALENDAR_VIEWS: { id: CalendarViewId; label: string }[] = [
  { id: 'month', label: 'Month' },
  { id: 'festivals', label: 'Festivals' },
  { id: 'vrats', label: 'Vrat & Fasts' },
  { id: 'hindu', label: 'Hindu calendar' },
]

export function CalendarViewTabs({
  active,
  onChange,
}: {
  active: CalendarViewId
  onChange: (id: CalendarViewId) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Calendar views"
      className="flex flex-wrap gap-1 rounded-full border border-border/80 bg-surface-sunken/60 p-1.5"
    >
      {CALENDAR_VIEWS.map((view) => {
        const selected = view.id === active
        return (
          <button
            key={view.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(view.id)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              selected
                ? 'bg-copper text-midnight shadow-sm'
                : 'text-muted hover:bg-navy-soft hover:text-ink',
            )}
          >
            {view.label}
          </button>
        )
      })}
    </div>
  )
}
