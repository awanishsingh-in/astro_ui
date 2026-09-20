import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import {
  HOROSCOPE_THEMES,
  themeToKind,
  type HoroscopeThemeId,
} from '@/data/horoscope-hub'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'

/**
 * Nine themed readings — separate from the daily hub.
 * Opens the full chart-based reading for the chosen lens.
 */
export default function HoroscopeReadingsPage() {
  const navigate = useNavigate()

  function openTheme(id: HoroscopeThemeId) {
    const kind = themeToKind(id, 'daily')
    navigate(paths.horoscope(kind))
  }

  return (
    <PageContainer width="wide" className="pb-16 pt-4 sm:pt-6">
      <article className="mx-auto max-w-3xl animate-rise space-y-8">
        <header className="space-y-3">
          <button
            type="button"
            onClick={() => navigate(paths.horoscopeRoot)}
            className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
          >
            ← Back to horoscope
          </button>
          <div className="space-y-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
              Readings
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Choose a reading
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted text-pretty sm:text-base">
              Nine lenses on the same sky — love, career, health, and more. Each opens a full
              reading from your chart.
            </p>
          </div>
        </header>

        <section className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {HOROSCOPE_THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => openTheme(t.id)}
              className={cn(
                'flex flex-col items-start gap-1 rounded-2xl border border-border/80 bg-surface/80',
                'px-3.5 py-4 text-left transition sm:px-4 sm:py-4',
                'hover:border-copper/50 hover:bg-copper/10 hover:text-ink',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper',
              )}
            >
              <span className="text-sm font-semibold text-ink">{t.label}</span>
              <span className="text-[11px] leading-snug text-muted sm:text-xs">{t.hint}</span>
            </button>
          ))}
        </section>

        <div className="flex justify-center pt-2">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => navigate(paths.horoscopeRoot)}
          >
            Return to daily hub
          </Button>
        </div>
      </article>
    </PageContainer>
  )
}
