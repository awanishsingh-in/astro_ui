import { useMemo, type ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
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
        'overflow-hidden rounded-xl border border-white/10 bg-surface',
        disabled && 'opacity-55',
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-2 px-3 pb-0 pt-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted">
          {title}
        </p>
        <p className="text-xs font-semibold tabular-nums text-silver-300">{summary}</p>
      </div>

      <div className="relative px-1.5 pb-2 pt-0.5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-2 z-[1] rounded-lg border-y border-[rgba(243,217,196,0.45)] bg-[rgba(243,217,196,0.08)]"
          style={{ top: bandTop + 2, height: WHEEL_ITEM_H }}
        />
        <div
          className="relative z-[2] flex items-stretch justify-center gap-0 [&_button]:text-silver-500 [&_button[aria-selected=true]]:text-silver-300 [&_button[aria-selected=true]]:font-semibold"
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
        className="flex shrink-0 items-center justify-center self-center text-sm font-semibold text-text-secondary"
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

export interface BirthTimeCompactProps {
  /** Stored as 24h `HH:mm`. */
  value: string
  onChange: (hhmm: string) => void
  disabled?: boolean
  className?: string
}

/**
 * Compact hour / minute / AM·PM steppers — sits cleanly beside form inputs
 * without the tall drum wheels.
 */
export function BirthTimeCompact({
  value,
  onChange,
  disabled,
  className,
}: BirthTimeCompactProps) {
  const matched = /^(\d{2}):(\d{2})$/.exec(value)
  const hour24 = matched ? Number(matched[1]) : 12
  const minuteNum = matched ? Number(matched[2]) : 0
  const { hour12, period } = to12(hour24)
  const minute = pad(minuteNum)

  function emit(nextHour12: number, nextMinute: number, nextPeriod: 'AM' | 'PM') {
    const m = ((nextMinute % 60) + 60) % 60
    const h = ((nextHour12 - 1) % 12) + 1
    onChange(`${pad(to24(h, nextPeriod))}:${pad(m)}`)
  }

  return (
    <div
      className={cn(
        'rounded-card border border-border bg-surface-sunken/80 px-3 py-3 sm:px-3.5',
        disabled && 'opacity-55',
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono text-label uppercase text-muted">Time of birth</p>
        <p className="text-sm font-semibold tabular-nums text-ink">
          {disabled ? 'Unknown' : formatDisplay12(value || '12:00')}
        </p>
      </div>

      <div className="mt-3 flex items-stretch gap-2.5 sm:gap-3">
        <TimeStep
          label="Hour"
          value={String(hour12)}
          disabled={disabled}
          onUp={() => emit(hour12 + 1, minuteNum, period)}
          onDown={() => emit(hour12 - 1, minuteNum, period)}
        />
        <span
          aria-hidden
          className="flex items-center self-center text-lg font-semibold text-faint"
        >
          :
        </span>
        <TimeStep
          label="Min"
          value={minute}
          disabled={disabled}
          onUp={() => emit(hour12, minuteNum + 1, period)}
          onDown={() => emit(hour12, minuteNum - 1, period)}
        />
        <div
          role="group"
          aria-label="AM or PM"
          className="ml-auto flex w-[4.5rem] shrink-0 flex-col gap-1 self-stretch"
        >
          {(['AM', 'PM'] as const).map((p) => {
            const active = !disabled && period === p
            return (
              <button
                key={p}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                onClick={() => emit(hour12, minuteNum, p)}
                className={cn(
                  'flex flex-1 items-center justify-center rounded-control border text-xs font-semibold tracking-wide transition-colors',
                  active
                    ? 'btn-glass border-[rgba(243,217,196,0.55)] text-silver-300'
                    : 'btn-glass text-silver-400 hover:text-text',
                  disabled && 'cursor-not-allowed',
                )}
              >
                {p}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TimeStep({
  label,
  value,
  disabled,
  onUp,
  onDown,
}: {
  label: string
  value: string
  disabled?: boolean
  onUp: () => void
  onDown: () => void
}) {
  return (
    <div className="flex min-w-[4.25rem] flex-1 flex-col overflow-hidden rounded-control border border-border bg-surface">
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={disabled}
        onClick={onUp}
        className="flex h-7 items-center justify-center text-muted transition-colors hover:bg-navy-soft hover:text-ink disabled:cursor-not-allowed"
      >
        <ChevronUp className="size-3.5" strokeWidth={2} />
      </button>
      <div className="flex flex-col items-center border-y border-border py-1.5">
        <span className="text-lg font-semibold tabular-nums leading-none text-ink">{value}</span>
        <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
          {label}
        </span>
      </div>
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={disabled}
        onClick={onDown}
        className="flex h-7 items-center justify-center text-muted transition-colors hover:bg-navy-soft hover:text-ink disabled:cursor-not-allowed"
      >
        <ChevronDown className="size-3.5" strokeWidth={2} />
      </button>
    </div>
  )
}
