import { MessageCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/routes/paths'
import type { Chart, GrahaCode } from '@/types/astrology'
import { GRAHA_ORDER, RASHIS } from '@/utils/astro'
import { cn } from '@/utils/cn'

export interface ChartTransitsPanelProps {
  chart: Chart
  className?: string
}

interface TransitEvent {
  id: string
  title: string
  detail: string
  start: string
  end: string
  progress: number
  tone: 'violet' | 'cyan' | 'blue' | 'rose' | 'indigo'
}

/**
 * Transits tab — natal/gochar wheel · date slider · moving events list.
 */
export function ChartTransitsPanel({ chart, className }: ChartTransitsPanelProps) {
  const navigate = useNavigate()
  const [slider, setSlider] = useState(50)
  const lagna = RASHIS.find((r) => r.name === chart.lagna.rashi)?.english ?? chart.lagna.rashi

  const events = useMemo(() => buildTransitEvents(chart), [chart])
  const gochar = useMemo(() => buildGochar(chart, slider), [chart, slider])

  const dateLabel = sliderLabel(slider)

  function askTransit(event: TransitEvent) {
    navigate(
      `${paths.ask}?q=${encodeURIComponent(
        `${event.title}. ${event.detail} (${event.start} – ${event.end}). What should I know?`,
      )}&from=chart`,
    )
  }

  return (
    <div
      className={cn(
        'animate-rise grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:items-start',
        className,
      )}
    >
      <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-[#0f0c24] p-5 shadow-card sm:p-6">
        <TransitWheel chart={chart} gochar={gochar} lagnaLabel={lagna} />

        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/70">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#c4a0ff]" /> Natal · inner ring
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#5ed7f2]" /> Gochar · outer ring
          </span>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5ed7f2]">
            Gochar on
          </p>
          <p className="mt-1 text-lg font-semibold text-white">{dateLabel}</p>
          <input
            type="range"
            min={0}
            max={100}
            value={slider}
            onChange={(e) => setSlider(Number(e.target.value))}
            className="mt-3 w-full accent-[#3a7bd5]"
            aria-label="Transit date"
          />
          <div className="mt-1 flex justify-between font-mono text-[10px] uppercase text-white/40">
            <span>Apr</span>
            <span>Jul</span>
            <span>Today</span>
            <span>Jan</span>
            <span>Apr</span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface p-5 shadow-card sm:p-6">
        <h2 className="font-serif text-2xl font-semibold text-ink">What&apos;s moving on your chart</h2>
        <p className="mt-1 text-sm text-muted">Apr 2026 – Apr 2027</p>

        <ul className="mt-5 space-y-4">
          {events.map((event) => (
            <li key={event.id} className="rounded-2xl border border-border/60 bg-surface-sunken/25 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-ink">{event.title}</h3>
                  <p className="mt-1 text-sm text-muted text-pretty">{event.detail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => askTransit(event)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-copper hover:underline"
                >
                  <MessageCircle className="size-3.5" />
                  Ask
                </button>
              </div>
              <p className="mt-2 font-mono text-[11px] text-faint">
                {event.start} – {event.end}
              </p>
              <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-border/50">
                <div
                  className={cn('absolute inset-y-0 left-0 rounded-full', toneBar(event.tone))}
                  style={{ width: `${Math.round(event.progress * 100)}%` }}
                />
                <span
                  aria-hidden
                  className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-ink"
                  style={{ left: '50%' }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function TransitWheel({
  chart,
  gochar,
  lagnaLabel,
}: {
  chart: Chart
  gochar: { code: GrahaCode; house: number; retro?: boolean }[]
  lagnaLabel: string
}) {
  const size = 300
  const cx = size / 2
  const cy = size / 2

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[320px]">
      <circle cx={cx} cy={cy} r={140} fill="none" stroke="rgba(196,160,255,0.35)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={105} fill="none" stroke="rgba(94,215,242,0.35)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={70} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <text
        x={cx}
        y={cy + 5}
        textAnchor="middle"
        fill="#f5f2ff"
        fontFamily="var(--font-serif)"
        fontSize="18"
        fontWeight="600"
      >
        {lagnaLabel}
      </text>

      {Array.from({ length: 12 }, (_, i) => {
        const house = i + 1
        const angle = ((house - 1) / 12) * Math.PI * 2 - Math.PI / 2
        const x = cx + Math.cos(angle) * 128
        const y = cy + Math.sin(angle) * 128
        return (
          <text
            key={house}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.45)"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            {house}
          </text>
        )
      })}

      {chart.grahas.map((g) => {
        const angle = ((g.bhava - 1) / 12) * Math.PI * 2 - Math.PI / 2
        const x = cx + Math.cos(angle) * 88
        const y = cy + Math.sin(angle) * 88
        return (
          <text
            key={`n-${g.graha}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#c4a0ff"
            fontSize="11"
            fontWeight="700"
            fontFamily="var(--font-sans)"
          >
            {g.graha}
          </text>
        )
      })}

      {gochar.map((g) => {
        const angle = ((g.house - 1) / 12) * Math.PI * 2 - Math.PI / 2
        const x = cx + Math.cos(angle) * 118
        const y = cy + Math.sin(angle) * 118
        return (
          <text
            key={`g-${g.code}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#5ed7f2"
            fontSize="11"
            fontWeight="700"
            fontFamily="var(--font-sans)"
          >
            {g.code}
            {g.retro ? 'R' : ''}
          </text>
        )
      })}
    </svg>
  )
}

function buildGochar(chart: Chart, slider: number) {
  const shift = Math.floor(slider / 12)
  return GRAHA_ORDER.map((code, i) => {
    const natal = chart.grahas.find((g) => g.graha === code)
    const house = ((((natal?.bhava ?? 1) - 1 + shift + i) % 12) + 12) % 12 + 1
    return { code, house, retro: code === 'Sa' || code === 'Ra' || code === 'Ke' }
  })
}

function buildTransitEvents(chart: Chart): TransitEvent[] {
  const moon = chart.grahas.find((g) => g.graha === 'Mo')
  const ju = chart.grahas.find((g) => g.graha === 'Ju')
  return [
    {
      id: 'sa-moon',
      title: `Saturn over your Moon · ${moon?.bhava ?? 8}${ordinal(moon?.bhava ?? 8)}`,
      detail: 'A longer transit across the Moon’s house — pace and care matter more than speed.',
      start: 'Jun 2026',
      end: 'Mar 2027',
      progress: 0.42,
      tone: 'violet',
    },
    {
      id: 'ra-ke',
      title: 'Rahu in your 7th · Ketu in your 1st',
      detail: 'Axis through partnership and self — meetings and identity both stretch.',
      start: 'May 2026',
      end: 'Nov 2027',
      progress: 0.28,
      tone: 'indigo',
    },
    {
      id: 'ju',
      title: `Jupiter ${ju?.dignity === 'exalted' ? 'exalted ' : ''}in your ${ju?.bhava ?? 12}${ordinal(ju?.bhava ?? 12)}`,
      detail: 'Guru’s year-long walk — where growth asks for faith and a wider frame.',
      start: 'May 2026',
      end: 'May 2027',
      progress: 0.55,
      tone: 'cyan',
    },
    {
      id: 'ma',
      title: 'Mars in your 12th',
      detail: 'Heat in a private house — effort that burns quietly, then clears.',
      start: 'Sep 2026',
      end: 'Oct 2026',
      progress: 0.7,
      tone: 'rose',
    },
    {
      id: 'su',
      title: 'Sun in your 2nd',
      detail: 'Spotlight on speech, resources, and what you keep close.',
      start: 'Sep 2026',
      end: 'Oct 2026',
      progress: 0.6,
      tone: 'blue',
    },
  ]
}

function toneBar(tone: TransitEvent['tone']) {
  switch (tone) {
    case 'cyan':
      return 'bg-[#5ed7f2]'
    case 'blue':
      return 'bg-[#3a7bd5]'
    case 'rose':
      return 'bg-[#d4848a]'
    case 'indigo':
      return 'bg-[#c4a0ff]'
    default:
      return 'bg-[#7c4dff]'
  }
}

function sliderLabel(slider: number) {
  if (slider >= 45 && slider <= 55) return 'Today, 3 Oct 2026'
  if (slider < 25) return 'Apr 2026'
  if (slider < 45) return 'Jul 2026'
  if (slider < 75) return 'Jan 2027'
  return 'Apr 2027'
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
