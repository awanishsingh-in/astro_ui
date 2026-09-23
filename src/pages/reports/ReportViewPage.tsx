import { Download, Home } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { useToast } from '@/components/feedback/toast-context'
import { useAuth } from '@/auth/auth-context'
import { buildPaidReport } from '@/data/reports-content'
import { reportById } from '@/data/reports-hub'
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
 * Book-style paid report after unlock — download + go home.
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
    return <Navigate to={paths.reportIntro(topic.id)} replace />
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
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${topic!.id}-report.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Download started', { description: `${topic!.title} report saved.` })
  }

  return (
    <PageContainer width="content" className="pb-16 pt-4 sm:pt-6">
      <article className="mx-auto max-w-2xl animate-rise space-y-8">
        <button
          type="button"
          onClick={() => navigate(paths.reportsRoot, { replace: true })}
          className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
        >
          ← All reports
        </button>

        {/* Book plane */}
        <div className="relative overflow-hidden rounded-sm border border-border/90 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-surface)_92%,#f5efe4)_0%,var(--color-surface)_40%,color-mix(in_oklab,var(--color-surface)_96%,#ebe4d6)_100%)] shadow-[0_18px_40px_-28px_rgba(40,24,12,0.45)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-copper/25 to-transparent"
          />
          <div className="space-y-8 px-6 py-10 sm:px-10 sm:py-12">
            <header className="space-y-3 border-b border-border/70 pb-6 text-center">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-deep">
                Cyklos report
              </p>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {report.title}
              </h1>
              <p className="text-sm text-muted">Prepared for {report.personName}</p>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-ink/80 text-pretty">
                {report.standfirst}
              </p>
            </header>

            <div className="space-y-8">
              {report.chapters.map((chapter, i) => (
                <section key={chapter.title} className="space-y-2">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                    Chapter {i + 1}
                  </p>
                  <h2 className="font-serif text-xl font-semibold text-ink">{chapter.title}</h2>
                  <p className="text-sm leading-relaxed text-ink/85 text-pretty sm:text-[15px]">
                    {chapter.body}
                  </p>
                </section>
              ))}
            </div>

            <footer className="border-t border-border/70 pt-6">
              <p className="text-sm italic leading-relaxed text-muted text-pretty">{report.closing}</p>
            </footer>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            variant="primary"
            size="lg"
            className="w-full rounded-full sm:flex-1"
            iconLeft={<Download className="size-4" />}
            onClick={downloadReport}
          >
            Click to download
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full rounded-full sm:flex-1"
            iconLeft={<Home className="size-4" />}
            onClick={() => {
              clearReportDraft()
              navigate(paths.everything)
            }}
          >
            Go to home page
          </Button>
        </div>
      </article>
    </PageContainer>
  )
}
