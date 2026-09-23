import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/layouts/PageContainer'
import { CALCULATOR_CARDS } from '@/data/calculator-hub'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'

/**
 * Calculator hub — six tools. Tap a card to open the birth form.
 */
export default function CalculatorHubPage() {
  const navigate = useNavigate()

  return (
    <PageContainer width="wide" className="pb-16 pt-4 sm:pt-6">
      <article className="mx-auto max-w-5xl animate-rise space-y-8">
        <header className="space-y-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            Calculator
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            What do you want to check?
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted text-pretty sm:text-base">
            Pick a reading. Enter one birth chart, then see the result — ask Cyklos if you want to go
            deeper.
          </p>
        </header>

        <section
          className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 lg:gap-6"
          aria-label="Calculators"
        >
          {CALCULATOR_CARDS.map((card) => {
            const Icon = card.icon
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => navigate(paths.calculator(card.id))}
                className={cn(
                  'flex min-h-[11rem] flex-col items-start gap-4 rounded-2xl border border-border/80 bg-surface/90',
                  'px-5 py-5 text-left transition sm:min-h-[13rem] sm:px-6 sm:py-6 lg:min-h-[14rem]',
                  'hover:border-copper/50 hover:bg-copper/10',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper',
                )}
              >
                <span className="inline-flex size-11 items-center justify-center rounded-full border border-copper/35 bg-copper/15 text-copper sm:size-12">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="mt-auto space-y-1.5">
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
  )
}
