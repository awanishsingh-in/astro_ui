import { Download, Home } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { useToast } from '@/components/feedback/toast-context'
import { useAuth } from '@/auth/auth-context'
import { buildChartDetailBook } from '@/data/chart-detail-content'
import { chartSeedFor } from '@/data/profiles'
import { hasChartDetailUnlocked } from '@/onboarding/chart-detail-unlock'
import { PageContainer } from '@/layouts/PageContainer'
import { useProfiles } from '@/profiles/profiles-context'
import { paths } from '@/routes/paths'
import { buildChart } from '@/data/chart-mock'

/**
 * Book-style detailed kundli after payment — download + go home.
 */
export default function ChartDetailViewPage() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const { selected: profile } = useProfiles()

  if (!user) return null
  if (!hasChartDetailUnlocked(user.id, profile.id)) {
    return <Navigate to={paths.chartDetail} replace />
  }

  const seed = chartSeedFor(profile)
  const chart = buildChart(seed, 'D1')
  const moon = chart.grahas.find((g) => g.graha === 'Mo')
  const book = buildChartDetailBook(
    profile.name,
    profile.birthDetails,
    chart.lagna.rashi,
    moon ? `${moon.nakshatra.name} pada ${moon.nakshatra.pada}` : undefined,
  )

  function downloadBook() {
    const lines = [
      book.title,
      `For ${book.personName}`,
      '',
      book.standfirst,
      '',
      ...book.chapters.flatMap((ch) => [ch.title, ch.body, '']),
      book.closing,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cyklos-detailed-kundli-${profile.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Download started', { description: 'Detailed kundli report saved.' })
  }

  return (
    <PageContainer width="content" className="pb-16 pt-4 sm:pt-6">
      <article className="mx-auto max-w-2xl animate-rise space-y-8">
        <button
          type="button"
          onClick={() => navigate(paths.chart)}
          className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
        >
          ← My chart
        </button>

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
                {book.title}
              </h1>
              <p className="text-sm text-muted">Prepared for {book.personName}</p>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-ink/80 text-pretty">
                {book.standfirst}
              </p>
            </header>

            <div className="space-y-8">
              {book.chapters.map((chapter, i) => (
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
              <p className="text-sm italic leading-relaxed text-muted text-pretty">{book.closing}</p>
            </footer>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full rounded-full"
            iconLeft={<Download className="size-4" />}
            onClick={downloadBook}
          >
            Click here to download
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full rounded-full"
            iconLeft={<Home className="size-4" />}
            onClick={() => navigate(paths.everything)}
          >
            Go back to home screen
          </Button>
        </div>
      </article>
    </PageContainer>
  )
}
