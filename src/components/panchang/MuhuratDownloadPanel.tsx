import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/forms/Input'
import { Modal } from '@/components/modals/Modal'
import { MUHURAT_DOWNLOAD_OPTIONS } from '@/data/muhurat-plans'
import type { MuhuratPurposeId } from '@/data/panchang-mock'
import { cn } from '@/utils/cn'

/**
 * Centered modal — pick a listed muhurat or type a custom purpose to download.
 */
export function MuhuratDownloadPanel({
  isOpen,
  onClose,
  planLabel,
  onDownload,
}: {
  isOpen: boolean
  onClose: () => void
  planLabel: string
  onDownload: (id: MuhuratPurposeId, label: string) => void
}) {
  const [custom, setCustom] = useState('')

  useEffect(() => {
    if (!isOpen) setCustom('')
  }, [isOpen])

  const groups = MUHURAT_DOWNLOAD_OPTIONS.reduce<Record<string, typeof MUHURAT_DOWNLOAD_OPTIONS>>(
    (acc, item) => {
      ;(acc[item.group] ??= []).push(item)
      return acc
    },
    {},
  )

  const customLabel = custom.trim()

  function handleCustomDownload() {
    if (!customLabel) return
    onDownload('other', customLabel)
    setCustom('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Download muhurat"
      description={planLabel}
      size="md"
      footer={
        <div className="w-full">
          <Button variant="secondary" size="md" fullWidth className="rounded-full" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Your own purpose
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="e.g. Sister’s wedding, shop opening…"
              inputSize="md"
              tone="sunken"
              className="min-w-0 flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCustomDownload()
                }
              }}
              aria-label="Custom muhurat purpose"
            />
            <Button
              variant="primary"
              size="md"
              className="shrink-0 rounded-full"
              disabled={!customLabel}
              onClick={handleCustomDownload}
            >
              Download
            </Button>
          </div>
        </div>

        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              {group}
            </p>
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onDownload(item.id, item.label)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border border-border/80 bg-surface-sunken/40 px-3 py-3 text-left',
                      'transition hover:border-copper/45 hover:bg-copper/10',
                    )}
                  >
                    <span
                      aria-hidden
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-copper/30 bg-copper/15 text-silver-300"
                    >
                      <Download className="size-4" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-semibold text-ink">
                      {item.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Modal>
  )
}
