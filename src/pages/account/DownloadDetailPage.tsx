import {
  ArrowLeft,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  Sparkles,
} from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { useToast } from '@/components/feedback/toast-context'
import {
  downloadFileExtension,
  downloadKindDescription,
  downloadKindLabel,
  getDownloadById,
  openHistoryFile,
  type DownloadKind,
} from '@/data/download-history'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'
import { formatDateShort } from '@/utils/format'
import { cn } from '@/utils/cn'

const KIND_TONE: Record<DownloadKind, string> = {
  kundali: 'from-primary/25 via-surface to-surface-raised',
  panchang: 'from-info/20 via-surface to-surface-raised',
  report: 'from-accent/20 via-surface to-surface-raised',
  calendar: 'from-success/20 via-surface to-surface-raised',
  muhurat: 'from-warning/20 via-surface to-surface-raised',
  other: 'from-border/40 via-surface to-surface-raised',
}

/**
 * Full-page detail for one item from Account → Downloads history.
 */
export default function DownloadDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const item = useMemo(() => getDownloadById(id), [id])

  function goBackToHistory() {
    navigate(paths.downloads)
  }

  if (!item) {
    return (
      <PageContainer width="content" className="py-10">
        <EmptyState
          title="Download not found"
          description="That file is not in your history anymore — or the link is incomplete."
          action={
            <Button variant="secondary" onClick={goBackToHistory}>
              Back to Downloads
            </Button>
          }
        />
      </PageContainer>
    )
  }

  const savedOn = formatDateShort(item.createdAt.slice(0, 10))
  const ext = downloadFileExtension(item)
  const kindLabel = downloadKindLabel(item.kind)

  function handleOpen() {
    const result = openHistoryFile(item)
    toast.success(result === 'opened' ? 'Opening file' : 'Download started', {
      description: item.filename,
    })
  }

  function handleDownloadAgain() {
    const result = openHistoryFile(item)
    toast.success(result === 'downloaded' ? 'Download started' : 'File ready', {
      description: item.filename,
    })
  }

  return (
    <PageContainer width="reading" className="space-y-6 py-6 pb-24 sm:py-8">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={goBackToHistory}
          className={cn(
            'inline-flex size-10 items-center justify-center rounded-full',
            'border border-border bg-surface text-text-secondary',
            'transition hover:border-primary/40 hover:text-silver-300',
          )}
          aria-label="Back to Downloads"
        >
          <ArrowLeft className="size-5" strokeWidth={2} />
        </button>
        <p className="font-mono text-label uppercase tracking-[0.14em] text-text-secondary">
          Downloads
        </p>
      </div>

      <article
        className={cn(
          'relative overflow-hidden rounded-[1.5rem] border border-primary/30',
          'bg-gradient-to-br shadow-raised',
          KIND_TONE[item.kind],
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-10 size-40 rounded-full bg-accent/10 blur-3xl"
        />

        <div className="relative space-y-5 p-5 sm:p-7">
          <div className="flex flex-wrap items-start gap-4">
            <span
              className={cn(
                'inline-flex size-14 shrink-0 items-center justify-center rounded-2xl',
                'border border-primary/40 bg-primary/15 text-silver-300',
                'shadow-[0_0_28px_-8px_rgba(201,145,115,0.55)]',
              )}
            >
              <FileText className="size-7" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="gold" mono>
                  {kindLabel}
                </Badge>
                <Badge tone="neutral" mono>
                  {ext}
                </Badge>
              </div>
              <h1 className="font-serif text-title text-text text-balance sm:text-title-lg">
                {item.title}
              </h1>
              <p className="text-sub text-text-secondary text-pretty">{item.subtitle}</p>
            </div>
          </div>

          <p className="text-sm text-text-muted text-pretty">
            {downloadKindDescription(item.kind)}
          </p>

          <dl className="grid gap-3 rounded-card border border-border/80 bg-bg/50 p-4 sm:grid-cols-2">
            <DetailCell
              label="Saved on"
              value={savedOn}
              icon={<Calendar className="size-3.5" aria-hidden />}
            />
            <DetailCell label="Type" value={kindLabel} />
            <DetailCell label="Format" value={ext} />
            <DetailCell label="Filename" value={item.filename} mono className="sm:col-span-2" />
          </dl>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              fullWidth
              size="lg"
              onClick={handleOpen}
              iconLeft={<ExternalLink className="size-4" />}
              className="sm:flex-1"
            >
              Open file
            </Button>
            <Button
              fullWidth
              size="lg"
              variant="ghost"
              onClick={handleDownloadAgain}
              iconLeft={<Download className="size-4" />}
              className="sm:flex-1"
            >
              Download again
            </Button>
          </div>

          <p className="flex items-start gap-2 text-xs text-text-muted text-pretty">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-silver-300" aria-hidden />
            Demo files reopen from your history. Live Cyklos ships the full PDF / calendar payload.
          </p>
        </div>
      </article>

      <p className="text-center text-sm text-text-muted">
        <Link
          to={paths.downloads}
          className="font-semibold text-silver-300 underline-offset-2 hover:underline"
        >
          See all downloads
        </Link>
      </p>
    </PageContainer>
  )
}

function DetailCell({
  label,
  value,
  icon,
  mono,
  className,
}: {
  label: string
  value: string
  icon?: ReactNode
  mono?: boolean
  className?: string
}) {
  return (
    <div className={cn('min-w-0 space-y-1', className)}>
      <dt className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary">
        {icon}
        {label}
      </dt>
      <dd
        className={cn(
          'truncate text-sm font-medium text-text',
          mono && 'font-mono text-xs tracking-wide text-text-secondary',
        )}
      >
        {value}
      </dd>
    </div>
  )
}
