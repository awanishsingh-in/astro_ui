import { Check, ChevronDown, Plus } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/modals/Modal'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { buildChart } from '@/data/chart-mock'
import { chartSeedFor, RELATION_LABEL, RELATION_ORDER, type ChartProfile } from '@/data/profiles'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'
import { rashiGlyph } from '@/utils/astro'
import { formatDateShort, formatTime12 } from '@/utils/format'

export interface ChartProfilePickerProps {
  profiles: ChartProfile[]
  selectedId: string
  onSelect: (profile: ChartProfile) => void
  /** Opens Add Profile — typically navigate to /profile or open a sheet. */
  onAdd?: () => void
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
  onAdd,
  variant = 'button',
  className,
}: ChartProfilePickerProps) {
  const picker = useDisclosure()
  const isDesktop = useIsDesktop()
  const navigate = useNavigate()

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
    <div className="space-y-4">
      {grouped.map((group) => (
        <section key={group.relation} className="space-y-2">
          <h3 className="px-0.5 font-mono text-label uppercase tracking-[0.12em] text-faint">
            {group.label}
          </h3>
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
                      'transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out-soft',
                      'active:scale-[0.99]',
                      active
                        ? 'border-copper/55 bg-copper/12 shadow-[0_0_24px_-12px_rgba(232,168,78,0.55)]'
                        : 'border-border bg-surface/90 hover:border-border-strong hover:bg-navy-soft/80',
                    )}
                  >
                    <span className="relative shrink-0">
                      <Avatar name={profile.name} size="md" />
                      <span
                        aria-hidden
                        className={cn(
                          'absolute -right-1 -bottom-1 inline-grid size-5 place-items-center',
                          'rounded-full border text-[10px] leading-none',
                          active
                            ? 'border-copper/50 bg-copper/20 text-gold-deep'
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
          if (onAdd) {
            onAdd()
            return
          }
          navigate(`${paths.profile}?add=1`)
        }}
        className={cn(
          'flex w-full items-center gap-3 rounded-card border border-dashed border-copper/40 p-3',
          'text-sub font-medium text-copper transition-colors',
          'hover:border-copper/60 hover:bg-copper/10',
        )}
      >
        <span
          aria-hidden
          className="inline-flex size-9 items-center justify-center rounded-full border border-copper/30 bg-copper/15"
        >
          <Plus className="size-4" />
        </span>
        Add a profile
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
        <div
          className={cn(
            'rounded-panel border border-border/80 bg-surface/75 p-3.5 shadow-card backdrop-blur-sm',
            className,
          )}
        >
          <div className="mb-3.5 flex items-center justify-between gap-2 px-0.5">
            <div>
              <h2 className="font-mono text-label uppercase tracking-[0.14em] text-muted">Charts</h2>
              <p className="mt-0.5 text-xs text-faint">Whose kundli is on screen</p>
            </div>
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
