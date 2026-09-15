import { Check, ChevronDown, Plus } from 'lucide-react'
import { useMemo } from 'react'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/Badge'
import { useToast } from '@/components/feedback/toast-context'
import { Modal } from '@/components/modals/Modal'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { buildChart } from '@/data/chart-mock'
import { chartSeedFor, RELATION_LABEL, RELATION_ORDER, type ChartProfile } from '@/data/profiles'
import { cn } from '@/utils/cn'
import { rashiGlyph } from '@/utils/astro'
import { formatDateShort, formatTime12 } from '@/utils/format'

export interface ChartProfilePickerProps {
  profiles: ChartProfile[]
  selectedId: string
  onSelect: (profile: ChartProfile) => void
  /** `button` is the header control; `list` renders inline in the desktop rail. */
  variant?: 'button' | 'list'
  className?: string
}

/**
 * Whose chart is on screen.
 *
 * Never a page: a bottom sheet on mobile, a centred modal on desktop — the
 * dashboard stays put underneath either way.
 */
export function ChartProfilePicker({
  profiles,
  selectedId,
  onSelect,
  variant = 'button',
  className,
}: ChartProfilePickerProps) {
  const picker = useDisclosure()
  const isDesktop = useIsDesktop()
  const toast = useToast()

  const selected = profiles.find((p) => p.id === selectedId) ?? profiles[0]

  const choose = (profile: ChartProfile) => {
    onSelect(profile)
    picker.close()
  }

  const grouped = RELATION_ORDER.map((relation) => ({
    relation,
    label: RELATION_LABEL[relation],
    items: profiles.filter((p) => p.relation === relation),
  })).filter((group) => group.items.length > 0)

  /*
    Each saved chart is identified by its own lagna, not just a name and a
    date — which is how an astrologer tells two charts apart. Computed once per
    profile list: `buildChart` is deterministic on the seed, so this is a table
    lookup in all but name.
  */
  const lagnaOf = useMemo(() => {
    const map: Record<string, string> = {}
    for (const profile of profiles) {
      map[profile.id] = buildChart(chartSeedFor(profile), 'D1').lagna.rashi
    }
    return map
  }, [profiles])

  const list = (
    <div className="space-y-5">
      {grouped.map((group) => (
        <section key={group.relation} className="space-y-2">
          <h3 className="font-mono text-label uppercase text-muted">{group.label}</h3>
          <ul className="space-y-2">
            {group.items.map((profile) => {
              const active = profile.id === selectedId
              return (
                <li key={profile.id}>
                  <button
                    type="button"
                    onClick={() => choose(profile)}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'flex min-h-14 w-full items-center gap-3 rounded-card border p-3 text-left',
                      'transition-[border-color,background-color,transform] duration-150 ease-out-soft',
                      'active:scale-[0.99]',
                      active
                        ? 'border-gold bg-gold-soft'
                        : 'border-border bg-surface hover:border-border-strong hover:bg-navy-soft',
                    )}
                  >
                    {/* The avatar carries the chart's lagna in its corner. */}
                    <span className="relative shrink-0">
                      <Avatar name={profile.name} size="md" />
                      <span
                        aria-hidden
                        className={cn(
                          'absolute -right-1 -bottom-1 inline-grid size-5 place-items-center',
                          'rounded-full border text-[10px] leading-none',
                          active
                            ? 'border-gold bg-gold-soft text-gold-deep'
                            : 'border-border-strong bg-surface text-gold',
                        )}
                      >
                        {rashiGlyph(lagnaOf[profile.id] as never)}
                      </span>
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sub font-medium text-ink">
                        {profile.name}
                      </span>
                      <span className="block truncate font-mono text-label uppercase text-muted">
                        <span className="text-gold-deep">{lagnaOf[profile.id]}</span>
                        {' · '}
                        {formatDateShort(profile.birthDetails.date)}
                        {' · '}
                        {profile.birthDetails.timeUnknown
                          ? 'time unknown'
                          : formatTime12(profile.birthDetails.time)}
                      </span>
                      {profile.note && (
                        <span className="block truncate text-xs text-muted">{profile.note}</span>
                      )}
                    </span>
                    {active && <Check aria-hidden className="size-4 shrink-0 text-gold-deep" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      <button
        type="button"
        onClick={() => {
          picker.close()
          toast.info('Adding a profile is not built yet', {
            description: 'Family, friends and colleagues are on the roadmap for saved charts.',
          })
        }}
        className={cn(
          'flex w-full items-center gap-3 rounded-card border border-dashed border-border-strong p-3',
          'text-sub font-medium text-navy transition-colors hover:bg-navy-soft',
        )}
      >
        <span
          aria-hidden
          className="inline-flex size-9 items-center justify-center rounded-full bg-navy-soft"
        >
          <Plus className="size-4" />
        </span>
        Add a chart
      </button>
    </div>
  )

  const trigger =
    variant === 'list' ? null : (
      <button
        type="button"
        onClick={picker.open}
        aria-haspopup="dialog"
        aria-expanded={picker.isOpen}
        className={cn(
          'inline-flex min-h-11 max-w-[9.5rem] items-center gap-1.5 rounded-control',
          'border border-border bg-surface px-3 py-2 text-sm font-medium text-ink',
          'transition-[background-color,border-color,transform] duration-150 ease-out-soft',
          'hover:border-border-strong hover:bg-navy-soft active:scale-[0.98] lg:max-w-none',
          className,
        )}
      >
        <span className="truncate">{selected?.name}</span>
        <ChevronDown aria-hidden className="size-4 shrink-0 text-muted" />
      </button>
    )

  return (
    <>
      {variant === 'list' ? (
        <div className={className}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-mono text-label uppercase text-muted">Charts</h2>
            <Badge tone="neutral" mono>
              {profiles.length}
            </Badge>
          </div>
          {list}
        </div>
      ) : (
        trigger
      )}

      {variant !== 'list' &&
        (isDesktop ? (
          <Modal
            isOpen={picker.isOpen}
            onClose={picker.close}
            title="Whose chart?"
            description="Your own, and anyone you have saved."
            size="sm"
          >
            {list}
          </Modal>
        ) : (
          <BottomSheet
            isOpen={picker.isOpen}
            onClose={picker.close}
            title="Whose chart?"
            description="Your own, and anyone you have saved."
          >
            {list}
          </BottomSheet>
        ))}
    </>
  )
}
