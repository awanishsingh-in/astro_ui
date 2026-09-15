import { ArrowLeft, Check } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { useAuth } from '@/auth/auth-context'
import { featureBySlug } from '@/data/features'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'

/**
 * A confirmed capability that does not have its screen yet.
 *
 * Not a dead end: it says what the feature is, what it will contain, and —
 * crucially — quotes the product reference's own decision, so it is clear this
 * is committed work rather than a placeholder someone invented.
 */
export default function FeaturePage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const feature = slug ? featureBySlug(slug) : undefined

  if (!user) return null
  // An unknown or undecided slug has no page — send them back to the hub.
  if (!feature || feature.status === 'undecided') {
    return <Navigate to={paths.everything} replace />
  }

  const Icon = feature.icon

  return (
    <>
      <MobileHeader title={feature.title} titleAs="p" showBack user={user} />

      <PageContainer width="reading">
        <article className="mx-auto w-full max-w-reading animate-rise">
          <header className="flex items-start gap-4">
            <span
              aria-hidden
              className="inline-flex size-12 shrink-0 items-center justify-center rounded-card border border-gold-border bg-gold-soft text-gold-deep"
            >
              <Icon className="size-6" />
            </span>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-title font-semibold text-ink text-balance lg:text-title-lg">
                  {feature.title}
                </h1>
                <Badge tone="neutral" mono>
                  Coming later
                </Badge>
              </div>
              <p className="text-body text-purple text-pretty">{feature.description}</p>
            </div>
          </header>

          {feature.contents && (
            <section className="mt-8 space-y-3">
              <h2 className="font-mono text-label uppercase text-muted">What this will hold</h2>
              <ul className="space-y-2.5">
                {feature.contents.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-deep" />
                    <span className="text-sub text-purple text-pretty">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* The reference's own wording, so this reads as committed, not invented. */}
          <Card tone="sunken" padding="md" className="mt-8 gap-1.5">
            <p className="font-mono text-label uppercase text-muted">In the product plan as</p>
            <p className="font-mono text-data text-purple text-pretty">{feature.sourceDecision}</p>
          </Card>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <Button
              variant="secondary"
              size="sm"
              to={paths.everything}
              iconLeft={<ArrowLeft className="size-4" />}
            >
              Back to Everything
            </Button>
            <Button variant="ghost" size="sm" to={paths.ask}>
              Ask a question instead
            </Button>
          </div>
        </article>
      </PageContainer>
    </>
  )
}
