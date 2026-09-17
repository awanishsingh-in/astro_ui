import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { useAuth } from '@/auth/auth-context'
import { featureBySlug, featureGroups } from '@/data/features'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'

/**
 * Detail page for a live capability — what it is, what you get, and a clear open CTA.
 */
export default function FeaturePage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const feature = slug ? featureBySlug(slug) : undefined

  if (!user) return null
  if (!feature || feature.status !== 'live') {
    return <Navigate to={paths.everything} replace />
  }

  const Icon = feature.icon
  const group = featureGroups.find((g) => g.features.some((f) => f.slug === feature.slug))
  const openTo = feature.to ?? paths.ask
  const contents =
    feature.contents ??
    ([
      feature.description,
      'Uses the chart for the profile you have selected.',
      'Open it anytime from All features or the side nav.',
    ] as string[])

  return (
    <>
      <MobileHeader title={feature.title} titleAs="p" showBack user={user} />

      <PageContainer width="reading">
        <article className="mx-auto w-full max-w-reading animate-rise space-y-8">
          <header className="space-y-4 rounded-panel border border-border/80 bg-surface/70 p-5 shadow-card sm:p-6">
            <div className="flex items-start gap-4">
              <span
                aria-hidden
                className={cn(
                  'inline-flex size-12 shrink-0 items-center justify-center rounded-card border',
                  'border-copper/40 bg-copper/15 text-gold-deep',
                )}
              >
                {feature.glyph ? (
                  <span className="text-xl leading-none">{feature.glyph}</span>
                ) : (
                  <Icon className="size-6" strokeWidth={1.75} />
                )}
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {group && (
                    <p className="font-mono text-label uppercase tracking-[0.14em] text-gold-deep">
                      {group.title}
                    </p>
                  )}
                  <Badge tone="gold" mono>
                    Available
                  </Badge>
                </div>
                <h1 className="font-serif text-title font-normal text-ink text-balance lg:text-title-lg">
                  {feature.title}
                </h1>
                <p className="text-body text-purple text-pretty">{feature.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-border/70 pt-4">
              <Button
                variant="primary"
                size="md"
                to={openTo}
                iconRight={<ArrowRight className="size-4" />}
                className="rounded-full"
              >
                Open {shortLabel(feature.title)}
              </Button>
              <Button variant="ghost" size="md" to={paths.ask} className="rounded-full">
                Ask instead
              </Button>
            </div>
          </header>

          <section className="space-y-3">
            <h2 className="font-mono text-label uppercase tracking-[0.12em] text-muted">
              What you get
            </h2>
            <ul className="space-y-2.5">
              {contents.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-card border border-border/70 bg-surface/60 px-3.5 py-3"
                >
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-deep" />
                  <span className="text-sub text-ink text-pretty">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <Card tone="gold" padding="md" className="gap-2">
            <p className="inline-flex items-center gap-2 font-mono text-label uppercase tracking-[0.12em] text-gold-deep">
              <Sparkles className="size-3.5" aria-hidden />
              Tip
            </p>
            <p className="text-sm text-purple text-pretty">
              Switch profiles from the top bar on Profile or My Chart — this feature reads the chart
              that is currently selected.
            </p>
          </Card>

          {feature.sourceDecision && (
            <Card tone="sunken" padding="md" className="gap-1.5">
              <p className="font-mono text-label uppercase text-muted">In the product plan as</p>
              <p className="font-mono text-data text-purple text-pretty">{feature.sourceDecision}</p>
            </Card>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <Button
              variant="secondary"
              size="sm"
              to={paths.everything}
              iconLeft={<ArrowLeft className="size-4" />}
            >
              Back to All features
            </Button>
          </div>
        </article>
      </PageContainer>
    </>
  )
}

function shortLabel(title: string): string {
  const first = title.split(/[/(·]/)[0]?.trim()
  return first && first.length <= 28 ? first : 'feature'
}
