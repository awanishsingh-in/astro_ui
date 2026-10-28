import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, FileText } from 'lucide-react'
import { Badge } from '@/components/common/Badge'
import { Card } from '@/components/common/Card'
import {
  DOWNLOAD_RECORDED_EVENT,
  downloadKindLabel,
  loadDownloadHistory,
  type DownloadHistoryItem,
} from '@/data/download-history'
import { paths } from '@/routes/paths'
import { formatDateShort } from '@/utils/format'

/**
 * Account → Downloads: history of files taken across Cyklos.
 * Tap a row to open the download detail page.
 */
export function DownloadHistoryPanel() {
  const [history, setHistory] = useState(() => loadDownloadHistory())

  useEffect(() => {
    const refresh = () => setHistory(loadDownloadHistory())
    refresh()
    window.addEventListener(DOWNLOAD_RECORDED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(DOWNLOAD_RECORDED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sub font-semibold text-ink">Download history</p>
        <p className="mt-0.5 text-xs text-muted text-pretty">
          Everything you download in Cyklos lands here — kundali, panchang, muhurat, reports, and
          calendar files. Tap a file for details.
        </p>
      </div>

      {history.length === 0 ? (
        <Card padding="md" className="border-dashed border-border/80">
          <p className="text-sm text-muted text-pretty">
            No downloads yet. Files you download from My Chart, matching, reports, panchang, or
            calendar will show up here.
          </p>
        </Card>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
          {history.map((item) => (
            <HistoryRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  )
}

function HistoryRow({ item }: { item: DownloadHistoryItem }) {
  return (
    <li>
      <Link
        to={paths.downloadDetail(item.id)}
        className="flex w-full items-start gap-3 px-3.5 py-3.5 text-left transition-colors hover:bg-primary/10 sm:px-4"
      >
        <span
          aria-hidden
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-control border border-primary/30 bg-primary/10 text-silver-300"
        >
          <FileText className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
            <Badge tone="neutral" mono className="shrink-0">
              {downloadKindLabel(item.kind)}
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-xs text-text-secondary">{item.subtitle}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
            {formatDateShort(item.createdAt.slice(0, 10))} · {item.filename}
          </p>
        </div>
        <ChevronRight className="mt-1 size-4 shrink-0 text-text-muted" aria-hidden />
      </Link>
    </li>
  )
}
