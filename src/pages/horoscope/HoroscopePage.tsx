import { ArrowLeft, Compass, TriangleAlert } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { ErrorState } from '@/components/common/ErrorState'
import { SectionHeader } from '@/components/common/SectionHeader'
import { CelestialCard } from '@/components/celestial/CelestialCard'
import { GalaxyBackdrop } from '@/components/celestial/GalaxyBackdrop'
import { Skeleton, SkeletonText } from '@/components/common/Skeleton'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { useAuth } from '@/auth/auth-context'
import { chartSeedFor } from '@/data/profiles'
import { useProfiles } from '@/profiles/profiles-context'
import {
  HOROSCOPE_KINDS,
  type Horoscope,
  type HoroscopeKind,
  type YearlyEnrichment,
} from '@/data/horoscope-mock'
import { useAsync } from '@/hooks/useAsync'
import { PageContainer } from '@/layouts/PageContainer'
import { hasYearlyHoroscopeUnlocked } from '@/onboarding/past-intro'
import { paths } from '@/routes/paths'
import { getHoroscope } from '@/services/astrology.service'
import { bhavaRef, BHAVA_SIGNIFIES } from '@/utils/astro'
import { cn } from '@/utils/cn'

/**
 * Full reading for one horoscope kind — opened from the immersive hub.
 * Yearly-personal is a night-sky editorial report; other kinds stay on paper.
 */
export default function HoroscopePage() {
  const { kind } = useParams<{ kind: string }>()
  const { user } = useAuth()
  const { selected } = useProfiles()
  const seed = chartSeedFor(selected)

  const valid = HOROSCOPE_KINDS.includes(kind as HoroscopeKind)
  const yearlyLocked =
    kind === 'yearly-personal' && (!user || !hasYearlyHoroscopeUnlocked(user.id))
  const isYearly = kind === 'yearly-personal'

  const { status, data, error, retry } = useAsync(
    (signal) => getHoroscope(kind as HoroscopeKind, seed, selected.birthDetails.date, signal),
    [kind, seed, selected.birthDetails.date],
  )

  if (!user) return null
  if (!valid) return <Navigate to={paths.horoscopeRoot} replace />
  if (yearlyLocked) return <Navigate to={paths.horoscopeRoot} replace />

  if (isYearly) {
    if (status === 'error') {
      return (
        <PageContainer width="content">
          <ErrorState error={error} onRetry={retry} title="This horoscope did not load" />
        </PageContainer>
      )
    }
    if (status === 'loading' || status === 'idle' || !data?.yearly) {
      return (
        <GalaxyBackdrop intensity="quiet" className="min-h-[70vh]">
          <div className="mx-auto max-w-reading px-5 py-16 sm:px-6">
            <HoroscopeSkeleton yearly />
          </div>
        </GalaxyBackdrop>
      )
    }
    return (
      <YearlyPersonalBody horoscope={data} yearly={data.yearly} profileName={selected.name} />
    )
  }

  return (
    <PageContainer width="content">
      {status === 'error' ? (
        <ErrorState error={error} onRetry={retry} title="This horoscope did not load" />
      ) : status === 'loading' || status === 'idle' || !data ? (
        <HoroscopeSkeleton />
      ) : (
        <HoroscopeBody horoscope={data} />
      )}
    </PageContainer>
  )
}

