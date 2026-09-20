import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import type { PanchangDayDetail } from '@/data/panchang-mock'
import { cn } from '@/utils/cn'

export function PanchangTodayView({
  day,
  onPrev,
  onNext,
  onFindMuhurat,
  onDownload,
}: {
  day: PanchangDayDetail
  onPrev: () => void
  onNext: () => void
  onFindMuhurat: () => void
  onDownload: () => void
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(17rem,20rem)] xl:items-start xl:gap-7">
      <div className="space-y-5">
        <Card
          padding="md"
          className="flex flex-wrap items-center justify-between gap-3 border-border/80 px-4 py-3.5 sm:px-5"
        >
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={onPrev}
              aria-label="Previous day"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <p className="min-w-0 text-sub font-semibold tracking-tight text-ink">
              {day.weekdayLabel}
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={onNext}
              aria-label="Next day"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="rounded-full text-muted" disabled>
            Jump to date
          </Button>
        </Card>

        {/* One sheet: three equal limbs, then auspicious / inauspicious pair */}
        <div className="grid gap-4 sm:grid-cols-3">
          <InfoCard title="Tithi & nakshatra">
            <Row label="Tithi" value={`${day.tithi} → ${day.tithiEnds}`} />
            <Row label="Nakshatra" value={`${day.nakshatra} → ${day.nakshatraEnds}`} />
          </InfoCard>
          <InfoCard title="Yoga & karana">
            <Row label="Yoga" value={`${day.yoga} → ${day.yogaEnds}`} />
            <Row label="Karana" value={`${day.karana} → ${day.karanaEnds}`} />
          </InfoCard>
          <InfoCard title="Sun & moon">
            <Row label="Sunrise" value={day.sunrise} />
            <Row label="Sunset" value={day.sunset} />
            <Row label="Moonrise" value={day.moonrise} />
          </InfoCard>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard title="Auspicious" tone="good">
            <Row label="Abhijit" value={day.abhijit} accent />
            <Row label="Brahma muhurat" value={day.brahmaMuhurat} accent />
          </InfoCard>
          <InfoCard title="Inauspicious" tone="avoid">
            <Row label="Rahu kaal" value={day.rahuKaal} />
            <Row label="Yamaganda" value={day.yamaganda} />
            <Row label="Gulika" value={day.gulika} />
          </InfoCard>
        </div>
      </div>

      <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
        <Card padding="lg" className="gap-4 border-border/80 sm:p-6">
          <div className="space-y-1.5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
              Take it with you
            </p>
            <p className="text-sm leading-relaxed text-ink">
              Download this panchang — PDF or Cal subscription.
            </p>
            <p className="text-xs leading-relaxed text-muted text-pretty">
              Today’s sheet is free. Week, month and year need Standard.
            </p>
          </div>
          <Button variant="primary" size="md" className="w-full rounded-full" onClick={onDownload}>
            Choose range & download
          </Button>
        </Card>

        <Card padding="lg" className="gap-2.5 border-border/80 sm:p-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
            Also on this day
          </p>
          <p className="text-sm leading-relaxed text-purple text-pretty">{day.alsoOnThisDay}</p>
        </Card>

        <Button
          variant="secondary"
          size="md"
          className="w-full rounded-full"
          onClick={onFindMuhurat}
        >
          Find muhurat for {day.date.slice(8)} {monthShort(day.date)}
        </Button>
      </aside>
    </div>
  )
}

function InfoCard({
  title,
  children,
  tone,
  className,
}: {
  title: string
  children: ReactNode
  tone?: 'good' | 'avoid'
  className?: string
}) {
  return (
    <Card
      padding="lg"
      className={cn(
        'h-full gap-4 border-border/80',
        tone === 'good' && 'border-copper/35 bg-copper/8',
        tone === 'avoid' && 'border-critical/30 bg-critical-soft/25',
        className,
      )}
    >
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
        {title}
      </p>
      <dl className="flex flex-1 flex-col justify-center gap-3">{children}</dl>
    </Card>
  )
}

function Row({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd
        className={cn(
          'text-right font-medium leading-snug text-pretty',
          accent ? 'text-gold-deep' : 'text-ink',
        )}
      >
        {value}
      </dd>
    </div>
  )
}

function monthShort(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-IN', { month: 'short' })
}

export function LocationPill({ label = 'Delhi, India' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/90 bg-surface/90 px-3.5 py-2 text-sm text-muted shadow-sm">
      <MapPin className="size-3.5 shrink-0 text-copper" aria-hidden />
      {label}
    </span>
  )
}
