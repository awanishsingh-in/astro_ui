import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { HINDU_MONTHS } from '@/data/calendar-catalog'
import { buildMonthGrid } from '@/data/calendar-mock'
import { cn } from '@/utils/cn'
import { formatDayAndDate } from '@/utils/format'

const WEEKDAYS = [
  { en: 'Sun', hi: 'रवि' },
  { en: 'Mon', hi: 'सोम' },
  { en: 'Tue', hi: 'मंगल' },
  { en: 'Wed', hi: 'बुध' },
  { en: 'Thu', hi: 'गुरु' },
  { en: 'Fri', hi: 'शुक्र' },
  { en: 'Sat', hi: 'शनि' },
] as const

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const YEAR_OPTIONS = Array.from({ length: 21 }, (_, i) => 2016 + i)

const AREAS = [
  { id: 'north', label: 'North India' },
  { id: 'west', label: 'West India' },
  { id: 'south', label: 'South India' },
  { id: 'east', label: 'East India' },
] as const

export type HinduAreaId = (typeof AREAS)[number]['id']

const HINDU_MONTH_ORDER = HINDU_MONTHS.map((m) => m.name)

function isoParts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return { year: y ?? 0, month: (m ?? 1) - 1, day: d ?? 1 }
}

function isSameIso(a: string, b: string) {
  return a.slice(0, 10) === b.slice(0, 10)
}

function isCurrentMonth(iso: string, year: number, month: number) {
  const { year: y, month: m } = isoParts(iso)
  return y === year && m === month
}

function shortTithi(tithi: string) {
  return tithi
    .replace(/^Shukla /, 'शु ')
    .replace(/^Krishna /, 'कृ ')
    .replace('Pratipada', '1')
    .replace('Dwitiya', '2')
    .replace('Tritiya', '3')
    .replace('Chaturthi', '4')
    .replace('Panchami', '5')
    .replace('Shashthi', '6')
    .replace('Saptami', '7')
    .replace('Ashtami', '8')
    .replace('Navami', '9')
    .replace('Dashami', '10')
    .replace('Ekadashi', '11')
    .replace('Dwadashi', '12')
    .replace('Trayodashi', '13')
    .replace('Chaturdashi', '14')
}

