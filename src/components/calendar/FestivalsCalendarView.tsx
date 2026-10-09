import { Bell, CalendarPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { useToast } from '@/components/feedback/toast-context'
import {
  FESTIVAL_CATEGORY_LABEL,
  nextFestivals,
} from '@/data/calendar-catalog'
import { paths } from '@/routes/paths'
import type { FestivalCategory, FestivalEntry } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { downloadEventsIcs } from '@/utils/event-calendar'

const CATEGORIES: { id: 'all' | FestivalCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'major', label: 'Major' },
  { id: 'gazetted', label: 'Gazetted holidays' },
  { id: 'regional', label: 'Regional' },
  { id: 'observance', label: 'Observances' },
]

const YEAR_OPTIONS = Array.from({ length: 21 }, (_, i) => 2016 + i)

const REGIONS = [
  { id: 'north', label: 'North India', match: /north|pan-india|delhi|punjab|uttar|haryana/i },
  { id: 'west', label: 'West India', match: /west|maharashtra|gujarat|rajasthan|pan-india/i },
  { id: 'south', label: 'South India', match: /south|tamil|telugu|kerala|karnataka|pan-india/i },
  { id: 'east', label: 'East India', match: /east|bengal|odisha|assam|pan-india/i },
  { id: 'pan', label: 'Pan-India', match: /pan-india|\S+/i },
] as const

type FestivalRegionId = (typeof REGIONS)[number]['id']

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

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="group relative inline-flex items-center">
      <span
        className={cn(
          'relative inline-flex items-center rounded-full border border-border/80',
          'bg-surface px-3.5 py-1.5',
          'shadow-[0_0_0_1px_rgba(124,77,255,0.06)]',
          'transition group-hover:border-copper/45 group-hover:bg-copper/10',
        )}
      >
        <span className="pointer-events-none mr-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
          {label} ·
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className={cn(
            'appearance-none bg-transparent pr-5',
            'font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink',
            'outline-none',
          )}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.65em] text-copper"
        >
          ▾
        </span>
      </span>
    </label>
  )
}

export function FestivalsCalendarView({
  festivals,
  year,
  category,
  region,
  onYearChange,
  onCategory,
  onRegionChange,
  onRemind,
  onShowMonth,
}: {
  festivals: FestivalEntry[]
  year: number
  category: 'all' | FestivalCategory
  region: FestivalRegionId
  onYearChange: (year: number) => void
  onCategory: (c: 'all' | FestivalCategory) => void
  onRegionChange: (region: FestivalRegionId) => void
  onRemind: (festival: FestivalEntry) => void
  onShowMonth: () => void
}) {
  const toast = useToast()
  const regionMeta = REGIONS.find((r) => r.id === region) ?? REGIONS[0]
  const byCategory =
    category === 'all' ? festivals : festivals.filter((f) => f.category === category)
  const filtered =
    region === 'pan'
      ? byCategory
      : byCategory.filter((f) => regionMeta.match.test(f.regions))
  const upcoming = nextFestivals(`${year}-01-01`, 3)
  const yearChoices = YEAR_OPTIONS.includes(year)
    ? YEAR_OPTIONS
    : [...YEAR_OPTIONS, year].sort((a, b) => a - b)

  function syncFestivalsToGoogle() {
    if (filtered.length === 0) {
      toast.info('No festivals to sync', { description: 'Try another year, region, or category.' })
      return
    }
    downloadEventsIcs(
      filtered.map((f) => ({
        id: f.id,
        title: f.name,
        dateIso: f.date,
        description: `${f.hinduDate} · ${f.regions}`,
      })),
      `cyklos-festivals-${year}.ics`,
      `Cyklos festivals ${year}`,
    )
    window.open('https://calendar.google.com/calendar/u/0/r/settings/export', '_blank')
    toast.success('Ready for Google Calendar', {
      description: `${filtered.length} festival${filtered.length === 1 ? '' : 's'} downloaded. In Google Calendar choose Import and select the .ics file.`,
    })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(17rem,19rem)] xl:items-start xl:gap-7">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <FilterSelect
            label="Year"
            value={String(year)}
            onChange={(value) => onYearChange(Number(value))}
            options={yearChoices.map((y) => ({ value: String(y), label: String(y) }))}
          />
          <FilterSelect
            label="Region"
            value={region}
            onChange={(value) => onRegionChange(value as FestivalRegionId)}
            options={REGIONS.map((r) => ({ value: r.id, label: r.label }))}
          />
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
          Showing {filtered.length} of {festivals.length} festivals in {year} · {regionMeta.label}
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
          <Button
            variant="primary"
            size="sm"
            className="w-full rounded-full"
            iconLeft={<CalendarPlus className="size-3.5" />}
            onClick={syncFestivalsToGoogle}
          >
            Sync festivals to Google Calendar
          </Button>
        </div>
      </aside>
    </div>
  )
}

export type { FestivalRegionId }
