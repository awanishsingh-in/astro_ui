import type { CSSProperties } from 'react'
import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/auth/auth-context'
import { formatInr, REPORT_TOPICS, type ReportId } from '@/data/reports-hub'
import { hasReportUnlocked } from '@/onboarding/reports-unlock'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'
import './ReportsHubPage.css'

/** Soft accents per report topic — rose-gold family, not heavy magenta. */
const REPORT_ACCENT: Record<ReportId, string> = {
  life: 'var(--color-primary)',
  career: 'var(--color-primary-hover)',
  marriage: 'var(--color-accent)',
  finance: 'var(--color-primary)',
  health: 'var(--color-primary-hover)',
  education: 'var(--color-accent)',
  gemstone: 'var(--color-primary)',
  numerology: 'var(--color-primary-hover)',
}

/**
 * Reports hub — large topic cards with Download this report.
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
      <article className="mx-auto max-w-6xl animate-rise space-y-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Reports</h1>
        </header>

        <section
          className="reports-hub-grid grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-5"
          aria-label="Report topics"
        >
          {REPORT_TOPICS.map((topic) => {
            const Icon = topic.icon
            const unlocked = hasReportUnlocked(user.id, topic.id)
            const accent = REPORT_ACCENT[topic.id]
            return (
              <article
                key={`${topic.id}-${tick}`}
                style={{ '--report-accent': accent } as CSSProperties}
                className={cn(
                  'reports-hub-card group relative flex min-h-[18rem] flex-col overflow-hidden',
                  'rounded-[1.35rem] border border-[color-mix(in_srgb,var(--report-accent)_38%,transparent)]',
                  'bg-surface/90 p-5 sm:min-h-[19rem] sm:p-5 lg:p-6',
                  'shadow-[0_16px_40px_-28px_color-mix(in_srgb,var(--report-accent)_50%,transparent)]',
                  'transition-[transform,border-color,box-shadow] duration-300 ease-out-soft',
                  'hover:-translate-y-1.5 hover:border-[color-mix(in_srgb,var(--report-accent)_55%,transparent)]',
                  'hover:shadow-[0_24px_52px_-24px_color-mix(in_srgb,var(--report-accent)_65%,transparent)]',
                )}
              >
                <span
                  aria-hidden
                  className="reports-hub-orb pointer-events-none absolute -right-12 -top-14 size-40 rounded-full opacity-12 blur-3xl transition-[transform,opacity] duration-500 ease-out-soft"
                  style={{ background: accent }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--report-accent)_40%,transparent)] to-transparent opacity-60"
                />

                <div className="relative flex items-start gap-3">
                  <span
                    className={cn(
                      'reports-hub-icon inline-flex size-12 shrink-0 items-center justify-center rounded-2xl',
                      'border border-[color-mix(in_srgb,var(--report-accent)_45%,transparent)]',
                      'bg-[color-mix(in_srgb,var(--report-accent)_16%,transparent)]',
                      'text-[var(--report-accent)] transition-[transform,box-shadow] duration-300 ease-out-soft',
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 space-y-1 pt-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
                        {topic.title}
                      </h2>
                      {unlocked && (
                        <span className="rounded-full border border-positive/35 bg-positive-soft px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-positive">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-silver-300">
                      {formatInr(topic.price)}
                    </p>
                  </div>
                </div>

                <p className="relative mt-4 line-clamp-4 text-sm leading-relaxed text-muted text-pretty">
                  {topic.about}
                </p>

                <ul className="relative mt-3 flex flex-wrap gap-1.5">
                  {topic.covers.slice(0, 3).map((item) => (
                    <li
                      key={item}
                      className={cn(
                        'rounded-full border border-border/70 bg-surface-sunken/60',
                        'px-2 py-0.5 text-[10px] font-medium text-ink/80',
                      )}
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="relative mt-auto pt-5">
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full rounded-full transition-transform duration-200 group-hover:-translate-y-0.5"
                    iconLeft={<Download className="size-4" />}
                    onClick={() =>
                      navigate(
                        unlocked ? paths.reportView(topic.id) : paths.reportForm(topic.id),
                      )
                    }
                  >
                    Download this report
                  </Button>
                </div>
              </article>
            )
          })}
        </section>
      </article>
    </PageContainer>
  )
}
