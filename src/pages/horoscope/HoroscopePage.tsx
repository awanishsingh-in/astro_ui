import { CalendarRange, Compass, Sparkles, TriangleAlert } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { ErrorState } from '@/components/common/ErrorState'
import { SectionHeader } from '@/components/common/SectionHeader'
import { CelestialCard } from '@/components/celestial/CelestialCard'
import { Skeleton, SkeletonText } from '@/components/common/Skeleton'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { useAuth } from '@/auth/auth-context'
import { chartSeedFor } from '@/data/profiles'
import { useProfiles } from '@/profiles/profiles-context'
import { HOROSCOPE_KINDS, type Horoscope, type HoroscopeKind } from '@/data/horoscope-mock'
import { useAsync } from '@/hooks/useAsync'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'
import { getHoroscope } from '@/services/astrology.service'
import { bhavaRef, BHAVA_SIGNIFIES } from '@/utils/astro'
import { cn } from '@/utils/cn'

/**
 * Every horoscope in the product, from one page.
 *
 * The nine kinds differ only in the data `buildHoroscope` returns — span,
 * bhavas, whether lucky information applies. The layout below never branches
 * on kind, which is what keeps them consistent and stops this becoming nine
 * near-identical files.
 *
 * Mobile is one readable column; desktop widens into an editorial two-column
 * body with the citation rail alongside.
 */
export default function HoroscopePage() {
  const { kind } = useParams<{ kind: string }>()
  const { user } = useAuth()
  const { selected } = useProfiles()
  const seed = chartSeedFor(selected)

  const valid = HOROSCOPE_KINDS.includes(kind as HoroscopeKind)

  const { status, data, error, retry } = useAsync(
    (signal) => getHoroscope(kind as HoroscopeKind, seed, selected.birthDetails.date, signal),
    [kind, seed, selected.birthDetails.date],
  )

  if (!user) return null
  if (!valid) return <Navigate to={paths.everything} replace />

  return (
    <>
      <MobileHeader title="Horoscope" titleAs="p" showBack user={user} />

      <PageContainer width="content">
        {status === 'error' ? (
          <ErrorState error={error} onRetry={retry} title="This horoscope did not load" />
        ) : status === 'loading' || status === 'idle' || !data ? (
          <HoroscopeSkeleton />
        ) : (
          <HoroscopeBody horoscope={data} />
        )}
      </PageContainer>
    </>
  )
}

