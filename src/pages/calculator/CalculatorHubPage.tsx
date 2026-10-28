import type { CSSProperties } from 'react'
import { ChevronRight } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PageContainer } from '@/layouts/PageContainer'
import { CALCULATOR_ACCENT, CALCULATOR_CARDS } from '@/data/calculator-hub'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'
import './CalculatorHubPage.css'

/**
 * Calculator hub — six tools. Tap a card to open the birth form.
 */
export default function CalculatorHubPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    typeof (location.state as { from?: unknown } | null)?.from === 'string'
      ? (location.state as { from: string }).from
      : undefined

  return (
    <div className="calc-hub-shell relative min-h-full">
      <div aria-hidden className="calc-hub-atmosphere pointer-events-none absolute inset-0 -z-10 overflow-hidden" />
      <PageContainer width="wide" className="relative pb-16 pt-4 sm:pt-6">
      <article className="mx-auto max-w-5xl animate-rise space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            What do you want to check?
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted text-pretty sm:text-base">
            Pick a reading. Enter one birth chart, then see the result — ask Cyklos if you want to go
            deeper.
          </p>
        </header>

        <section
          className="calc-hub-grid grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 lg:gap-6"
          aria-label="Calculators"
        >
          {CALCULATOR_CARDS.map((card) => {
            const Icon = card.icon
            const accent = CALCULATOR_ACCENT[card.id]
            return (
              <button
                key={card.id}
                type="button"
                onClick={() =>
                  navigate(paths.calculator(card.id), {
                    state: from ? { from } : undefined,
                  })
                }
                style={{ '--calc-accent': accent } as CSSProperties}
                className={cn(
                  'calc-hub-card group relative flex min-h-[11rem] flex-col items-start overflow-hidden',
                  'rounded-2xl border border-border/70 bg-surface/80',
                  'px-5 py-5 text-left sm:min-h-[13rem] sm:px-6 sm:py-6 lg:min-h-[14rem]',
                  'shadow-[0_10px_32px_-22px_rgba(201,145,115,0.55)]',
                  'transition-[transform,border-color,box-shadow,background-color] duration-300 ease-out-soft',
                  'hover:-translate-y-1.5 hover:border-[color-mix(in_srgb,var(--calc-accent)_55%,transparent)]',
                  'hover:bg-[color-mix(in_srgb,var(--calc-accent)_8%,var(--color-surface))]',
                  'hover:shadow-[0_22px_48px_-24px_var(--calc-accent-glow)]',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper',
                  'active:translate-y-0 active:scale-[0.99]',
                )}
              >
                <span
                  aria-hidden
                  className="calc-hub-orb pointer-events-none absolute -right-10 -top-12 size-36 rounded-full opacity-45 blur-3xl transition-[transform,opacity] duration-500 ease-out-soft"
                  style={{ background: accent }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--calc-accent)_65%,transparent)] to-transparent opacity-70"
                />

                <span className="relative flex w-full items-start justify-between gap-3">
                  <span
                    className={cn(
                      'calc-hub-icon inline-flex size-11 items-center justify-center rounded-full sm:size-12',
                      'border border-[color-mix(in_srgb,var(--calc-accent)_40%,transparent)]',
                      'bg-[color-mix(in_srgb,var(--calc-accent)_16%,transparent)]',
                      'text-[var(--calc-accent)] transition-[transform,border-color,box-shadow] duration-300 ease-out-soft',
                    )}
                  >
                    <Icon className="size-5 transition-transform duration-300 group-hover:scale-110" aria-hidden />
                  </span>
                  <ChevronRight
                    className="calc-hub-arrow mt-1 size-4 shrink-0 text-[var(--calc-accent)] opacity-0 transition-[opacity,transform] duration-300 ease-out-soft translate-x-[-6px]"
                    aria-hidden
                  />
                </span>

                <span className="relative mt-auto space-y-1.5 pt-6">
                  <span className="block text-lg font-semibold tracking-tight text-ink sm:text-xl">
                    {card.title}
                  </span>
                  <span className="block text-sm leading-snug text-muted text-pretty">{card.hint}</span>
                </span>
              </button>
            )
          })}
        </section>
      </article>
    </PageContainer>
    </div>
  )
}
