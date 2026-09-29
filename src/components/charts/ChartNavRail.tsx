import type { TabsController } from '@/components/common/Tabs'
import { ChartProfilePicker } from '@/components/charts/ChartProfilePicker'
import type { ChartProfile } from '@/data/profiles'
import { cn } from '@/utils/cn'

const TABS = [
  { id: 'basic', label: 'Basic' },
  { id: 'charts', label: 'Charts' },
  { id: 'planets', label: 'Planets' },
  { id: 'kp', label: 'KP' },
  { id: 'ashtakavarga', label: 'Ashtakvarga' },
  { id: 'dasha', label: 'Dasha' },
  { id: 'report', label: 'Report' },
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
 * Top of My Chart — copper pill tabs + compact profile switcher.
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
        'bg-surface/85 px-2 py-2 shadow-[0_12px_32px_-24px_rgba(20,12,8,0.7)] backdrop-blur-xl sm:mx-0 sm:px-3',
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
                  'relative shrink-0 rounded-full px-3.5 py-2 text-sm transition-all duration-200',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper',
                  active
                    ? 'bg-copper/20 font-semibold text-copper shadow-[inset_0_0_0_1px_rgba(196, 160, 255,0.45)]'
                    : 'font-medium text-muted hover:bg-navy-soft/60 hover:text-ink',
                )}
              >
                {tab.label}
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-copper/80"
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