function HoroscopeBody({ horoscope }: { horoscope: Horoscope }) {
  return (
    <article className="animate-rise">
      {/*
        The masthead is the one celestial surface here: period, title and the
        single sentence the whole horoscope reduces to. Everything after it is
        an editorial column on paper.
      */}
      <CelestialCard
        motifs={['stars', 'orbits']}
        tone="midnight"
        seed={horoscope.period.label}
        padding="lg"
        className="mx-auto max-w-reading"
      >
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-label uppercase text-gold-soft-line">
              {horoscope.period.label}
            </p>
            <Badge tone={horoscope.personal ? 'gold' : 'neutral'} mono>
              {horoscope.personal ? 'From your chart' : 'By sign'}
            </Badge>
          </div>

          <h1 className="font-serif text-title font-normal text-on-celestial text-balance lg:text-title-lg">
            {horoscope.title}
          </h1>
          <p className="text-sub text-on-celestial-muted text-pretty">{horoscope.standfirst}</p>
        </header>

        {/* The whole horoscope in one sentence. */}
        <p className="mt-6 border-l-2 border-gold-soft-line py-1 pl-5 text-title font-semibold text-on-celestial text-balance">
          {horoscope.summary}
        </p>
      </CelestialCard>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:gap-10">
        <div className="min-w-0 space-y-8">
          <Block title="Overview">
            <p className="text-body text-purple text-pretty">{horoscope.overview}</p>
          </Block>

          <Block title="Opportunities">
            <PointList items={horoscope.opportunities} tone="positive" />
          </Block>

          <Block title="Watch-outs">
            <PointList items={horoscope.watchOuts} tone="caution" />
          </Block>

          <Block title="Timing">
            <ol className="space-y-3">
              {horoscope.timing.map((slot) => (
                <li
                  key={slot.label}
                  className={cn(
                    'flex flex-col gap-1 rounded-card border p-4 sm:flex-row sm:items-baseline sm:gap-4',
                    slot.strong ? 'border-gold-border bg-gold-soft' : 'border-border bg-surface',
                  )}
                >
                  <span
                    className={cn(
                      'shrink-0 font-mono text-label uppercase sm:w-40',
                      slot.strong ? 'text-gold-deep' : 'text-muted',
                    )}
                  >
                    {slot.label}
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-purple text-pretty">
                    {slot.note}
                  </span>
                </li>
              ))}
            </ol>
          </Block>
        </div>

        {/* The citation rail — what this was read from, and its limits. */}
        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          {horoscope.lucky && (
            <Card tone="gold" padding="md" className="gap-3">
              <p className="flex items-center gap-1.5 font-mono text-label uppercase text-gold-deep">
                <Sparkles aria-hidden className="size-3.5" />
                Lucky today
              </p>
              <dl className="grid grid-cols-2 gap-3">
                <Lucky label="Number" value={String(horoscope.lucky.number)} />
                <Lucky label="Colour" value={horoscope.lucky.colour} />
                <Lucky label="Hours" value={horoscope.lucky.hours} />
                <Lucky label="Direction" value={horoscope.lucky.direction} />
              </dl>
              <p className="text-xs text-purple text-pretty">
                Drawn from your chart&rsquo;s own lords rather than a fixed table for your sign.
              </p>
            </Card>
          )}

          <Card padding="md" className="gap-3">
            <p className="flex items-center gap-1.5 font-mono text-label uppercase text-muted">
              <CalendarRange aria-hidden className="size-3.5" />
              Read from
            </p>
            <ul className="space-y-1.5">
              {horoscope.source.bhavas.map((bhava) => (
                <li key={bhava} className="font-mono text-data text-purple">
                  {bhavaRef(bhava)} · {BHAVA_SIGNIFIES[bhava]}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
              {horoscope.source.grahas.map((code) => (
                <PlanetGlyph key={code} code={code} withName size="sm" />
              ))}
            </div>
            <p className="font-mono text-data text-muted">{horoscope.source.dashaPath}</p>
            <Button
              variant="secondary"
              size="sm"
              to={paths.chart}
              iconLeft={<Compass className="size-4" />}
              className="mt-1 w-fit"
            >
              Open my chart
            </Button>
          </Card>

          <Card tone="sunken" padding="md" className="gap-1.5">
            <p className="flex items-center gap-1.5 font-mono text-label uppercase text-muted">
              <TriangleAlert aria-hidden className="size-3.5" />
              What this does not show
            </p>
            <p className="text-sm text-purple text-pretty">{horoscope.limits}</p>
          </Card>
        </aside>
      </div>
    </article>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <SectionHeader as="h2" size="sm" title={title} />
      {children}
    </section>
  )
}

function PointList({ items, tone }: { items: string[]; tone: 'positive' | 'caution' }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            aria-hidden
            className={cn(
              'mt-1.5 size-1.5 shrink-0 rounded-full',
              tone === 'positive' ? 'bg-dignity-exalted' : 'bg-caution',
            )}
          />
          <span className="text-sub text-purple text-pretty">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Lucky({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-label uppercase text-muted">{label}</dt>
      <dd className="mt-0.5 font-mono text-data text-ink">{value}</dd>
    </div>
  )
}

function HoroscopeSkeleton() {
  return (
    <div role="status" aria-busy aria-label="Loading your horoscope" className="space-y-8">
      <span className="sr-only">Loading your horoscope…</span>
      <div className="mx-auto max-w-reading space-y-3">
        <Skeleton className="h-2.5 w-48" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="mx-auto max-w-reading border-l-2 border-border py-5 pl-5">
        <Skeleton className="h-6 w-4/5" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
        <div className="space-y-6">
          <SkeletonText lines={3} />
          <SkeletonText lines={3} />
          <SkeletonText lines={2} />
        </div>
        <div className="space-y-4">
          <Skeleton shape="block" className="h-40 w-full" />
          <Skeleton shape="block" className="h-48 w-full" />
        </div>
      </div>
    </div>
  )
}
