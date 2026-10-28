import { useState, type ReactNode } from 'react'
import { ChevronDown, Moon, Sparkles, Sun } from 'lucide-react'
import { Card } from '@/components/common/Card'
import type { PanchangDayDetail } from '@/data/panchang-mock'
import { panchangClock } from '@/data/panchang-mock'
import { cn } from '@/utils/cn'

type SectionId =
  | 'sunmoon'
  | 'limbs'
  | 'samvat'
  | 'ritu'
  | 'auspicious'
  | 'inauspicious'
  | 'events'

const DEFAULT_OPEN: Record<SectionId, boolean> = {
  sunmoon: true,
  limbs: true,
  samvat: true,
  ritu: true,
  auspicious: true,
  inauspicious: true,
  events: true,
}

/**
 * Core Hindi panchang day detail — collapsible sections for the selected day.
 * Layout inspired by classic day almanacs; Cyklos styling and original mock copy.
 */
export function HindiPanchangDayDetail({ day }: { day: PanchangDayDetail }) {
  const [open, setOpen] = useState(DEFAULT_OPEN)

  function toggle(id: SectionId) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-3">
      <Card padding="none" className="overflow-hidden border-border/80">
        <div className="space-y-2 px-4 py-4 sm:px-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-silver-400">
            Selected day
          </p>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="text-base font-semibold text-ink">{day.lunarDayLabel}</p>
              <p className="text-sm text-muted">
                {day.tithiPaksha} Paksha · {day.tithiName}
              </p>
              <p className="text-xs text-faint">
                {day.vikramSamvat} · {day.samvatsara}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-ink">{day.weekdayLabel}</p>
            </div>
          </div>
          {day.dayEvents.length > 0 && (
            <p className="border-t border-border/60 pt-2 text-xs leading-relaxed text-purple text-pretty">
              {day.dayEvents.map((e) => e.name).join(' · ')}
            </p>
          )}
        </div>
      </Card>

      <DetailSection
        id="sunmoon"
        title="Sunrise and moonrise"
        open={open.sunmoon}
        onToggle={() => toggle('sunmoon')}
      >
        <FactCell
          label="Sunrise"
          value={panchangClock(day.sunrise)}
          icon={<Sun className="size-3.5" strokeWidth={1.75} />}
        />
        <FactCell
          label="Sunset"
          value={panchangClock(day.sunset)}
          icon={<Sun className="size-3.5" strokeWidth={1.75} />}
        />
        <FactCell
          label="Moonrise"
          value={panchangClock(day.moonrise)}
          icon={<Moon className="size-3.5" strokeWidth={1.75} />}
        />
        <FactCell
          label="Moonset"
          value={panchangClock(day.moonset)}
          icon={<Moon className="size-3.5" strokeWidth={1.75} />}
        />
      </DetailSection>

      <DetailSection
        id="limbs"
        title="Panchang"
        open={open.limbs}
        onToggle={() => toggle('limbs')}
      >
        <FactCell
          label="Tithi"
          value={`${day.tithiName} upto ${panchangClock(day.tithiEnds)}, then ${day.nextTithi}`}
          icon={<Moon className="size-3.5" strokeWidth={1.75} />}
        />
        <FactCell
          label="Nakshatra"
          value={`${day.nakshatra} · pada ${day.nakshatraPada} upto ${panchangClock(day.nakshatraEnds)}`}
          icon={<Sparkles className="size-3.5" strokeWidth={1.75} />}
        />
        <FactCell label="Yoga" value={`${day.yoga} upto ${panchangClock(day.yogaEnds)}`} />
        <FactCell label="Karana" value={`${day.karana} upto ${panchangClock(day.karanaEnds)}`} />
        <FactCell label="Weekday" value={day.vaara} />
        <FactCell label="Paksha" value={`${day.tithiPaksha} Paksha`} />
      </DetailSection>

      <DetailSection
        id="samvat"
        title="Lunar month and samvat"
        open={open.samvat}
        onToggle={() => toggle('samvat')}
      >
        <FactCell label="Vikram Samvat" value={day.vikramSamvat.replace(/^Vikram Samvat /, '')} />
        <FactCell label="Shaka Samvat" value={day.shakaSamvat.replace(/^Shaka Samvat /, '')} />
        <FactCell label="Samvatsara" value={day.samvatsara} />
        <FactCell label="Chandramasa" value={day.chandramasaPurnimanta} />
        <FactCell label="Amanta masa" value={day.chandramasaAmanta} />
        <FactCell label="Moon phase" value={day.moonPhase} />
      </DetailSection>

      <DetailSection
        id="ritu"
        title="Ritu and ayana"
        open={open.ritu}
        onToggle={() => toggle('ritu')}
      >
        <FactCell label="Drik ritu" value={day.drikRitu} />
        <FactCell label="Vedic ritu" value={day.vedicRitu} />
        <FactCell label="Drik ayana" value={day.drikAyana} />
        <FactCell label="Vedic ayana" value={day.vedicAyana} />
        <FactCell label="Dinamana" value={day.dinamana} />
        <FactCell label="Ratrimana" value={day.ratrimana} />
        <FactCell label="Madhyahna" value={panchangClock(day.madhyahna)} className="sm:col-span-2" />
      </DetailSection>

      <DetailSection
        id="auspicious"
        title="Auspicious timings"
        open={open.auspicious}
        onToggle={() => toggle('auspicious')}
      >
        <FactCell label="Brahma muhurat" value={formatRange(day.brahmaMuhurat)} />
        <FactCell label="Abhijit" value={formatRange(day.abhijit)} />
        <FactCell label="Godhuli" value={formatRange(day.godhuliMuhurat)} />
        <FactCell label="Amrit kalam" value={formatRange(day.amritKalam)} />
      </DetailSection>

      <DetailSection
        id="inauspicious"
        title="Inauspicious timings"
        open={open.inauspicious}
        onToggle={() => toggle('inauspicious')}
      >
        <FactCell label="Rahu kaal" value={formatRange(day.rahuKaal)} />
        <FactCell label="Yamaganda" value={formatRange(day.yamaganda)} />
        <FactCell label="Gulikai" value={formatRange(day.gulika)} />
        <FactCell label="Dur muhurat" value={formatRange(day.durMuhurat)} />
      </DetailSection>

      <DetailSection
        id="events"
        title="Day festivals and events"
        open={open.events}
        onToggle={() => toggle('events')}
      >
        {day.dayEvents.length === 0 ? (
          <p className="col-span-full px-3 py-3 text-sm text-muted text-pretty">{day.alsoOnThisDay}</p>
        ) : (
          day.dayEvents.map((event) => (
            <div
              key={event.name}
              className="flex flex-col gap-0.5 border-b border-border/40 px-3 py-2.5 last:border-b-0 sm:border-b-0 sm:odd:border-r sm:odd:border-border/40"
            >
              <p className="text-sm font-semibold text-ink">{event.name}</p>
              {event.note && <p className="text-xs text-muted">{event.note}</p>}
            </div>
          ))
        )}
      </DetailSection>
    </div>
  )
}

