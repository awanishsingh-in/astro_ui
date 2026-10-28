import { Download, Home } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { PaidReportBook } from '@/components/reports/PaidReportBook'
import { useToast } from '@/components/feedback/toast-context'
import { useAuth } from '@/auth/auth-context'
import { buildPaidReport } from '@/data/reports-content'
import { reportById } from '@/data/reports-hub'
import { recordDownload } from '@/data/download-history'
import {
  clearReportDraft,
  hasReportUnlocked,
  readReportDraft,
} from '@/onboarding/reports-unlock'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'
import type { BirthDetails } from '@/types/user'
import { normalizeGender } from '@/types/user'

/**
 * Book-style paid report after unlock — flip pages, download, or go home.
 */
export default function ReportViewPage() {
  const { reportId = '' } = useParams<{ reportId: string }>()
  const topic = reportById(reportId)
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const draft = readReportDraft()

  if (!user) return null
  if (!topic) return <Navigate to={paths.reportsRoot} replace />
  if (!hasReportUnlocked(user.id, topic.id)) {
    return <Navigate to={paths.reportForm(topic.id)} replace />
  }

  const details: BirthDetails =
    draft && draft.reportId === topic.id
      ? {
          fullName: draft.name,
          date: draft.date,
          time: draft.time,
          place: {
            label: draft.placeLabel,
            latitude: draft.placeLat,
            longitude: draft.placeLng,
            timeZone: draft.placeTz,
          },
          gender: normalizeGender(draft.gender),
        }
      : user.birthDetails

  const report = buildPaidReport(topic.id, topic.title, details.fullName, details)

  function downloadReport() {
    const lines = [
      report.title,
      `For ${report.personName}`,
      '',
      report.standfirst,
      '',
      ...report.chapters.flatMap((ch) => [ch.title, ch.body, '']),
      report.closing,
    ]
    const filename = `cyklos-report-${topic!.id}.txt`
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    recordDownload({
      kind: 'report',
      title: topic!.title,
      subtitle: `For ${report.personName}`,
      filename,
    })
    toast.success('Download started', {
      description: `${topic!.title} saved to Downloads.`,
    })
  }

  return (
    <PageContainer width="wide" className="pb-16 pt-4 sm:pt-6">
      <article className="relative mx-auto max-w-5xl animate-rise space-y-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-10 size-56 rounded-full bg-primary/8 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 top-24 size-48 rounded-full bg-secondary/20 blur-3xl"
        />

        <header className="relative flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-info">
              <span className="size-1.5 rounded-full bg-info shadow-[0_0_10px_var(--color-info)]" />
              Unlocked · ready to read
            </p>
            <h1 className="bg-gradient-to-r from-white via-accent to-primary bg-clip-text font-serif text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
              {report.title}
            </h1>
          </div>
          <p className="rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-semibold text-silver-300">
            For {report.personName}
          </p>
        </header>

        <PaidReportBook report={report} />

        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            variant="secondary"
            size="lg"
            className="w-full rounded-full shadow-[0_16px_36px_-14px_rgba(201,145,115,0.55)] sm:flex-1"
            iconLeft={<Download className="size-4" />}
            onClick={downloadReport}
          >
            Download report
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full rounded-full sm:flex-1"
            iconLeft={<Home className="size-4" />}
            onClick={() => {
              clearReportDraft()
              navigate(paths.ask)
            }}
          >
            Go to home page
          </Button>
        </div>
      </article>
    </PageContainer>
  )
}
