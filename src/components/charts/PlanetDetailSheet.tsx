import { MessageCircle, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { paths } from '@/routes/paths'
import type { Chart, GrahaCode } from '@/types/astrology'
import { dignityLabel, GRAHAS, motionLabel, RASHIS } from '@/utils/astro'
import { cn } from '@/utils/cn'

export interface PlanetDetailSheetProps {
  chart: Chart
  graha: GrahaCode
  onClose: () => void
  className?: string
}

/**
 * Right-hand planet detail — opens from the Planets table.
 */
export function PlanetDetailSheet({ chart, graha, onClose, className }: PlanetDetailSheetProps) {
  const navigate = useNavigate()
  const found = chart.grahas.find((row) => row.graha === graha)
  if (!found) return null

  const { bhava, degree, minute, nakshatra, dignity, motion, rashi } = found
  const meta = GRAHAS[graha]
  const sign = RASHIS.find((r) => r.name === rashi)?.english ?? rashi
  const degreeLabel = `${degree}°${String(minute).padStart(2, '0')}′`
  const dignityText = dignityLabel(dignity)
  const motionText = motionLabel(motion)
  const rules = chart.bhavas
    .filter((b) => b.lordCode === graha)
    .map((b) => b.bhava)
  const aspects = chart.drishti.find((d) => d.graha === graha)?.aspects ?? []

  function ask() {
    const q = [
      `What does ${meta.english} (${meta.name}) in my ${bhava}${ordinal(bhava)} mean?`,
      `Sign ${sign} ${degreeLabel}, nakshatra ${nakshatra.name} pada ${nakshatra.pada}.`,
      `Dignity ${dignityText}, motion ${motionText}.`,
      rules.length ? `Rules houses ${rules.map((n) => `${n}${ordinal(n)}`).join(', ')}.` : '',
    ]
      .filter(Boolean)
      .join(' ')
    navigate(`${paths.ask}?q=${encodeURIComponent(q)}&from=chart`)
  }

  return (
    <aside
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface shadow-card',
        className,
      )}
    >
      <header className="flex items-start gap-3 border-b border-border/50 px-4 py-4 sm:px-5">
        <PlanetGlyph code={graha} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-2xl font-semibold text-ink">{meta.english}</h3>
          <p className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-copper">
            {meta.name} · in your {bhava}
            {ordinal(bhava)}
          </p>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="inline-flex size-8 items-center justify-center rounded-full text-muted hover:bg-navy-soft hover:text-ink"
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="grid grid-cols-3 gap-2 px-4 py-4 sm:px-5">
        <Fact label="Degree" value={`${sign} ${degreeLabel}`} />
        <Fact label="Nakshatra" value={nakshatra.name} />
        <Fact label="Pada" value={String(nakshatra.pada)} />
      </div>

      <dl className="flex-1 space-y-0 border-t border-border/50 px-4 py-2 sm:px-5">
        <Row label="Dignity" value={dignityText} />
        <Row label="Motion" value={motionText} />
        <Row
          label="Rules houses"
          value={rules.length ? rules.map((n) => `${n}${ordinal(n)}`).join(', ') : '—'}
        />
        <Row
          label="Aspects houses"
          value={aspects.length ? aspects.map((n) => `${n}${ordinal(n)}`).join(', ') : '—'}
        />
      </dl>

      <div className="border-t border-border/50 p-4 sm:p-5">
        <button
          type="button"
          onClick={ask}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7c4dff] to-[#3a7bd5] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(124,77,255,0.7)] transition hover:from-[#8b5cff] hover:to-[#4a8be5]"
        >
          <MessageCircle className="size-4" aria-hidden />
          Ask about this planet
        </button>
      </div>
    </aside>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-sunken/50 px-2.5 py-2.5 text-center">
      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 text-xs font-semibold text-ink text-pretty">{value}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/40 py-3 last:border-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-right text-sm font-semibold text-ink">{value}</dd>
    </div>
  )
}

function ordinal(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th'
  switch (n % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}
