import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import {
  FESTIVAL_CATEGORY_LABEL,
  nextFestivals,
} from '@/data/calendar-catalog'
import { paths } from '@/routes/paths'
import type { FestivalCategory, FestivalEntry } from '@/types/astrology'
import { cn } from '@/utils/cn'

const CATEGORIES: { id: 'all' | FestivalCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'major', label: 'Major' },
  { id: 'gazetted', label: 'Gazetted holidays' },
  { id: 'regional', label: 'Regional' },
  { id: 'observance', label: 'Observances' },
]

const TRADITIONS = [
  'North Indian',
  'Bengali',
  'Maharashtrian',
  'Tamil',
  'Telugu',
  'Gujarati',
]

function formatListDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' })
}

export function FestivalsCalendarView({
  festivals,
  year,
  category,
  onCategory,
  onRemind,
  onShowMonth,
}: {
  festivals: FestivalEntry[]
  year: number
  category: 'all' | FestivalCategory
  onCategory: (c: 'all' | FestivalCategory) => void
  onRemind: (festival: FestivalEntry) => void
  onShowMonth: () => void
}) {
  const filtered =
    category === 'all' ? festivals : festivals.filter((f) => f.category === category)
  const upcoming = nextFestivals(`${year}-01-01`, 3)

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(17rem,19rem)] xl:items-start xl:gap-7">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-full border border-border/80 bg-surface px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            Year · {year}
          </span>
          <span className="rounded-full border border-border/80 bg-surface px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            Region · North India
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onCategory(c.id)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                category === c.id
                  ? 'border-copper/50 bg-copper/15 text-ink'
                  : 'border-border text-muted hover:border-border-strong hover:text-ink',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <ul className="space-y-2">
          {filtered.map((festival) => (
            <li key={festival.id}>
              <Card
                padding="md"
                className="flex flex-col gap-3 border-border/80 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-mono text-label uppercase tracking-[0.1em] text-faint">
                    {formatListDate(festival.date)}
                  </p>
                  <Link
                    to={paths.calendarFestival(festival.id)}
                    className="block text-sub font-semibold text-ink hover:text-gold-deep"
                  >
                    {festival.name}
                  </Link>
                  <p className="text-xs text-muted">{festival.hinduDate}</p>
                </div>
                <p className="text-xs text-muted sm:w-28 sm:text-center">{festival.regions}</p>
                <Badge tone={festival.category === 'major' ? 'gold' : 'neutral'} mono>
                  {FESTIVAL_CATEGORY_LABEL[festival.category]}
                </Badge>
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full"
                  iconLeft={<Bell className="size-3.5" />}
                  onClick={() => onRemind(festival)}
                >
                  Remind me
                </Button>
              </Card>
            </li>
          ))}
        </ul>

        <p className="font-mono text-label uppercase tracking-[0.1em] text-faint">
          Showing {filtered.length} of {festivals.length} festivals in {year}
        </p>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6">
        <Card padding="lg" className="gap-3 border-border/80">
          <p className="font-mono text-label uppercase tracking-[0.12em] text-gold-deep">
            Next 30 days
          </p>
          <ul className="space-y-2">
            {upcoming.map((f) => (
              <li key={f.id} className="text-sm text-ink">
                <span className="text-muted">{formatListDate(f.date)}</span>
                <span className="mx-1.5 text-faint">·</span>
                {f.name}
              </li>
            ))}
          </ul>
        </Card>

        <Card padding="lg" className="gap-2 border-border/80">
          <p className="font-mono text-label uppercase tracking-[0.12em] text-gold-deep">
            Traditions
          </p>
          <ul className="space-y-1.5">
            {TRADITIONS.map((t) => (
              <li key={t} className="text-sm text-purple">
                {t}
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-2">
          <Button variant="secondary" size="sm" className="w-full rounded-full" onClick={onShowMonth}>
            See them on the month grid
          </Button>
          <Button variant="primary" size="sm" className="w-full rounded-full" to={`${paths.panchang}?tab=downloads`}>
            Sync festivals to my calendar
          </Button>
        </div>
      </aside>
    </div>
  )
}
