import type { TabsController } from '@/components/common/Tabs'
import { ChartProfilePicker } from '@/components/charts/ChartProfilePicker'
import type { ChartProfile } from '@/data/profiles'
import { cn } from '@/utils/cn'

const TABS = [
  { id: 'chart', label: 'Chart' },
  { id: 'yoga', label: 'Yoga & Dosha' },
  { id: 'dasha', label: 'Dasha' },
  { id: 'planets', label: 'Planets' },
  { id: 'vargas', label: 'Vargas' },
  { id: 'transits', label: 'Transits' },
  { id: 'strength', label: 'Strength' },
] as const

export type ChartNavTabId = (typeof TABS)[number]['id']

export const CHART_NAV_TABS = TABS.map((t) => ({ id: t.id, label: t.label }))

export interface ChartNavRailProps {
  controller: TabsController
  profiles: ChartProfile[]
  profileId: string
  onSelectProfile: (profile: ChartProfile) => void
  className?: string
}

/**
 * Top of My Chart — text tabs (gold underline when active) + profile switcher.
 * Solid gold is reserved for primary CTAs, not section chrome.
 */
export function ChartNavRail({
  controller,
  profiles,
  profileId,
  onSelectProfile,
  className,
}: ChartNavRailProps) {
  const { idPrefix, value, setValue } = controller

  return (
    <div
      className={cn(
        'sticky top-0 z-20 -mx-1 rounded-2xl border border-border/60',
        'bg-surface/95 px-2 py-2 shadow-card backdrop-blur-xl sm:mx-0 sm:px-3',
        className,
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div
          role="tablist"
          aria-label="My chart sections"
          className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-0.5"
        >
          {TABS.map((tab) => {
            const active = tab.id === value
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`${idPrefix}-${tab.id}`}
                aria-selected={active}
                aria-controls={`${idPrefix}-${tab.id}-panel`}
                tabIndex={active ? 0 : -1}
                onClick={() => setValue(tab.id)}
                className={cn(
                  'relative shrink-0 px-3.5 py-2 text-sm transition-colors duration-200',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]',
                  active
                    ? 'font-semibold text-text'
                    : 'font-medium text-silver-400 hover:text-text',
                )}
              >
                {tab.label}
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-2.5 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-[#f3d9c4] via-[#bf8466] to-[#9e6650] shadow-[0_0_14px_rgba(201,145,115,0.45)]"
                  />
                )}
              </button>
            )
          })}
        </div>

        <ChartProfilePicker
          profiles={profiles}
          selectedId={profileId}
          onSelect={onSelectProfile}
          className="shrink-0"
        />
      </div>
    </div>
  )
}
