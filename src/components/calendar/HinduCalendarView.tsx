import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { HINDU_MONTHS, TITHI_NAMES } from '@/data/calendar-catalog'
import { cn } from '@/utils/cn'

export function HinduCalendarView({
  year,
  monthName = 'Bhadrapada',
  paksha,
  onPaksha,
  reckoning,
  onReckoning,
  selectedTithi,
  onSelectTithi,
  onSwitchGregorian,
}: {
  year: number
  monthName?: string
  paksha: 'Shukla' | 'Krishna'
  onPaksha: (p: 'Shukla' | 'Krishna') => void
  reckoning: 'amanta' | 'purnimanta'
  onReckoning: (r: 'amanta' | 'purnimanta') => void
  selectedTithi: number
  onSelectTithi: (i: number) => void
  onSwitchGregorian: () => void
}) {
  // Deterministic Gregorian anchors for the mock fortnight.
  const baseDay = paksha === 'Shukla' ? 5 : 20

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(17rem,19rem)] xl:items-start xl:gap-7">
      <Card padding="lg" className="gap-6 border-border/80 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="rounded-full" aria-label="Previous">
              <ChevronLeft className="size-4" />
            </Button>
            <div>
              <h2 className="text-heading font-semibold text-ink">
                {monthName} · {paksha} Paksha
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Vikram Samvat {year + 57} · Shaka {year - 78} ·{' '}
                {paksha === 'Shukla' ? 'waxing' : 'waning'} fortnight
              </p>
            </div>
            <Button variant="secondary" size="sm" className="rounded-full" aria-label="Next">
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="flex gap-1 rounded-full border border-border bg-surface-sunken p-1">
            {(['Shukla', 'Krishna'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPaksha(p)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium',
                  paksha === p ? 'bg-copper text-midnight' : 'text-muted hover:text-ink',
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {TITHI_NAMES.map((name, index) => {
            const label = index === 14 ? (paksha === 'Shukla' ? 'Purnima' : 'Amavasya') : name
            const gregDay = baseDay + index
            const selected = selectedTithi === index
            const isVrat = index === 10
            const isFestival = index === 14 && paksha === 'Shukla'
            return (
              <button
                key={`${paksha}-${name}`}
                type="button"
                onClick={() => onSelectTithi(index)}
                className={cn(
                  'flex min-h-[5.5rem] flex-col rounded-card border px-3 py-3 text-left transition-colors',
                  selected
                    ? 'border-copper/50 bg-copper/15'
                    : 'border-border bg-surface hover:bg-navy-soft/60',
                )}
              >
                <span className="text-sm font-semibold text-ink">{label}</span>
                <span className="mt-1 font-mono text-label uppercase text-muted">
                  {String(Math.min(gregDay, 28)).padStart(2, '0')} Sep
                </span>
                {isVrat && (
                  <span className="mt-auto pt-2 font-mono text-[10px] uppercase text-gold-deep">
                    Vrat
                  </span>
                )}
                {isFestival && (
                  <span className="mt-auto pt-2 font-mono text-[10px] uppercase text-copper">
                    Festival
                  </span>
                )}
              </button>
            )
          })}
        </div>

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
            Changing this shifts every month name by one fortnight — the dates do not move.
          </p>
        </div>
      </Card>

      <aside className="space-y-4 xl:sticky xl:top-6">
        <Card padding="lg" className="gap-2 border-border/80">
          <p className="font-mono text-label uppercase text-gold-deep">The year at a glance</p>
          <ul className="space-y-1.5">
            {HINDU_MONTHS.map((m) => (
              <li
                key={m.id}
                className={cn(
                  'text-sm',
                  m.name === monthName ? 'font-semibold text-ink' : 'text-muted',
                )}
              >
                {m.name} ({m.range})
              </li>
            ))}
          </ul>
        </Card>

        <Card tone="sunken" padding="md" className="gap-1">
          <p className="text-sm text-ink text-pretty">
            Adhik maas (extra month) next falls in 2029. Kshaya maas: none this year.
          </p>
        </Card>

        <Card padding="lg" className="gap-1.5 border-border/80">
          <p className="font-mono text-label uppercase text-gold-deep">This month holds</p>
          <p className="text-sm text-purple">4 festivals · 6 vrat days</p>
          <p className="text-sm text-purple">Sankranti on 17 Sep</p>
          <p className="text-sm text-purple">2 Ekadashis</p>
        </Card>

        <Button variant="secondary" size="sm" className="w-full rounded-full" onClick={onSwitchGregorian}>
          Switch to the Gregorian month
        </Button>
      </aside>
    </div>
  )
}
