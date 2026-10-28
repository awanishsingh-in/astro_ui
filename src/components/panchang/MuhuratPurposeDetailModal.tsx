import { BookmarkPlus, Download } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/modals/Modal'
import {
  buildPersonalisedMuhuratResults,
  type MuhuratPurposeId,
} from '@/data/panchang-mock'
import { cn } from '@/utils/cn'

export interface MuhuratPurposeSelection {
  id: MuhuratPurposeId
  label: string
  group?: string
}

/**
 * Detail sheet for a chosen purpose — windows, notes, then Download / Save.
 */
export function MuhuratPurposeDetailModal({
  isOpen,
  onClose,
  purpose,
  dateIso,
  location,
  onDownload,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  purpose: MuhuratPurposeSelection | null
  dateIso: string
  location?: string
  onDownload: (id: MuhuratPurposeId, label: string) => void
  onSave: (id: MuhuratPurposeId, label: string) => void
}) {
  if (!purpose) return null

  const rows = buildPersonalisedMuhuratResults()
  const dateLabel = new Date(`${dateIso}T12:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const place = location?.trim() || 'your city'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={purpose.label}
      description={`${purpose.group ? `${purpose.group} · ` : ''}${place} · ${dateLabel}`}
      size="lg"
      closeMode="button"
      className="max-h-[min(92dvh,100%)] min-h-[min(70dvh,36rem)]"
      footer={
        <div className="grid w-full grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="md"
            className="rounded-full"
            iconLeft={<BookmarkPlus className="size-4" aria-hidden />}
            onClick={() => onSave(purpose.id, purpose.label)}
          >
            Save
          </Button>
          <Button
            variant="primary"
            size="md"
            className="rounded-full"
            iconLeft={<Download className="size-4" aria-hidden />}
            onClick={() => onDownload(purpose.id, purpose.label)}
          >
            Download
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-muted text-pretty">
          Best windows for <span className="font-semibold text-ink">{purpose.label}</span> in{' '}
          <span className="font-semibold text-ink">{place}</span> around{' '}
          <span className="font-semibold text-ink">{dateLabel}</span>, ranked for your birth
          chart.
        </p>

        <ul className="divide-y divide-border/70 rounded-2xl border border-border/80 bg-surface-sunken/30">
          {rows.map((row, index) => (
            <li
              key={row.id}
              className={cn(
                'flex flex-col gap-1.5 px-4 py-3.5 sm:flex-row sm:items-start sm:gap-4',
                index === 0 && 'bg-copper/10',
              )}
            >
              <div className="min-w-[7.5rem] shrink-0">
                <p className="text-sm font-semibold text-ink">{row.dateLabel}</p>
                <p className="font-mono text-xs text-silver-300">{row.window}</p>
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm text-muted">{row.meta}</p>
                {row.chartNote && (
                  <p className="text-xs text-ink/90 text-pretty">{row.chartNote}</p>
                )}
              </div>
              <span
                className="inline-flex shrink-0 items-center gap-0.5 self-start font-mono text-[10px] uppercase tracking-wider text-muted"
                aria-label={`Quality ${row.quality} of 5`}
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={cn(
                      'inline-block size-1.5 rounded-full',
                      i < row.quality ? 'bg-copper' : 'bg-border-strong',
                    )}
                  />
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  )
}