function YearlyPersonalBody({
  horoscope,
  yearly,
  profileName,
}: {
  horoscope: Horoscope
  yearly: YearlyEnrichment
  profileName: string
}) {
  const navigate = useNavigate()
  const peakMonths = yearly.months.filter((m) => m.peak)

  return (
    <GalaxyBackdrop intensity="quiet" className="min-h-full">
      <article className="relative mx-auto w-full max-w-reading px-5 pb-20 pt-6 sm:px-6 lg:pb-24 lg:pt-8">
        <button
          type="button"
          onClick={() => navigate(paths.horoscopeRoot)}
          className="animate-rise mb-8 inline-flex items-center gap-1.5 text-xs text-on-celestial-muted underline-offset-2 hover:text-on-celestial hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to horoscope
        </button>

        {/* ——— Hero: one composition ——— */}
        <header className="animate-rise space-y-8 border-b border-celestial-line/60 pb-12 sm:space-y-10 sm:pb-14">
          <div className="space-y-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-soft-line">
              Personalised yearly · {horoscope.period.label}
            </p>
            <p className="text-sm text-on-celestial-muted">Written for {profileName}</p>
          </div>

          <h1 className="font-serif text-[2.75rem] font-normal leading-[1.05] tracking-tight text-on-celestial text-balance sm:text-6xl lg:text-[4.25rem]">
            {horoscope.title}
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-on-celestial-muted text-pretty sm:text-lg">
            {horoscope.standfirst}
          </p>

          <blockquote className="relative max-w-2xl pt-2">
            <span
              aria-hidden
              className="absolute -left-1 top-0 font-serif text-5xl leading-none text-copper/50 sm:text-6xl"
            >
              “
            </span>
            <p className="pl-6 font-serif text-2xl font-normal leading-snug text-on-celestial text-balance sm:pl-8 sm:text-3xl">
              {yearly.theme}
            </p>
            <p className="mt-4 pl-6 font-mono text-[11px] uppercase tracking-[0.18em] text-copper sm:pl-8">
              {yearly.themeWords.join(' · ')}
            </p>
          </blockquote>

          <p className="max-w-2xl text-base leading-relaxed text-on-celestial-muted text-pretty sm:text-lg">
            {yearly.opening}
          </p>
        </header>

        {/* ——— Arc ——— */}
        <section className="animate-rise space-y-4 border-b border-celestial-line/50 py-12 sm:py-14">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            The arc
          </p>
          <p className="text-lg leading-relaxed text-ink text-pretty sm:text-xl sm:leading-relaxed">
            {horoscope.overview}
          </p>
        </section>

        {/* ——— Four seasons: vertical timeline ——— */}
        <section className="animate-rise space-y-8 border-b border-celestial-line/50 py-12 sm:py-14">
          <div className="space-y-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
              Four seasons
            </p>
            <h2 className="font-serif text-3xl text-ink sm:text-4xl">How the year moves</h2>
          </div>

          <ol className="relative space-y-0">
            <div
              aria-hidden
              className="absolute bottom-3 left-[0.85rem] top-3 w-px bg-gradient-to-b from-copper via-celestial-line to-transparent sm:left-[1.05rem]"
            />
            {yearly.chapters.map((ch, i) => (
              <li key={ch.id} className="relative flex gap-5 pb-10 last:pb-0 sm:gap-8">
                <span
                  className={cn(
                    'relative z-[1] mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-semibold sm:size-9 sm:text-xs',
                    ch.tone === 'push'
                      ? 'border-copper bg-copper text-midnight shadow-[0_0_20px_-4px_rgba(220,132,79,0.7)]'
                      : 'border-celestial-line bg-midnight text-light-copper',
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                    {ch.eyebrow}
                  </p>
                  <h3 className="font-serif text-2xl text-ink sm:text-[1.75rem]">{ch.title}</h3>
                  <p className="max-w-xl text-base leading-relaxed text-purple text-pretty">
                    {ch.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ——— Life threads: editorial rows, not score cards ——— */}
        <section className="animate-rise space-y-8 border-b border-celestial-line/50 py-12 sm:py-14">
          <div className="space-y-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
              Where energy sits
            </p>
            <h2 className="font-serif text-3xl text-ink sm:text-4xl">Five threads</h2>
            <p className="max-w-lg text-sm text-muted text-pretty">
              Conditions from your chart — not a forecast of what will happen.
            </p>
          </div>

          <ul className="divide-y divide-celestial-line/50">
            {yearly.lifeAreas.map((area) => (
              <li key={area.id} className="grid gap-3 py-6 first:pt-0 last:pb-0 sm:grid-cols-[7rem_1fr] sm:gap-8">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-copper">
                    {area.verdict}
                  </p>
                  <p className="mt-1 font-serif text-xl text-ink">{area.label}</p>
                </div>
                <p className="text-base leading-relaxed text-purple text-pretty sm:pt-5">
                  {area.detail}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ——— Openings / care ——— */}
        <section className="animate-rise grid gap-12 border-b border-celestial-line/50 py-12 sm:grid-cols-2 sm:gap-10 sm:py-14">
          <div className="space-y-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-dignity-exalted">
              Openings
            </p>
            <ul className="space-y-4">
              {horoscope.opportunities.map((item) => (
                <li key={item} className="flex gap-3 text-base leading-relaxed text-ink text-pretty">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-dignity-exalted" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-caution">
              Watch with care
            </p>
            <ul className="space-y-4">
              {horoscope.watchOuts.map((item) => (
                <li key={item} className="flex gap-3 text-base leading-relaxed text-ink text-pretty">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-caution" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ——— Month ribbon ——— */}
        <section className="animate-rise space-y-6 border-b border-celestial-line/50 py-12 sm:py-14">
          <div className="space-y-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
              Month by month
            </p>
            <h2 className="font-serif text-3xl text-ink sm:text-4xl">The year in twelve beats</h2>
            {peakMonths.length > 0 && (
              <p className="text-sm text-muted">
                Peak windows:{' '}
                <span className="text-copper">{peakMonths.map((m) => m.month).join(' · ')}</span>
              </p>
            )}
          </div>

          <div className="-mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden">
            <ol className="flex min-w-max gap-3">
              {yearly.months.map((m) => (
                <li
                  key={m.month}
                  className={cn(
                    'flex w-[9.5rem] shrink-0 flex-col gap-3 rounded-2xl border px-4 py-4',
                    m.peak
                      ? 'border-copper/50 bg-copper/15 shadow-[0_0_28px_-10px_rgba(220,132,79,0.55)]'
                      : 'border-celestial-line/70 bg-indigo-deep/40',
                  )}
                >
                  <span
                    className={cn(
                      'font-mono text-[10px] font-semibold uppercase tracking-[0.12em]',
                      m.peak ? 'text-copper' : 'text-muted',
                    )}
                  >
                    {m.month}
                  </span>
                  <span className="text-sm leading-snug text-ink text-pretty">{m.beat}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ——— Timing ——— */}
        <section className="animate-rise space-y-6 border-b border-celestial-line/50 py-12 sm:py-14">
          <div className="space-y-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
              Windows
            </p>
            <h2 className="font-serif text-3xl text-ink sm:text-4xl">When to push, when to hold</h2>
          </div>
          <ol className="space-y-6">
            {horoscope.timing.map((slot) => (
              <li key={slot.label} className="grid gap-2 sm:grid-cols-[minmax(0,12rem)_1fr] sm:gap-8">
                <p
                  className={cn(
                    'font-mono text-[11px] font-semibold uppercase tracking-[0.12em]',
                    slot.strong ? 'text-copper' : 'text-muted',
                  )}
                >
                  {slot.label}
                </p>
                <p
                  className={cn(
                    'text-base leading-relaxed text-pretty',
                    slot.strong ? 'text-ink' : 'text-purple',
                  )}
                >
                  {slot.note}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ——— Practices ——— */}
        <section className="animate-rise space-y-6 border-b border-celestial-line/50 py-12 sm:py-14">
          <div className="space-y-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
              Keep close
            </p>
            <h2 className="font-serif text-3xl text-ink sm:text-4xl">Practices for the year</h2>
          </div>
          <ol className="space-y-5">
            {yearly.practices.map((line, i) => (
              <li key={line} className="flex gap-4">
                <span className="font-serif text-2xl leading-none text-copper/80">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="pt-1 text-base leading-relaxed text-purple text-pretty">{line}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ——— Closing ——— */}
        <section className="animate-rise space-y-6 py-12 sm:py-14">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-soft-line">
            Closing note
          </p>
          <p className="font-serif text-2xl leading-snug text-on-celestial text-pretty sm:text-3xl">
            {yearly.closing}
          </p>
        </section>

        {/* ——— Source footer ——— */}
        <footer className="animate-rise space-y-6 border-t border-celestial-line/60 pt-10">
          <div className="space-y-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              Read from
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {horoscope.source.bhavas.map((bhava) => (
                <li key={bhava} className="font-mono text-xs text-on-celestial-muted">
                  {bhavaRef(bhava)} · {BHAVA_SIGNIFIES[bhava]}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-3">
              {horoscope.source.grahas.map((code) => (
                <PlanetGlyph key={code} code={code} withName size="sm" tone="dark" />
              ))}
            </div>
            <p className="font-mono text-xs text-muted">{horoscope.source.dashaPath}</p>
          </div>

          <div className="flex items-start gap-2.5 text-sm text-muted text-pretty">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-caution" aria-hidden />
            <p>{horoscope.limits}</p>
          </div>

          <Button
            variant="celestial"
            size="md"
            to={paths.chart}
            iconLeft={<Compass className="size-4" />}
            className="rounded-full"
          >
            Open my chart
          </Button>
        </footer>
      </article>
    </GalaxyBackdrop>
  )
}

function HoroscopeBody({ horoscope }: { horoscope: Horoscope }) {
  return (
    <article className="animate-rise">
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

        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <Card padding="md" className="gap-3">
            <p className="font-mono text-label uppercase text-muted">Read from</p>
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

function HoroscopeSkeleton({ yearly = false }: { yearly?: boolean }) {
  return (
    <div role="status" aria-busy aria-label="Loading your horoscope" className="space-y-8">
      <span className="sr-only">Loading your horoscope…</span>
      <div className="space-y-3">
        <Skeleton className="h-2.5 w-48" />
        <Skeleton className={cn('h-10 w-3/4', yearly && 'h-14')} />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="border-l-2 border-border py-5 pl-5">
        <Skeleton className="h-8 w-4/5" />
      </div>
      <SkeletonText lines={4} />
      <SkeletonText lines={3} />
    </div>
  )
}