function adjustHinduMonth(
  name: string | undefined,
  paksha: 'Shukla' | 'Krishna',
  reckoning: 'amanta' | 'purnimanta',
): string {
  if (!name) return '—'
  if (reckoning === 'amanta') return name
  // Purnimanta (north): Krishna paksha is named for the following month.
  if (paksha !== 'Krishna') return name
  const idx = HINDU_MONTH_ORDER.indexOf(name as (typeof HINDU_MONTH_ORDER)[number])
  if (idx < 0) return name
  return HINDU_MONTH_ORDER[(idx + 1) % HINDU_MONTH_ORDER.length] ?? name
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

export function HinduCalendarView({
  year,
  month,
  selectedIso,
  todayIso,
  paksha,
  onPaksha,
  reckoning,
  onReckoning,
  area,
  onAreaChange,
  onSelect,
  onShiftMonth,
  onNavigate,
  onSwitchGregorian,
}: {
  year: number
  month: number
  selectedIso: string
  todayIso: string
  paksha: 'Shukla' | 'Krishna' | 'all'
  onPaksha: (p: 'Shukla' | 'Krishna' | 'all') => void
  reckoning: 'amanta' | 'purnimanta'
  onReckoning: (r: 'amanta' | 'purnimanta') => void
  area: HinduAreaId
  onAreaChange: (area: HinduAreaId) => void
  onSelect: (iso: string) => void
  onShiftMonth: (delta: number) => void
  onNavigate: (year: number, month: number) => void
  onSwitchGregorian: () => void
}) {
  const days = useMemo(() => buildMonthGrid(year, month), [year, month])
  const yearChoices = YEAR_OPTIONS.includes(year)
    ? YEAR_OPTIONS
    : [...YEAR_OPTIONS, year].sort((a, b) => a - b)
  const areaMeta = AREAS.find((a) => a.id === area) ?? AREAS[0]

  const inMonthDays = days.filter((d) => isCurrentMonth(d.date, year, month))
  const hinduSpan = useMemo(() => {
    const names = [
      ...new Set(
        inMonthDays.map((d) => adjustHinduMonth(d.hinduMonth, d.paksha, reckoning)),
      ),
    ]
    if (names.length === 0) return '—'
    if (names.length === 1) return names[0]
    return `${names[0]} – ${names[names.length - 1]}`
  }, [inMonthDays, reckoning])

  const selected =
    days.find((d) => isSameIso(d.date, selectedIso)) ??
    inMonthDays.find((d) => isSameIso(d.date, todayIso)) ??
    inMonthDays[0] ??
    null

  const festivalCount = inMonthDays.filter((d) =>
    d.events.some((e) => e.kind === 'festival'),
  ).length
  const vratCount = inMonthDays.filter((d) =>
    d.events.some((e) => e.kind === 'vrat' || e.kind === 'ekadashi'),
  ).length
  const ekadashiCount = inMonthDays.filter((d) =>
    d.events.some((e) => e.kind === 'ekadashi'),
  ).length

  const selectedHinduMonth = selected
    ? adjustHinduMonth(selected.hinduMonth, selected.paksha, reckoning)
    : hinduSpan

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(17rem,19rem)] xl:items-start xl:gap-7">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Year"
            value={String(year)}
            onChange={(value) => onNavigate(Number(value), month)}
            options={yearChoices.map((y) => ({ value: String(y), label: String(y) }))}
          />
          <FilterSelect
            label="Month"
            value={String(month)}
            onChange={(value) => onNavigate(year, Number(value))}
            options={MONTHS.map((label, i) => ({ value: String(i), label }))}
          />
          <FilterSelect
            label="Area"
            value={area}
            onChange={(value) => onAreaChange(value as HinduAreaId)}
            options={AREAS.map((a) => ({ value: a.id, label: a.label }))}
          />
        </div>

        <Card padding="none" className="overflow-hidden border-border/80">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 bg-gradient-to-r from-copper/20 via-surface to-navy-soft/80 px-4 py-4 sm:px-5">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                aria-label="Previous month"
                onClick={() => onShiftMonth(-1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div>
                <h2 className="text-heading font-semibold text-ink">
                  {MONTHS[month]} {year}
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  {hinduSpan} · Vikram Samvat {year + 57} · Shaka {year - 78}
                </p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                  {areaMeta.label} · {reckoning === 'amanta' ? 'Amanta' : 'Purnimanta'}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                aria-label="Next month"
                onClick={() => onShiftMonth(1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <div className="flex gap-1 rounded-full border border-border bg-surface-sunken/80 p-1">
              {([
                { id: 'all' as const, label: 'All' },
                { id: 'Shukla' as const, label: 'Shukla' },
                { id: 'Krishna' as const, label: 'Krishna' },
              ]).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPaksha(p.id)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm font-medium transition',
                    paksha === p.id ? 'bg-copper text-midnight' : 'text-muted hover:text-ink',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-border/60 bg-surface-sunken/60">
            {WEEKDAYS.map((label, i) => (
              <div
                key={label.en}
                className={cn(
                  'px-1 py-2.5 text-center sm:px-1.5',
                  i === 0 && 'bg-copper/10',
                )}
              >
                <p
                  className={cn(
                    'font-mono text-[10px] font-semibold uppercase tracking-[0.1em]',
                    i === 0 ? 'text-copper' : 'text-muted',
                  )}
                >
                  {label.hi}
                </p>
                <p className="text-[9px] text-faint">{label.en}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border/45">
            {days.map((day, index) => {
              const { day: dayNum } = isoParts(day.date)
              const inMonth = isCurrentMonth(day.date, year, month)
              const isToday = isSameIso(day.date, todayIso)
              const isSelected = selected ? isSameIso(day.date, selected.date) : false
              const weekday = new Date(`${day.date}T12:00:00`).getDay()
              const isSunday = weekday === 0
              const pakshaMatch = paksha === 'all' || day.paksha === paksha
              const headline =
                day.events.find((e) => e.kind === 'festival') ??
                day.events.find((e) => e.kind === 'ekadashi') ??
                day.events.find((e) => e.kind === 'vrat')
              const isPurnima = day.tithi === 'Purnima'
              const isAmavasya = day.tithi === 'Amavasya'
              const displayMonth = adjustHinduMonth(day.hinduMonth, day.paksha, reckoning)
              const prev = index > 0 ? days[index - 1] : null
              const prevMonth = prev
                ? adjustHinduMonth(prev.hinduMonth, prev.paksha, reckoning)
                : null
              const monthEdge = inMonth && Boolean(displayMonth) && displayMonth !== prevMonth

              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => onSelect(day.date.slice(0, 10))}
                  className={cn(
                    'relative flex min-h-[7.25rem] flex-col gap-0.5 p-1.5 text-left transition-colors sm:min-h-[8.5rem] sm:p-2',
                    !inMonth && 'bg-surface-sunken/35 opacity-40',
                    inMonth && 'bg-surface/95',
                    inMonth && !pakshaMatch && 'opacity-40',
                    isSelected && 'bg-copper/14 ring-1 ring-inset ring-copper/55',
                    !isSelected && inMonth && pakshaMatch && 'hover:bg-navy-soft/55',
                    isSunday && inMonth && 'bg-copper/[0.06]',
                  )}
                >
                  <div className="flex w-full items-start justify-between gap-0.5">
                    <span className="font-mono text-[9px] leading-tight text-muted">
                      {shortTithi(day.tithi)}
                    </span>
                    {(isPurnima || isAmavasya) && (
                      <span
                        aria-hidden
                        className={cn(
                          'mt-0.5 size-2 shrink-0 rounded-full border',
                          isPurnima
                            ? 'border-gold-deep/80 bg-gold-deep/30'
                            : 'border-ink/50 bg-ink/80',
                        )}
                      />
                    )}
                  </div>

                  <span
                    className={cn(
                      'text-lg font-semibold leading-none sm:text-xl',
                      isToday && 'text-copper',
                      !isToday && isSunday && 'text-copper',
                      !isToday && !isSunday && 'text-ink',
                    )}
                  >
                    {dayNum}
                  </span>

                  {monthEdge && (
                    <span className="font-mono text-[8px] font-semibold uppercase tracking-wide text-copper">
                      {displayMonth}
                    </span>
                  )}

                  {inMonth && (
                    <div className="mt-auto space-y-0.5 pt-1">
                      {day.chandraRashi && (
                        <p className="truncate text-[9px] leading-tight text-muted">
                          <span className="text-faint">○</span> {day.chandraRashi}
                          {day.chandraRashiAt ? (
                            <span className="text-faint"> {day.chandraRashiAt}</span>
                          ) : null}
                        </p>
                      )}
                      <p className="truncate text-[9px] leading-tight text-muted">
                        <span className="text-faint">☆</span> {day.nakshatra}
                      </p>
                      {headline && (
                        <p
                          className={cn(
                            'line-clamp-2 text-[10px] font-semibold leading-snug',
                            headline.kind === 'festival' ? 'text-copper' : 'text-gold-deep',
                          )}
                        >
                          {headline.name}
                        </p>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border/70 bg-surface-sunken/40 px-4 py-3">
            <LegendItem mark="○" label="Chandra rashi" />
            <LegendItem mark="☆" label="Nakshatra" />
            <LegendItem mark="●" label="Amavasya" />
            <LegendItem mark="◐" label="Purnima" />
            <p className="ml-auto font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
              Festivals & observances · {MONTHS[month]} {year}
            </p>
          </div>
        </Card>

        <div className="border-t border-border/70 pt-4">
          <p className="font-mono text-label uppercase tracking-[0.12em] text-faint">Reckoning</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onReckoning('amanta')}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm',
                reckoning === 'amanta'
                  ? 'border-copper/45 bg-copper/15 text-ink'
                  : 'border-border text-muted',
              )}
            >
              Amanta (south & west)
            </button>
            <button
              type="button"
              onClick={() => onReckoning('purnimanta')}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm',
                reckoning === 'purnimanta'
                  ? 'border-copper/45 bg-copper/15 text-ink'
                  : 'border-border text-muted',
              )}
            >
              Purnimanta (north)
            </button>
          </div>
          <p className="mt-2 text-xs text-muted text-pretty">
            Changing this shifts every month name by one fortnight — the Gregorian dates do not
            move.
          </p>
        </div>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6">
        <Card padding="lg" className="gap-3 border-border/80">
          <p className="font-mono text-label uppercase text-gold-deep">
            {selected ? formatDayAndDate(selected.date) : 'Select a day'}
          </p>
          {selected && (
            <>
              <div>
                <h3 className="text-heading font-semibold text-ink">
                  {selectedHinduMonth} · {selected.paksha} Paksha
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {selected.tithi}
                  {selected.tithiEnds ? ` → ${selected.tithiEnds}` : ''}
                </p>
              </div>
              <dl className="space-y-2 border-y border-border/70 py-3">
                <DetailRow label="Nakshatra" value={selected.nakshatra} />
                <DetailRow
                  label="Chandra rashi"
                  value={
                    selected.chandraRashi
                      ? `${selected.chandraRashi}${selected.chandraRashiAt ? ` · ${selected.chandraRashiAt}` : ''}`
                      : '—'
                  }
                />
                <DetailRow label="Yoga" value={selected.yoga} />
                <DetailRow label="Karana" value={selected.karana} />
                <DetailRow label="Vaar" value={selected.vaar} />
                {selected.sunrise && <DetailRow label="Sunrise" value={selected.sunrise} />}
                {selected.rahuKaal && <DetailRow label="Rahu kaal" value={selected.rahuKaal} />}
              </dl>
              {selected.events.length > 0 ? (
                <ul className="space-y-1.5">
                  {selected.events.map((event) => (
                    <li key={`${event.kind}-${event.name}`} className="text-sm text-ink">
                      <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
                        {event.kind}
                      </span>
                      <span className="mt-0.5 block font-medium">{event.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">No festival or vrat on this day.</p>
              )}
            </>
          )}
        </Card>

        <Card padding="lg" className="gap-1.5 border-border/80">
          <p className="font-mono text-label uppercase text-gold-deep">This month holds</p>
          <p className="text-sm text-purple">
            {festivalCount} festival{festivalCount === 1 ? '' : 's'} · {vratCount} vrat day
            {vratCount === 1 ? '' : 's'}
          </p>
          <p className="text-sm text-purple">
            {ekadashiCount} Ekadashi{ekadashiCount === 1 ? '' : 's'}
          </p>
          <p className="text-sm text-purple">{hinduSpan}</p>
        </Card>

        <Card padding="lg" className="gap-2 border-border/80">
          <p className="font-mono text-label uppercase text-gold-deep">Hindu months</p>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
            {HINDU_MONTHS.map((m) => {
              const active = hinduSpan.includes(m.name)
              return (
                <li
                  key={m.id}
                  className={cn('text-xs', active ? 'font-semibold text-ink' : 'text-muted')}
                >
                  {m.name}
                </li>
              )
            })}
          </ul>
        </Card>

        <Button
          variant="secondary"
          size="sm"
          className="w-full rounded-full"
          onClick={onSwitchGregorian}
        >
          Switch to the Gregorian month
        </Button>
      </aside>
    </div>
  )
}

function LegendItem({ mark, label }: { mark: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
      <span className="text-faint">{mark}</span>
      {label}
    </span>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{label}</dt>
      <dd className="text-right text-sm text-ink">{value}</dd>
    </div>
  )
}