function DetailSection({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: SectionId
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <Card padding="none" className="overflow-hidden border-border/80">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`panchang-section-${id}`}
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between gap-3 px-3.5 py-2.5',
          'bg-surface-sunken/70 text-left transition hover:bg-copper/10',
        )}
      >
        <span className="text-center text-sm font-semibold text-ink sm:flex-1">{title}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      {open && (
        <div
          id={`panchang-section-${id}`}
          className="grid grid-cols-1 border-t border-border/60 sm:grid-cols-2"
        >
          {children}
        </div>
      )}
    </Card>
  )
}

function FactCell({
  label,
  value,
  icon,
  className,
}: {
  label: string
  value: string
  icon?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 border-b border-border/40 px-3 py-2.5 sm:min-h-[3.5rem] sm:odd:border-r sm:odd:border-border/40',
        className,
      )}
    >
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
        {label}
      </p>
      <p className="flex items-start gap-1.5 text-sm font-medium leading-snug text-ink text-pretty">
        {icon && (
          <span aria-hidden className="mt-0.5 shrink-0 text-silver-300">
            {icon}
          </span>
        )}
        <span>{value}</span>
      </p>
    </div>
  )
}

/** Turn "HH:MM – HH:MM" or mixed clock strings into 12h display when possible. */
function formatRange(raw: string) {
  return raw
    .split(/\s*[–-]\s*/)
    .map((part) => {
      const trimmed = part.trim()
      if (/^\d{1,2}:\d{2}$/.test(trimmed)) return panchangClock(trimmed)
      return trimmed
    })
    .join(' – ')
}
