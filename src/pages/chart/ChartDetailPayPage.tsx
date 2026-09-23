import { CreditCard, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { useToast } from '@/components/feedback/toast-context'
import { useAuth } from '@/auth/auth-context'
import {
  CHART_DETAIL_PRICE,
  formatChartDetailInr,
  hasChartDetailUnlocked,
  unlockChartDetail,
} from '@/onboarding/chart-detail-unlock'
import { PageContainer } from '@/layouts/PageContainer'
import { useProfiles } from '@/profiles/profiles-context'
import { paths } from '@/routes/paths'

/**
 * Demo payment gateway for the detailed kundli report.
 */
export default function ChartDetailPayPage() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const { selected: profile } = useProfiles()
  const [paying, setPaying] = useState(false)

  if (!user) return null
  if (hasChartDetailUnlocked(user.id, profile.id)) {
    return <Navigate to={paths.chartDetailView} replace />
  }

  function confirmPay() {
    if (!user) return
    setPaying(true)
    window.setTimeout(() => {
      unlockChartDetail(user.id, profile.id)
      setPaying(false)
      toast.success('Payment successful', {
        description: `Detailed kundli report unlocked for ${profile.name}.`,
      })
      navigate(paths.chartDetailView, { replace: true })
    }, 900)
  }

  return (
    <PageContainer width="content" className="pb-16 pt-4 sm:pt-6">
      <article className="mx-auto max-w-lg animate-rise space-y-5">
        <button
          type="button"
          onClick={() => navigate(paths.chartDetailUnlock)}
          disabled={paying}
          className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline disabled:opacity-50"
        >
          ← Back
        </button>

        <Card padding="lg" className="flex flex-col gap-4 border-border/80 p-6 sm:gap-5 sm:p-7">
          <h1 className="text-2xl font-semibold text-ink">Payment gateway</h1>
          <p className="text-sm text-muted text-pretty">
            Pay {formatChartDetailInr(CHART_DETAIL_PRICE)} for the detailed kundli report for{' '}
            {profile.name}.
          </p>

          <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-surface-sunken/50 px-4 py-4">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                Amount
              </p>
              <p className="mt-1 text-2xl font-semibold text-ink">
                {formatChartDetailInr(CHART_DETAIL_PRICE)}
              </p>
            </div>
            <p className="max-w-[10rem] text-right text-sm text-muted">Detailed kundli · {profile.name}</p>
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
              onClick={() => navigate(paths.chartDetailUnlock)}
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
              {paying ? 'Processing…' : `Pay ${formatChartDetailInr(CHART_DETAIL_PRICE)}`}
            </Button>
          </div>
        </Card>
      </article>
    </PageContainer>
  )
}
