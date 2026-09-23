import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { useAuth } from '@/auth/auth-context'
import {
  formatChartDetailInr,
  hasChartDetailUnlocked,
} from '@/onboarding/chart-detail-unlock'
import { PageContainer } from '@/layouts/PageContainer'
import { useProfiles } from '@/profiles/profiles-context'
import { paths } from '@/routes/paths'

/**
 * Payment required — Proceed opens the demo gateway.
 */
export default function ChartDetailUnlockPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { selected: profile } = useProfiles()

  if (!user) return null
  if (hasChartDetailUnlocked(user.id, profile.id)) {
    return <Navigate to={paths.chartDetailView} replace />
  }

  return (
    <PageContainer width="content" className="pb-16 pt-4 sm:pt-6">
      <article className="mx-auto flex max-w-lg flex-col gap-6 animate-rise">
        <button
          type="button"
          onClick={() => navigate(paths.chartDetail)}
          className="self-start text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
        >
          ← Back
        </button>

        <Card padding="lg" className="flex flex-col gap-5 border-border/80 p-6 sm:p-8">
          <div className="space-y-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
              Payment required
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Unlock the detailed kundli report
            </h1>
            <p className="text-sm leading-relaxed text-muted text-pretty">
              Pay {formatChartDetailInr()} for {profile.name}’s full book-style reading. Next step is
              the demo payment gateway.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-copper/35 bg-copper/10 px-4 py-4">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                Amount
              </p>
              <p className="mt-1 text-2xl font-semibold text-ink">{formatChartDetailInr()}</p>
            </div>
            <p className="max-w-[9rem] text-right text-sm text-muted">Detailed kundli · {profile.name}</p>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full rounded-full"
            onClick={() => navigate(paths.chartDetailPay)}
          >
            Proceed
          </Button>
        </Card>
      </article>
    </PageContainer>
  )
}
