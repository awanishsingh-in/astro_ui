import { Clock3, MapPin, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import type { BirthDetails } from '@/types/user'
import { GENDER_LABEL, normalizeGender } from '@/types/user'
import { cn } from '@/utils/cn'
import { formatDateLong, formatTime12 } from '@/utils/format'

export interface ChartBasicPanelProps {
  birth: BirthDetails
  className?: string
}

/**
 * Basic tab — birth time as the hero fact, with date and place beside it.
 */
export function ChartBasicPanel({ birth, className }: ChartBasicPanelProps) {
  const gender = normalizeGender(birth.gender)
  const timeLabel = birth.timeUnknown ? 'Unknown' : formatTime12(birth.time)

  return (
    <div className={cn('animate-rise space-y-5', className)}>
      <div className="space-y-1.5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
          Basic
        </p>
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Birth moment
        </h2>
        <p className="max-w-lg text-sm leading-relaxed text-muted text-pretty">
          Everything on this chart is measured from this clock. Edit it anytime from Profile.
        </p>
      </div>

      <article
        className={cn(
          'relative overflow-hidden rounded-3xl border border-copper/30',
          'bg-[radial-gradient(120%_90%_at_10%_0%,rgba(196, 160, 255,0.22),transparent_55%),linear-gradient(160deg,color-mix(in_oklab,var(--color-surface)_85%,#1a0f3d)_0%,var(--color-surface)_100%)]',
          'px-5 py-8 text-center sm:px-8 sm:py-10',
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-copper/50 to-transparent"
        />
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-deep">
          Birth time
        </p>
        <p
          className={cn(
            'mt-3 font-serif font-semibold tracking-tight text-ink',
            birth.timeUnknown ? 'text-3xl sm:text-4xl' : 'text-5xl sm:text-6xl',
          )}
        >
          {timeLabel}
        </p>
        {!birth.timeUnknown && (
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">
            Local time at the birth place
          </p>
        )}
        {birth.timeUnknown && (
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted text-pretty">
            Without a time, lagna and houses are approximate. Add one from Profile when you know it.
          </p>
        )}
      </article>

      <div className="grid gap-3 sm:grid-cols-3">
        <Fact
          icon={<Clock3 className="size-4" />}
          label="Date"
          value={formatDateLong(birth.date)}
        />
        <Fact
          icon={<MapPin className="size-4" />}
          label="Place"
          value={birth.place.label}
        />
        <Fact
          icon={<Sparkles className="size-4" />}
          label="Gender"
          value={gender ? GENDER_LABEL[gender] : '—'}
        />
      </div>
    </div>
  )
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-surface/80 px-4 py-4">
      <div className="flex items-center gap-2 text-copper">
        {icon}
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          {label}
        </p>
      </div>
      <p className="mt-2 text-sm font-medium leading-snug text-ink text-pretty">{value}</p>
    </div>
  )
}
