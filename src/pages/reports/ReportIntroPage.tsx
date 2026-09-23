import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { useAuth } from '@/auth/auth-context'
import { formatInr, reportById } from '@/data/reports-hub'
import { hasReportUnlocked } from '@/onboarding/reports-unlock'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'

/**
 * After Get — explain the selected report, then Proceed to the birth form.
 */
export default function ReportIntroPage() {
  const { reportId = '' } = useParams<{ reportId: string }>()
  const topic = reportById(reportId)
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) return null
  if (!topic) return <Navigate to={paths.reportsRoot} replace />
  if (hasReportUnlocked(user.id, topic.id)) {
    return <Navigate to={paths.reportView(topic.id)} replace />
  }

  const Icon = topic.icon

  return (
    <PageContainer width="content" className="pb-16 pt-4 sm:pt-6">
      <article className="mx-auto flex max-w-lg flex-col gap-6 animate-rise">
        <button
          type="button"
          onClick={() => navigate(paths.reportsRoot, { replace: true })}
          className="self-start text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
        >
          ← All reports
        </button>

        <Card
          padding="none"
          className="flex flex-col gap-6 border-border/80 p-6 sm:gap-7 sm:p-8"
        >
          <div className="flex items-start gap-4">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-copper/35 bg-copper/15 text-copper">
              <Icon className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 space-y-2">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                About this report
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {topic.title}
              </h1>
              <p className="text-sm leading-relaxed text-muted text-pretty">{topic.blurb}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-ink text-pretty">{topic.about}</p>
            <p className="text-sm leading-relaxed text-muted text-pretty">
              Next you enter birth details, then unlock for{' '}
              <span className="font-medium text-ink">{formatInr(topic.price)}</span> on the demo
              gateway. After payment you read it as a book and can download anytime from this hub.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full rounded-full"
            onClick={() => navigate(paths.reportForm(topic.id))}
          >
            Proceed
          </Button>
        </Card>

        <div className="rounded-2xl border border-copper/35 bg-copper/10 px-5 py-5">
          <p className="text-sm font-semibold text-gold-deep">What’s inside</p>
          <ul className="mt-3 space-y-2.5">
            {topic.covers.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-snug text-ink">
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-copper"
                />
                <span className="text-pretty">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </PageContainer>
  )
}
