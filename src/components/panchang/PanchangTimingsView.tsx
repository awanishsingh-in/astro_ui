import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { TimingsSubTabs, type TimingsSubId } from '@/components/panchang/PanchangTabs'
import type {
  AvoidWindow,
  ChoghadiyaSlot,
  HoraSlot,
  PanchangDayDetail,
} from '@/data/panchang-mock'
import { cn } from '@/utils/cn'

export function PanchangTimingsView({
  day,
  sub,
  onSub,
  choghadiyaPeriod,
  onChoghadiyaPeriod,
  choghadiya,
  horaSpan,
  onHoraSpan,
  horas,
  avoid,
}: {
  day: PanchangDayDetail
  sub: TimingsSubId
  onSub: (id: TimingsSubId) => void
  choghadiyaPeriod: 'day' | 'night'
  onChoghadiyaPeriod: (p: 'day' | 'night') => void
  choghadiya: ChoghadiyaSlot[]
  horaSpan: 'day' | 'night'
  onHoraSpan: (p: 'day' | 'night') => void
  horas: HoraSlot[]
  avoid: AvoidWindow[]
}) {
  return (
    <Card padding="lg" className="gap-6 border-border/80 sm:p-7">
      <TimingsSubTabs active={sub} onChange={onSub} />

      {sub === 'choghadiya' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-heading font-semibold text-ink">
              Choghadiya — {day.weekdayLabel.split(',')[0]}, {day.date.slice(8)}{' '}
              {monthShort(day.date)}
            </h2>
            <SegmentToggle
              aLabel="Day"
              bLabel="Night"
              value={choghadiyaPeriod}
              aValue="day"
              bValue="night"
              onChange={onChoghadiyaPeriod}
            />
          </div>

          <ul className="space-y-2.5">
            {choghadiya.map((slot) => (
              <li
                key={`${slot.name}-${slot.start}`}
                className={cn(
                  'flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3.5',
                  slot.quality === 'good'
                    ? 'border-copper/30 bg-copper/10'
                    : 'border-critical/25 bg-critical-soft/35',
                  slot.now && 'ring-1 ring-copper/50',
                )}
              >
                <div>
                  <p className="font-semibold text-ink">{slot.name}</p>
                  <p className="font-mono text-sm text-muted">
                    {slot.start} — {slot.end}
                  </p>
                </div>
                {slot.now && (
                  <span className="rounded-full bg-copper px-2.5 py-0.5 font-mono text-[10px] uppercase text-midnight">
                    Now
                  </span>
                )}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-4 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-xs bg-copper/70" /> Good
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-xs bg-critical/50" /> Avoid
              </span>
            </div>
            <Button variant="secondary" size="sm" className="rounded-full" disabled>
              Notify me on Amrit and Shubh
            </Button>
          </div>
        </div>
      )}

      {sub === 'hora' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-heading font-semibold text-ink">Hora — planetary hours</h2>
            <SegmentToggle
              aLabel="Sunrise to sunset"
              bLabel="Sunset to sunrise"
              value={horaSpan}
              aValue="day"
              bValue="night"
              onChange={onHoraSpan}
            />
          </div>

          <ul className="space-y-2">
            {horas.map((slot) => (
              <li
                key={`${slot.planet}-${slot.start}`}
                className={cn(
                  'flex flex-wrap items-center gap-3 rounded-card border border-border/80 px-4 py-3',
                  slot.now && 'border-copper/45 bg-copper/10',
                )}
              >
                <span
                  className={cn(
                    'size-2.5 shrink-0 rounded-full',
                    slot.now ? 'bg-copper' : 'bg-border-strong',
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{slot.planet}</p>
                  <p className="text-xs text-muted text-pretty">{slot.note}</p>
                </div>
                <p className="font-mono text-sm text-muted">
                  {slot.start} – {slot.end}
                </p>
                {slot.now && (
                  <span className="rounded-full bg-copper px-2.5 py-0.5 font-mono text-[10px] uppercase text-midnight">
                    Now
                  </span>
                )}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-xl text-xs text-muted text-pretty">
              Each hora runs one hour from sunrise, so the first hora of the day belongs to the
              weekday’s planet — Saturn on a Saturday.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => onHoraSpan(horaSpan === 'day' ? 'night' : 'day')}
            >
              {horaSpan === 'day' ? 'Show the night hours' : 'Show the day hours'}
            </Button>
          </div>
        </div>
      )}

      {sub === 'rahu' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-heading font-semibold text-ink">
              Rahu kaal & the windows to avoid
            </h2>
            <p className="text-xs text-muted">
              {day.weekdayLabel.split(',')[0]}, {day.date.slice(8)} {monthShort(day.date)} · Delhi
            </p>
          </div>

          <div className="relative h-3 overflow-hidden rounded-full bg-copper/15">
            <div className="absolute inset-y-0 left-[18%] w-[12%] bg-critical/45" />
            <div className="absolute inset-y-0 left-[52%] w-[12%] bg-critical/45" />
            <div className="absolute inset-y-0 left-[0%] w-[10%] bg-critical/35" />
            <div className="absolute inset-y-0 left-[42%] w-[1.5px] bg-copper" />
          </div>
          <div className="flex justify-between font-mono text-[10px] uppercase text-faint">
            <span>{day.sunrise}</span>
            <span>{day.sunset}</span>
          </div>

          <ul className="space-y-2">
            {avoid.map((row) => (
              <li
                key={row.name}
                className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-critical/25 bg-critical-soft/40 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-critical">{row.name}</p>
                  <p className="text-xs text-muted">{row.note}</p>
                </div>
                <p className="font-mono text-sm text-ink">
                  {row.start} — {row.end}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gold-deep">
              Clear right now · <span className="font-semibold">10:44 — 13:48 is open</span>
            </p>
            <Button variant="secondary" size="sm" className="rounded-full" disabled>
              Notify me 15 min before Rahu kaal
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

function SegmentToggle<T extends string>({
  aLabel,
  bLabel,
  value,
  aValue,
  bValue,
  onChange,
}: {
  aLabel: string
  bLabel: string
  value: T
  aValue: T
  bValue: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-1 rounded-full border border-border bg-surface-sunken p-1">
      <button
        type="button"
        onClick={() => onChange(aValue)}
        className={cn(
          'rounded-full px-3 py-1.5 text-sm font-medium',
          value === aValue ? 'bg-copper text-midnight' : 'text-muted',
        )}
      >
        {aLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(bValue)}
        className={cn(
          'rounded-full px-3 py-1.5 text-sm font-medium',
          value === bValue ? 'bg-copper text-midnight' : 'text-muted',
        )}
      >
        {bLabel}
      </button>
    </div>
  )
}

function monthShort(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-IN', { month: 'short' })
}
