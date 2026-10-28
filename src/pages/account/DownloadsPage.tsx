import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { DownloadHistoryPanel } from '@/components/account/DownloadHistoryPanel'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'

/**
 * Full-page download history — Account menu → Downloads.
 * Tap a row to open the detail page.
 */
export default function DownloadsPage() {
  return (
    <PageContainer width="reading" className="space-y-6 py-6 pb-24 sm:py-8">
      <div className="flex items-start gap-3">
        <Link
          to={paths.ask}
          className={cn(
            'inline-flex size-10 shrink-0 items-center justify-center rounded-full',
            'border border-border bg-surface text-text-secondary',
            'transition hover:border-primary/40 hover:text-silver-300',
          )}
          aria-label="Back to Ask"
        >
          <ArrowLeft className="size-5" strokeWidth={2} />
        </Link>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-mono text-label uppercase tracking-[0.14em] text-text-secondary">
            Account
          </p>
          <h1 className="font-serif text-title text-text text-balance sm:text-title-lg">
            Downloads
          </h1>
          <p className="text-sub text-text-secondary text-pretty">
            Your download history across Cyklos — tap a file to open details.
          </p>
        </div>
      </div>

      <DownloadHistoryPanel />
    </PageContainer>
  )
}
