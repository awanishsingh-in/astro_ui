import { useMemo, type ReactNode } from 'react'
import { WheelColumn, WHEEL_ITEM_H, WHEEL_VISIBLE } from '@/components/forms/WheelColumn'
import { cn } from '@/utils/cn'

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function to12(hour24: number): { hour12: number; period: 'AM' | 'PM' } {
  const period = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return { hour12, period }
}

function to24(hour12: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') return hour12 === 12 ? 0 : hour12
  return hour12 === 12 ? 12 : hour12 + 12
}

function formatDisplay12(hhmm: string): string {
  const matched = /^(\d{2}):(\d{2})$/.exec(hhmm)
  if (!matched) return '—'
  const { hour12, period } = to12(Number(matched[1]))
  return `${hour12}:${matched[2]} ${period}`
}

function WheelShell({
  title,
  summary,
  children,
  disabled,
  className,
}: {
  title: string
  summary: string
  children: ReactNode
  disabled?: boolean
  className?: string
}) {
  const bandTop = ((WHEEL_VISIBLE - 1) / 2) * WHEEL_ITEM_H

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-white/10 bg-[#0e0820]',
        disabled && 'opacity-55',
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-2 px-3 pb-0 pt-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-white/45">
          {title}
        </p>
        <p className="text-xs font-semibold tabular-nums text-[#c4a0ff]">{summary}</p>
      </div>

      <div className="relative px-1.5 pb-2 pt-0.5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-2 z-[1] rounded-lg bg-[#7c4dff]/15 ring-1 ring-[#c4a0ff]/30"
          style={{ top: bandTop + 2, height: WHEEL_ITEM_H }}
        />
        <div
          className="relative z-[2] flex items-stretch justify-center gap-0 [&_button]:text-white/40 [&_button[aria-selected=true]]:text-white"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export interface BirthDateWheelProps {
  value: string
  onChange: (isoDate: string) => void
  max?: string
  className?: string
}

/**
 * Day / month / year wheels for birth date (ISO `yyyy-mm-dd`).
 */
export function BirthDateWheel({ value, onChange, max, className }: BirthDateWheelProps) {
  const today = max ?? new Date().toISOString().slice(0, 10)
  const [maxY, maxM, maxD] = today.split('-').map(Number)
  const nowY = new Date().getFullYear()

  const parsed = value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : `${nowY - 25}-01-01`
  let [y, m, d] = parsed.split('-').map(Number)

  const yearOptions = useMemo(() => {
    const list: { value: string; label: string }[] = []
    for (let year = nowY; year >= 1920; year -= 1) {
      list.push({ value: String(year), label: String(year) })
    }
    return list
  }, [nowY])

  const monthOptions = useMemo(() => {
    const limit = y === maxY ? maxM : 12
    return MONTHS.slice(0, limit).map((label, i) => ({
      value: pad(i + 1),
      label,
    }))
  }, [maxM, maxY, y])

  const dim = daysInMonth(y, m)
  const dayLimit = y === maxY && m === maxM ? Math.min(dim, maxD) : dim
  if (d > dayLimit) d = dayLimit

  const dayOptions = useMemo(() => {
    const list: { value: string; label: string }[] = []
    for (let day = 1; day <= dayLimit; day += 1) {
      list.push({ value: pad(day), label: String(day) })
    }
    return list
  }, [dayLimit])

  function emit(nextY: number, nextM: number, nextD: number) {
    const maxDays = daysInMonth(nextY, nextM)
    const day = Math.min(nextD, maxDays)
    const iso = `${nextY}-${pad(nextM)}-${pad(day)}`
    if (iso > today) {
      onChange(today)
      return
    }
    onChange(iso)
  }

  return (
    <WheelShell title="Date of birth" summary={`${d} ${MONTHS[m - 1]} ${y}`} className={className}>
      <WheelColumn
        ariaLabel="Day"
        options={dayOptions}
        value={pad(d)}
        onChange={(v) => emit(y, m, Number(v))}
      />
      <WheelColumn
        ariaLabel="Month"
        options={monthOptions}
        value={pad(m)}
        onChange={(v) => emit(y, Number(v), d)}
      />
      <WheelColumn
        ariaLabel="Year"
        options={yearOptions}
        value={String(y)}
        onChange={(v) => emit(Number(v), m, d)}
      />
    </WheelShell>
  )
}

export interface BirthTimeWheelProps {
  /** Stored as 24h `HH:mm`. */
  value: string
  onChange: (hhmm: string) => void
  disabled?: boolean
  className?: string
}

/**
 * 12-hour hour / minute / AM·PM wheels. Value stays `HH:mm` (24h) for the chart.
 */
export function BirthTimeWheel({ value, onChange, disabled, className }: BirthTimeWheelProps) {
  const matched = /^(\d{2}):(\d{2})$/.exec(value)
  const hour24 = matched ? Number(matched[1]) : 12
  const minute = matched ? matched[2] : '00'
  const { hour12, period } = to12(hour24)

  const hourOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const h = i + 1
        return { value: String(h), label: String(h) }
      }),
    [],
  )
  const minuteOptions = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        value: pad(i),
        label: pad(i),
      })),
    [],
  )
  const periodOptions = useMemo(
    () => [
      { value: 'AM', label: 'AM' },
      { value: 'PM', label: 'PM' },
    ],
    [],
  )

  function emit(nextHour12: number, nextMinute: string, nextPeriod: 'AM' | 'PM') {
    onChange(`${pad(to24(nextHour12, nextPeriod))}:${nextMinute}`)
  }

  return (
    <WheelShell
      title="Time of birth"
      summary={disabled ? 'Unknown' : formatDisplay12(value || '12:00')}
      disabled={disabled}
      className={className}
    >
      <WheelColumn
        ariaLabel="Hour"
        options={hourOptions}
        value={String(hour12)}
        disabled={disabled}
        onChange={(v) => emit(Number(v), minute, period)}
      />
      <div
        aria-hidden
        className="flex shrink-0 items-center justify-center self-center text-sm font-semibold text-white/50"
        style={{ height: WHEEL_VISIBLE * WHEEL_ITEM_H, width: '0.75rem' }}
      >
        :
      </div>
      <WheelColumn
        ariaLabel="Minute"
        options={minuteOptions}
        value={minute}
        disabled={disabled}
        onChange={(v) => emit(hour12, v, period)}
      />
      <WheelColumn
        ariaLabel="AM or PM"
        options={periodOptions}
        value={period}
        disabled={disabled}
        compact
        onChange={(v) => emit(hour12, minute, v as 'AM' | 'PM')}
      />
    </WheelShell>
  )
}
