import { Card } from '@/components/common/Card'
import type { PanchangDayDetail } from '@/data/panchang-mock'
import { nextSevenTithis } from '@/data/panchang-mock'
import { cn } from '@/utils/cn'

export function PanchangTithiView({ day }: { day: PanchangDayDetail }) {
  const upcoming = nextSevenTithis(day.date)

  return (
    <div className="space-y-6">
      <Card padding="lg" className="gap-7 border-border/80 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-heading font-semibold text-ink">Tithi & nakshatra — right now</h2>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
            Live · 11:20
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Limb
            label="Tithi"
            value={day.tithi}
            ends={`Ends ${day.tithiEnds}`}
            progress={day.progress.tithi}
            bar="bg-copper"
          />
          <Limb
            label="Nakshatra"
            value={`${day.nakshatra} · pada ${day.nakshatraPada}`}
            ends={`Ends ${day.nakshatraEnds} tomorrow`}
            progress={day.progress.nakshatra}
            bar="bg-nebula-plum"
          />
          <Limb
            label="Yoga"
            value={day.yoga}
            ends={`Ends ${day.yogaEnds}`}
            progress={day.progress.yoga}
            bar="bg-gold-deep"
          />
          <Limb
            label="Karana"
            value={day.karana}
            ends={`Ends ${day.karanaEnds}`}
            progress={day.progress.karana}
            bar="bg-navy"
          />
        </div>

        <p className="rounded-card border border-border/70 bg-surface-sunken/60 px-4 py-3 text-sm text-purple text-pretty">
          {day.plainWords}
        </p>
      </Card>

      <div>
        <p className="mb-3 font-mono text-label uppercase tracking-[0.12em] text-faint">
          Next seven days
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {upcoming.map((item) => (
            <Card
              key={item.label}
              padding="md"
              className="items-center gap-1 border-border/80 text-center"
            >
              <p className="font-mono text-label uppercase text-faint">{item.label}</p>
              <p className="text-sm font-semibold text-ink">{item.tithi}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function Limb({
  label,
  value,
  ends,
  progress,
  bar,
}: {
  label: string
  value: string
  ends: string
  progress: number
  bar: string
}) {
  return (
    <div className="space-y-2">
      <p className="font-mono text-label uppercase tracking-[0.12em] text-faint">{label}</p>
      <p className="text-sub font-semibold text-ink">{value}</p>
      <p className="text-xs text-muted">{ends}</p>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
        <div
          className={cn('h-full rounded-full', bar)}
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  )
}
