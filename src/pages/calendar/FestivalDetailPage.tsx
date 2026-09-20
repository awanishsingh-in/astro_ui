import { ArrowLeft, CalendarPlus } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { EmptyState } from '@/components/common/EmptyState'
import { SectionHeader } from '@/components/common/SectionHeader'
import { CalendarViewTabs } from '@/components/calendar/CalendarViewTabs'
import { useAuth } from '@/auth/auth-context'
import { festivalById } from '@/data/calendar-catalog'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'
import { MapPin } from 'lucide-react'

/**
 * C4 — Festival detail. Context kept (Calendar tabs), full editorial page.
 */
export default function FestivalDetailPage() {
  const { user } = useAuth()
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const festival = festivalById(id)

  if (!user) return null

  if (!festival) {
    return (
      <PageContainer width="content">
        <EmptyState
          title="Festival not found"
          description="That observance is not in the Cyklos almanac yet."
          action={
            <Button variant="secondary" to={paths.calendar}>
              Back to Calendar
            </Button>
          }
        />
      </PageContainer>
    )
  }

  const when = new Date(`${festival.date}T12:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <PageContainer width="wide">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <SectionHeader
            as="h1"
            size="lg"
            title="Calendar"
            description="Festivals stay with the dates — free and open to read."
          />
          <CalendarViewTabs
            active="festivals"
            onChange={(view) => navigate(`${paths.calendar}?view=${view}`)}
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted"
        >
          <MapPin className="size-3.5" aria-hidden />
          Delhi, India
        </button>
      </header>

      <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,18rem)] xl:items-start">
        <Card padding="lg" className="gap-6 border-border/80">
          <button
            type="button"
            onClick={() => navigate(`${paths.calendar}?view=festivals`)}
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to festivals
          </button>

          <div>
            <h2 className="font-serif text-title text-ink lg:text-title-lg">{festival.name}</h2>
            <p className="mt-1 text-sm text-muted">
              {when} · {festival.hinduDate} · Delhi, India
            </p>
          </div>

          <div className="flex min-h-[10rem] items-center justify-center rounded-card border border-dashed border-border bg-surface-sunken/50">
            <p className="font-mono text-label uppercase tracking-[0.14em] text-faint">
              Hero image / illustration
            </p>
          </div>

          <section className="space-y-2">
            <h3 className="font-mono text-label uppercase tracking-[0.12em] text-gold-deep">
              Significance
            </h3>
            <p className="text-sub text-purple text-pretty">{festival.significance}</p>
          </section>

          <section className="space-y-3">
            <h3 className="font-mono text-label uppercase tracking-[0.12em] text-gold-deep">
              Timings today
            </h3>
            <dl className="space-y-2">
              {festival.timings.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 pb-2"
                >
                  <dt className="text-sm text-muted">{row.label}</dt>
                  <dd className="font-mono text-sm text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="space-y-2">
            <h3 className="font-mono text-label uppercase tracking-[0.12em] text-gold-deep">
              Rituals & regional variants
            </h3>
            <p className="text-sm text-purple text-pretty">{festival.rituals}</p>
          </section>
        </Card>

        <aside className="space-y-4 xl:sticky xl:top-6">
          <Card padding="lg" className="gap-3 border-border/80">
            <p className="font-mono text-label uppercase text-gold-deep">This day</p>
            <p className="text-sm text-muted text-pretty">{festival.blurb}</p>
          </Card>

          {festival.relatedIds && festival.relatedIds.length > 0 && (
            <Card padding="lg" className="gap-2 border-border/80">
              <p className="font-mono text-label uppercase text-gold-deep">Related</p>
              <ul className="space-y-2">
                {festival.relatedIds.map((relatedId) => {
                  const related = festivalById(relatedId)
                  if (!related) return null
                  return (
                    <li key={relatedId}>
                      <Link
                        to={paths.calendarFestival(related.id)}
                        className="block rounded-card border border-border px-3 py-2.5 text-sm text-ink hover:border-copper/40 hover:bg-copper/10"
                      >
                        {related.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </Card>
          )}

          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="w-full rounded-full"
              onClick={() => navigate(`${paths.calendar}?view=festivals`)}
            >
              See all festivals
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="w-full rounded-full"
              iconLeft={<CalendarPlus className="size-3.5" />}
              to={`${paths.panchang}?tab=downloads`}
            >
              Add to my calendar (Cal)
            </Button>
          </div>
        </aside>
      </div>
    </PageContainer>
  )
}
