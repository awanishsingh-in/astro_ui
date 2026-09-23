import { Avatar } from '@/components/common/Avatar'
import { ChartProfilePicker } from '@/components/charts/ChartProfilePicker'
import { RELATION_LABEL, type ChartProfile } from '@/data/profiles'
import type { Chart } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { formatDateLong, formatTime12 } from '@/utils/format'

export interface ChartProfileHeroProps {
  profiles: ChartProfile[]
  profile: ChartProfile
  profileId: string
  chart: Chart | null
  onSelect: (profile: ChartProfile) => void
  className?: string
}

/**
 * Top of My Chart — whose chart, birth line, lagna / Chandra chips.
 */
export function ChartProfileHero({
  profiles,
  profile,
  profileId,
  chart,
  onSelect,
  className,
}: ChartProfileHeroProps) {
  const moon = chart?.grahas.find((g) => g.graha === 'Mo')
  const birth = profile.birthDetails

  return (
    <header
      className={cn(
        'relative overflow-hidden rounded-3xl border border-border/70',
        'bg-[linear-gradient(145deg,color-mix(in_oklab,var(--color-surface)_88%,#3a2418)_0%,var(--color-surface)_45%,color-mix(in_oklab,var(--color-surface)_92%,#1a2838)_100%)]',
        'px-4 py-5 shadow-[0_20px_50px_-36px_rgba(20,12,8,0.65)] sm:px-6 sm:py-6',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-copper/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 left-8 h-40 w-40 rounded-full bg-deep-burgundy/30 blur-3xl"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:gap-4">
          <span className="relative shrink-0">
            <Avatar name={profile.name} size="lg" className="ring-2 ring-copper/40" />
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface bg-copper"
            />
          </span>

          <div className="min-w-0 space-y-1.5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-deep">
              My chart · {RELATION_LABEL[profile.relation]}
            </p>
            <h1 className="truncate font-serif text-[1.85rem] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-title-lg">
              {profile.id === 'self' ? 'Your kundli' : profile.name}
            </h1>
            <p className="text-sm text-muted text-pretty">
              {formatDateLong(birth.date)}
              {' · '}
              {birth.timeUnknown ? 'Time unknown' : formatTime12(birth.time)}
              {' · '}
              {birth.place.label}
            </p>
            {profile.note ? (
              <p className="text-xs text-faint">{profile.note}</p>
            ) : null}
          </div>
        </div>

        <ChartProfilePicker
          profiles={profiles}
          selectedId={profileId}
          onSelect={onSelect}
          className="shrink-0"
        />
      </div>

      {(chart || moon) && (
        <div className="relative mt-5 flex flex-wrap gap-2">
          {chart && (
            <span className="inline-flex items-center gap-2 rounded-full border border-copper/35 bg-copper/12 px-3 py-1.5">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                Lagna
              </span>
              <span className="text-sm font-semibold text-ink">{chart.lagna.rashi}</span>
            </span>
          )}
          {moon && (
            <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/70 px-3 py-1.5">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                Chandra
              </span>
              <span className="text-sm font-semibold text-ink">
                {moon.rashi} · {moon.nakshatra.name}
              </span>
            </span>
          )}
        </div>
      )}
    </header>
  )
}
