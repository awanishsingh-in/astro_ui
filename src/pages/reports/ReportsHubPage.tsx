import { Download, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/auth/auth-context'
import { REPORT_TOPICS } from '@/data/reports-hub'
import { hasReportUnlocked } from '@/onboarding/reports-unlock'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'

/**
 * Reports hub — topic cards with Get / Download.
 */
export default function ReportsHubPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const onFocus = () => setTick((n) => n + 1)
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  if (!user) return null

  return (
    <PageContainer width="wide" className="pb-16 pt-4 sm:pt-6">
      <article className="mx-auto max-w-3xl animate-rise space-y-8">
        <header className="space-y-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            Reports
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Chart reports
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted text-pretty sm:text-base">
            Long-form readings written from the birth chart. Get a report, enter details, pay, then
            read it as a book — or download again anytime.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Report topics">
          {REPORT_TOPICS.map((topic) => {
            const Icon = topic.icon
            const unlocked = hasReportUnlocked(user.id, topic.id)
            return (
              <article
                key={`${topic.id}-${tick}`}
                className={cn(
                  'flex flex-col gap-4 rounded-2xl border border-border/80 bg-surface/90 p-5',
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-copper/35 bg-copper/15 text-copper">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h2 className="text-base font-semibold text-ink">{topic.title}</h2>
                    <p className="text-xs leading-snug text-muted text-pretty">{topic.blurb}</p>
                  </div>
                </div>

                <Button
                  variant={unlocked ? 'secondary' : 'primary'}
                  size="md"
                  className="mt-auto w-full rounded-full"
                  iconLeft={
                    unlocked ? (
                      <Download className="size-4" />
                    ) : (
                      <ShoppingBag className="size-4" />
                    )
                  }
                  onClick={() =>
                    navigate(
                      unlocked ? paths.reportView(topic.id) : paths.reportIntro(topic.id),
                    )
                  }
                >
                  {unlocked ? 'Download' : 'Get'}
                </Button>
              </article>
            )
          })}
        </section>
      </article>
    </PageContainer>
  )
}
