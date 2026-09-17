import { FolderHeart, Heart, Home, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Modal } from '@/components/modals/Modal'
import {
  ADDABLE_RELATIONS,
  RELATION_LABEL,
  type ProfileRelation,
} from '@/data/profiles'
import { cn } from '@/utils/cn'

const FOLDER_META: Record<
  Exclude<ProfileRelation, 'self'>,
  { icon: LucideIcon; hint: string }
> = {
  family: { icon: Home, hint: 'Parents, siblings, partner' },
  friend: { icon: Heart, hint: 'Friends whose chart you read' },
  relative: { icon: FolderHeart, hint: 'Extended family and kin' },
  other: { icon: Users, hint: 'Colleague, client, anyone else' },
}

export interface AddProfileFoldersProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (relation: Exclude<ProfileRelation, 'self'>) => void
}

function FolderGrid({
  onSelect,
}: {
  onSelect: (relation: Exclude<ProfileRelation, 'self'>) => void
}) {
  return (
    <ul
      className="mx-auto grid w-full max-w-5xl grid-cols-4 gap-3 sm:gap-4"
      role="listbox"
      aria-label="Profile folders"
    >
      {ADDABLE_RELATIONS.map((relation) => {
        const meta = FOLDER_META[relation]
        const Icon = meta.icon
        return (
          <li key={relation} className="min-w-0">
            <button
              type="button"
              role="option"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onSelect(relation)
              }}
              className={cn(
                'flex h-full min-h-[15rem] w-full flex-col items-center justify-center gap-5 rounded-card border border-border',
                'bg-surface/90 px-3 py-6 text-center transition-[border-color,background-color,box-shadow]',
                'hover:border-copper/45 hover:bg-copper/10 hover:shadow-[0_0_28px_-10px_rgba(220,132,79,0.5)]',
                'active:scale-[0.99] sm:min-h-[17.5rem] sm:gap-6 sm:px-4 sm:py-8',
              )}
            >
              <span
                aria-hidden
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-control border border-border bg-surface-sunken text-gold-deep sm:size-14"
              >
                <Icon className="size-6 sm:size-7" strokeWidth={1.75} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink sm:text-heading">
                  {RELATION_LABEL[relation]}
                </span>
                <span className="mt-1.5 block text-xs leading-snug text-muted text-pretty sm:text-sm">
                  {meta.hint}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * First step of Add profile — pick a folder (Family / Friend / Relative / Other).
 * Four tall folders in one centered row.
 */
export function AddProfileFolders({ isOpen, onClose, onSelect }: AddProfileFoldersProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add profile"
      description="Choose a folder for this chart."
      size="lg"
      className="mx-auto w-full max-w-5xl translate-x-6 sm:translate-x-8 lg:translate-x-12"
    >
      <FolderGrid onSelect={onSelect} />
    </Modal>
  )
}
