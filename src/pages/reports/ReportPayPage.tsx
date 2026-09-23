import { CreditCard, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { useToast } from '@/components/feedback/toast-context'
import { useAuth } from '@/auth/auth-context'
import { formatInr, reportById } from '@/data/reports-hub'
import {
  hasReportUnlocked,
  readReportDraft,
  unlockReport,
} from '@/onboarding/reports-unlock'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'

/**
 * Demo payment gateway for one report.
 */
export default function ReportPayPage() {
  const { reportId = '' } = useParams<{ reportId: string }>()
  const topic = reportById(reportId)
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const draft = readReportDraft()
  const [paying, setPaying] = useState(false)

  if (!user) return null
  if (!topic) return <Navigate to={paths.reportsRoot} replace />
  if (hasReportUnlocked(user.id, topic.id)) {
    return <Navigate to={paths.reportView(topic.id)} replace />
  }
  if (!draft || draft.reportId !== topic.id) {
    return <Navigate to={paths.reportForm(topic.id)} replace />
  }

  function confirmPay() {
    if (!user || !topic) return
    setPaying(true)
    window.setTimeout(() => {
      unlockReport(user.id, topic.id)
      setPaying(false)
      toast.success('Payment successful', {
        description: `${topic.title} report unlocked.`,
      })
      navigate(paths.reportView(topic.id), { replace: true })
    }, 900)
  }

  return (
    <PageContainer width="content" className="pb-16 pt-4 sm:pt-6">
      <article className="mx-auto max-w-lg animate-rise space-y-5">
        <button
          type="button"
          onClick={() => navigate(paths.reportForm(topic.id))}
          disabled={paying}
          className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline disabled:opacity-50"
        >
          ← Back to form
        </button>

        <Card padding="lg" className="flex flex-col gap-4 border-border/80 p-6 sm:gap-5 sm:p-7">
          <h1 className="text-2xl font-semibold text-ink">Payment gateway</h1>
          <p className="text-sm text-muted text-pretty">
            Pay {formatInr(topic.price)} for the {topic.title} report for {draft.name}.
          </p>

          <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-surface-sunken/50 px-4 py-4">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                Amount
              </p>
              <p className="mt-1 text-2xl font-semibold text-ink">{formatInr(topic.price)}</p>
            </div>
            <p className="max-w-[10rem] text-right text-sm text-muted">
              {topic.title} · {draft.name}
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-border/80 px-4 py-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold-deep" aria-hidden />
            <p className="text-sm text-muted text-pretty">
              Demo payment gateway · no real charge. Confirm to finish.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="ghost"
              size="md"
              className="rounded-full"
              disabled={paying}
              onClick={() => navigate(paths.reportForm(topic.id))}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1 rounded-full"
              disabled={paying}
              iconLeft={<CreditCard className="size-4" />}
              onClick={confirmPay}
            >
              {paying ? 'Processing…' : `Pay ${formatInr(topic.price)}`}
            </Button>
          </div>
        </Card>
      </article>
    </PageContainer>
  )
}
