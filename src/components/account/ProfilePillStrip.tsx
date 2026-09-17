import { Pencil, Plus } from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'
import type { ChartProfile } from '@/data/profiles'
import { cn } from '@/utils/cn'

export interface ProfilePillStripProps {
  profiles: ChartProfile[]
  selectedId: string
  /** Photo for the primary (self) profile, when available. */
  selfPhotoUrl?: string | null
  onSelect: (profile: ChartProfile) => void
  onEdit: (profile: ChartProfile) => void
  onAdd: () => void
  /** Briefly highlight the add control (e.g. after navigating from the menu). */
  highlightAdd?: boolean
  /** Tighter chrome variant for the top bar. */
  compact?: boolean
  /** Hide existing profile pills — only the dashed + (e.g. while Add form is open). */
  hideProfiles?: boolean
  className?: string
}

/**
 * Horizontal profile switcher — pill for each saved person, dashed + to add.
 * Matches the compact “whose chart” pattern without leaving Cyklos chrome.
 */
export function ProfilePillStrip({
  profiles,
  selectedId,
  selfPhotoUrl,
  onSelect,
  onEdit,
  onAdd,
  highlightAdd = false,
  compact = false,
  hideProfiles = false,
  className,
}: ProfilePillStripProps) {
  return (
    <div
      className={cn(
        'flex items-center overflow-x-auto overscroll-x-contain no-scrollbar',
        compact ? 'gap-2 pb-0' : 'gap-2.5 pb-1',
        className,
      )}
      role="list"
      aria-label="Profiles"
    >
      {!hideProfiles &&
        profiles.map((profile) => {
        const active = profile.id === selectedId
        const isSelf = profile.id === 'self'
        return (
          <div
            key={profile.id}
            role="listitem"
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full border',
              'transition-[border-color,background-color,box-shadow] duration-150',
              compact ? 'py-1 pl-1 pr-2' : 'py-1.5 pl-1.5 pr-2.5',
              active
                ? 'border-copper/55 bg-copper/15 shadow-[0_0_20px_-10px_rgba(232,168,78,0.55)]'
                : 'border-border bg-surface/80 hover:border-copper/35 hover:bg-navy-soft/60',
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(profile)}
              className="inline-flex min-w-0 items-center gap-2 text-left"
              aria-current={active ? 'true' : undefined}
            >
              <Avatar
                name={profile.name}
                src={isSelf ? selfPhotoUrl : undefined}
                size="sm"
                className={cn(active && 'border-copper/40', compact && 'size-7 text-[10px]')}
              />
              <span
                className={cn(
                  'truncate font-medium',
                  compact ? 'max-w-[6.5rem] text-xs sm:max-w-[8rem] sm:text-sm' : 'max-w-[7.5rem] text-sm',
                  active ? 'text-ink' : 'text-purple',
                )}
              >
                {profile.name}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onEdit(profile)}
              aria-label={`Edit ${profile.name}`}
              className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-full',
                'text-muted transition-colors hover:bg-navy-soft hover:text-ink',
                compact ? 'size-6' : 'size-7',
              )}
            >
              <Pencil className={compact ? 'size-3' : 'size-3.5'} aria-hidden />
            </button>
          </div>
        )
      })}

      <button
        type="button"
        onClick={onAdd}
        aria-label="Add profile"
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full',
          'border border-dashed border-border-strong text-muted',
          'transition-[border-color,color,background-color,box-shadow] duration-150',
          'hover:border-copper/50 hover:bg-copper/10 hover:text-copper',
          compact ? 'size-9' : 'size-11',
          highlightAdd &&
            'border-copper/60 text-copper shadow-[0_0_22px_-8px_rgba(232,168,78,0.65)]',
        )}
      >
        <Plus className={compact ? 'size-4' : 'size-5'} strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  )
}
