import type { ReactNode } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Card } from '@/components/common/Card'
import type { PanchangDayTimelineData, TimelineSegmentTone } from '@/data/panchang-mock'
import { cn } from '@/utils/cn'

const TONE_CLASS: Record<TimelineSegmentTone, string> = {
  neutral: 'bg-surface-sunken/80 text-ink',
  good: 'bg-emerald-500/20 text-emerald-200',
  avoid: 'bg-[#6E4234]/25 text-[#6E4234]',
}

function hourLabel(hour: number) {
  const h = ((hour % 24) + 24) % 24
  return String(h)
}

function clockFromMin(min: number) {
  const h = Math.floor(min / 60) % 24
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Horizontal limb timeline for a selected panchang day.
 * Scrolls on narrow viewports; Cyklos styling (not a copy of third-party charts).
 */
export function PanchangDayTimeline({ timeline }: { timeline: PanchangDayTimelineData }) {
  const { axisStartHour, axisEndHour, sunriseMin, sunsetMin, rows, notes } = timeline
  const axisStartMin = axisStartHour * 60
  const axisEndMin = axisEndHour * 60
  const span = axisEndMin - axisStartMin
  const hours = Array.from({ length: axisEndHour - axisStartHour + 1 }, (_, i) => axisStartHour + i)

  function leftPct(min: number) {
    return `${((min - axisStartMin) / span) * 100}%`
  }

  function widthPct(start: number, end: number) {
    return `${((end - start) / span) * 100}%`
  }

  return (
    <div className="space-y-2">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-silver-400">
        Day timeline
      </p>
      <Card padding="none" className="overflow-hidden border-border/80">
        <div className="overflow-x-auto">
          <div className="min-w-[42rem] px-3 py-4 sm:min-w-[52rem] sm:px-4">
            {/* Hour axis + sun markers */}
            <div className="relative mb-3 ml-20 h-10 border-b border-border/60 sm:ml-24">
              {hours.map((hour) => (
                <span
                  key={hour}
                  className="absolute top-0 -translate-x-1/2 font-mono text-[9px] text-muted"
                  style={{ left: leftPct(hour * 60) }}
                >
                  {hourLabel(hour)}
                </span>
              ))}
              <Marker
                left={leftPct(sunriseMin)}
                label={clockFromMin(sunriseMin)}
                icon={<Sun className="size-3.5 text-[#F2D7C7]" strokeWidth={1.75} />}
              />
              <Marker
                left={leftPct(sunsetMin)}
                label={clockFromMin(sunsetMin)}
                icon={<Moon className="size-3.5 text-info" strokeWidth={1.75} />}
              />
            </div>

            <div className="space-y-2">
              {rows.map((row) => (
                <div key={row.id} className="flex items-stretch gap-2 sm:gap-3">
                  <div className="flex w-20 shrink-0 items-center sm:w-24">
                    <span className="text-[11px] font-semibold text-muted sm:text-xs">{row.label}</span>
                  </div>
                  <div className="relative h-9 flex-1 overflow-hidden rounded-lg border border-border/50 bg-surface-sunken/40">
                    {row.segments.map((seg, i) => {
                      const tone = seg.tone ?? 'neutral'
                      const showLabel = seg.endMin - seg.startMin > span * 0.06
                      return (
                        <div
                          key={`${row.id}-${seg.label}-${i}`}
                          title={`${seg.label} · ${clockFromMin(seg.startMin)}–${clockFromMin(seg.endMin)}`}
                          className={cn(
                            'absolute inset-y-0 flex items-center justify-center overflow-hidden border-r border-border/40 px-1',
                            'text-[9px] font-semibold leading-tight sm:text-[10px]',
                            TONE_CLASS[tone],
                          )}
                          style={{
                            left: leftPct(seg.startMin),
                            width: widthPct(seg.startMin, seg.endMin),
                          }}
                        >
                          {showLabel && <span className="truncate">{seg.label}</span>}
                        </div>
                      )
                    })}
                    {/* Transition ticks */}
                    {row.segments.slice(1).map((seg, i) => (
                      <div
                        key={`tick-${row.id}-${i}`}
                        className="pointer-events-none absolute inset-y-0 w-px border-l border-dashed border-copper/50"
                        style={{ left: leftPct(seg.startMin) }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {notes.length > 0 && (
              <ol className="mt-4 grid list-decimal gap-1 pl-5 font-mono text-[10px] text-faint sm:grid-cols-2">
                {notes.map((note) => (
                  <li key={note} className="leading-relaxed">
                    {note}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

function Marker({
  left,
  label,
  icon,
}: {
  left: string
  label: string
  icon: ReactNode
}) {
  return (
    <div
      className="absolute bottom-0 flex -translate-x-1/2 flex-col items-center gap-0.5"
      style={{ left }}
    >
      <span aria-hidden>{icon}</span>
      <span className="font-mono text-[8px] tabular-nums text-muted">{label}</span>
    </div>
  )
}
