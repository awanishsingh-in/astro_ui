import { MessageCircle, RotateCcw } from 'lucide-react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { useAuth } from '@/auth/auth-context'
import { calculatorById } from '@/data/calculator-hub'
import type { CalculatorResult } from '@/data/calculator-mock'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'

/**
 * Calculator result — detail + CTA into Ask.
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

  const badgeTone =
    result.tone === 'clear' ? 'positive' : result.tone === 'watch' ? 'caution' : 'gold'

  return (
    <PageContainer width="content" className="pb-16 pt-4 sm:pt-6">
      <article className="mx-auto max-w-lg animate-rise space-y-6">
        <button
          type="button"
          onClick={() => navigate(paths.calculatorRoot)}
          className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
        >
          ← All calculators
        </button>

        <header className="space-y-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            {result.title}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {result.name}
            </h1>
            <Badge tone={badgeTone}>{result.verdict}</Badge>
          </div>
          <p className="text-base leading-relaxed text-ink text-pretty">{result.summary}</p>
        </header>

        <Card
          padding="lg"
          className={cn(
            'gap-4 border-border/80',
            result.tone === 'watch' && 'border-copper/35 bg-copper/10',
            result.tone === 'present' && 'border-copper/25 bg-copper/8',
          )}
        >
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Detail
          </p>
          <p className="text-sm leading-relaxed text-purple text-pretty">{result.detail}</p>
          <ul className="space-y-2.5 border-t border-border/60 pt-4">
            {result.points.map((line) => (
              <li key={line} className="flex gap-3 text-sm leading-relaxed text-ink text-pretty">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-copper" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="border-t border-border/60 pt-4 text-xs leading-relaxed text-muted text-pretty">
            {result.caveat}
          </p>
        </Card>

        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full rounded-full"
            iconLeft={<MessageCircle className="size-4" />}
            onClick={() =>
              navigate(`${paths.ask}?q=${encodeURIComponent(result.askPrompt)}`)
            }
          >
            Know more about this
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="w-full rounded-full"
            iconLeft={<RotateCcw className="size-4" />}
            onClick={() => navigate(paths.calculator(card.id))}
          >
            Check another chart
          </Button>
        </div>
      </article>
    </PageContainer>
  )
}
