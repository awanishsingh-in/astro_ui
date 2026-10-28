import type { CSSProperties } from 'react'
import { MessageCircle, RotateCcw } from 'lucide-react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/auth/auth-context'
import { CALCULATOR_ACCENT, calculatorById } from '@/data/calculator-hub'
import type { CalculatorResult } from '@/data/calculator-mock'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'
import './CalculatorResultPage.css'

/**
 * Calculator result — wide two-column reading that fills the card height.
 * Shell stays viewport-locked; columns stretch so panels use the full space.
 */
export default function CalculatorResultPage() {
  const { kind = '' } = useParams<{ kind: string }>()
  const card = calculatorById(kind)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const result = (location.state as { result?: CalculatorResult } | null)?.result

  if (!user) return null
  if (!card) return <Navigate to={paths.calculatorRoot} replace />
  if (!result || result.kind !== card.id) {
    return <Navigate to={paths.calculator(card.id)} replace />
  }

  const accent = CALCULATOR_ACCENT[card.id]
  const Icon = card.icon
  const statusLine = result.statusLine ?? result.verdict
  const conclusion = result.conclusion ?? result.summary
  const clear = result.tone === 'clear'
  const hasRemedies = Boolean(result.remedies?.length)

  return (
    <PageContainer
      width="wide"
      flush
      className="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden px-5 py-3 md:px-6 lg:px-8 lg:py-4"
    >
      <article
        className="calc-result-stack mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col gap-3"
        style={{ '--calc-accent': accent } as CSSProperties}
      >
        <section
          className={cn(
            'relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.5rem] border',
            'border-[color-mix(in_srgb,var(--calc-accent)_38%,transparent)]',
            'bg-surface/90',
            'shadow-[0_16px_40px_-28px_color-mix(in_srgb,var(--calc-accent)_55%,transparent)]',
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full opacity-40 blur-3xl"
            style={{ background: accent }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--calc-accent)_65%,transparent)] to-transparent"
          />

          <div className="relative flex min-h-0 flex-1 flex-col px-5 py-5 sm:px-7 sm:py-6 lg:px-8 lg:py-7">
            <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-0 lg:items-stretch">
              {/* Status column */}
              <div className="flex min-h-0 flex-col gap-4 lg:pr-8">
                <div className="flex shrink-0 items-start gap-3.5">
                  <span
                    className={cn(
                      'calc-result-icon inline-flex size-14 shrink-0 items-center justify-center rounded-2xl',
                      'border border-[color-mix(in_srgb,var(--calc-accent)_45%,transparent)]',
                      'bg-[color-mix(in_srgb,var(--calc-accent)_16%,transparent)]',
                      'text-[var(--calc-accent)] shadow-[0_0_28px_-8px_color-mix(in_srgb,var(--calc-accent)_60%,transparent)]',
                    )}
                  >
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                      {statusLine}
                    </h1>
                    <p className="text-sm text-muted">{result.name}</p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex rounded-full border px-2.5 py-0.5',
                      'font-mono text-[10px] font-semibold uppercase tracking-[0.12em]',
                      clear
                        ? 'border-positive/35 bg-positive-soft text-positive'
                        : 'border-[color-mix(in_srgb,var(--calc-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--calc-accent)_12%,transparent)] text-[var(--calc-accent)]',
                    )}
                  >
                    {result.verdict}
                  </span>
                </div>

                <p className="shrink-0 text-sm leading-relaxed text-muted text-pretty">
                  {result.summary}
                </p>

                <div
                  className={cn(
                    'flex min-h-0 flex-1 flex-col rounded-xl border border-border/60 bg-surface-sunken/40 p-4 sm:p-5',
                  )}
                >
                  <p className="mb-3 shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
                    Key notes
                  </p>
                  <ul className="flex min-h-0 flex-1 flex-col justify-evenly gap-3">
                    {result.points.map((line) => (
                      <li
                        key={line}
                        className="flex gap-3 text-sm leading-relaxed text-ink text-pretty sm:text-[15px]"
                      >
                        <span
                          aria-hidden
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--calc-accent)]"
                        />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Detail + remedies column */}
              <div className="flex min-h-0 flex-col gap-4 lg:border-l lg:border-border/50 lg:pl-8">
                <div className="shrink-0 space-y-2">
                  <p className="text-base font-semibold leading-snug tracking-tight text-ink text-pretty sm:text-lg">
                    {conclusion}
                  </p>
                  <p className="text-sm leading-relaxed text-purple text-pretty sm:text-[15px]">
                    {result.detail}
                  </p>
                </div>

                <div
                  className={cn(
                    'flex min-h-0 flex-1 flex-col rounded-xl border border-border/60 bg-surface-sunken/30 p-4 sm:p-5',
                  )}
                >
                  {hasRemedies ? (
                    <>
                      <p className="mb-3 shrink-0 text-sm font-semibold text-ink">
                        Some remedies (in case {result.title} is present)
                      </p>
                      <div className="flex min-h-0 flex-1 flex-col justify-evenly gap-4 overflow-y-auto overscroll-contain">
                        {result.remedies!.map((block) => (
                          <div key={block.title} className="space-y-2">
                            <p className="text-sm font-semibold text-ink">{block.title}</p>
                            {block.body && (
                              <p className="text-sm leading-relaxed text-muted text-pretty">
                                {block.body}
                              </p>
                            )}
                            {block.items && block.items.length > 0 && (
                              <ul className="space-y-2">
                                {block.items.map((item) => (
                                  <li
                                    key={item}
                                    className="flex gap-2.5 text-sm leading-relaxed text-muted text-pretty"
                                  >
                                    <span
                                      aria-hidden
                                      className="mt-2 size-1.5 shrink-0 rounded-full bg-copper/70"
                                    />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mb-3 shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
                        Reading
                      </p>
                      <div className="flex min-h-0 flex-1 flex-col justify-center gap-3">
                        <p className="text-sm leading-relaxed text-muted text-pretty sm:text-[15px]">
                          {result.detail}
                        </p>
                        <p className="text-sm leading-relaxed text-ink text-pretty">
                          Ask Cyklos for a deeper walk-through of this chart — timing, care, and what
                          to watch next.
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <p className="shrink-0 text-xs leading-relaxed text-muted text-pretty">
                  {result.caveat}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full flex-1 rounded-full shadow-[0_14px_36px_-12px_color-mix(in_srgb,var(--calc-accent)_70%,transparent)]"
            iconLeft={<MessageCircle className="size-4" />}
            onClick={() =>
              navigate(`${paths.ask}?q=${encodeURIComponent(result.askPrompt)}`)
            }
          >
            Know more about this
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full flex-1 rounded-full"
            iconLeft={<RotateCcw className="size-4" />}
            onClick={() => {
              const from =
                typeof (location.state as { from?: unknown } | null)?.from === 'string'
                  ? (location.state as { from: string }).from
                  : undefined
              navigate(paths.calculator(card.id), {
                state: from ? { from } : undefined,
              })
            }}
          >
            Check another chart
          </Button>
        </div>
      </article>
    </PageContainer>
  )
}
