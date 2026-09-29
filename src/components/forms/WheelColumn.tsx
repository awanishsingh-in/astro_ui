import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'

export const WHEEL_ITEM_H = 32
export const WHEEL_VISIBLE = 3

export interface WheelColumnProps {
  ariaLabel: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  /** Narrower column (e.g. AM/PM). */
  compact?: boolean
}

/**
 * Smooth snap wheel — Apple Watch style.
 */
export function WheelColumn({
  ariaLabel,
  options,
  value,
  onChange,
  disabled,
  className,
  compact,
}: WheelColumnProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const lockRef = useRef(false)
  const valueRef = useRef(value)
  valueRef.current = value
  const [active, setActive] = useState(0)

  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  )

  const scrollToIndex = useCallback((i: number, smooth: boolean) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ top: i * WHEEL_ITEM_H, behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  useEffect(() => {
    setActive(index)
    if (lockRef.current) return
    scrollToIndex(index, false)
  }, [index, options.length, scrollToIndex])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el || disabled) return

    let settle: number | undefined
    const onScroll = () => {
      const i = Math.round(el.scrollTop / WHEEL_ITEM_H)
      const clamped = Math.max(0, Math.min(options.length - 1, i))
      setActive(clamped)
      window.clearTimeout(settle)
      settle = window.setTimeout(() => {
        const next = options[clamped]
        if (!next) return
        lockRef.current = true
        scrollToIndex(clamped, true)
        if (next.value !== valueRef.current) onChange(next.value)
        window.setTimeout(() => {
          lockRef.current = false
        }, 180)
      }, 80)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.clearTimeout(settle)
    }
  }, [disabled, onChange, options, scrollToIndex])

  const padY = ((WHEEL_VISIBLE - 1) / 2) * WHEEL_ITEM_H

  return (
    <div
      className={cn(
        'relative min-w-0 select-none',
        compact ? 'w-[3.25rem] shrink-0' : 'flex-1',
        disabled && 'pointer-events-none opacity-35',
        className,
      )}
    >
      <div
        ref={scrollerRef}
        role="listbox"
        aria-label={ariaLabel}
        tabIndex={disabled ? -1 : 0}
        className="overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{
          height: WHEEL_VISIBLE * WHEEL_ITEM_H,
          scrollSnapType: 'y mandatory',
          paddingTop: padY,
          paddingBottom: padY,
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)',
        }}
      >
        {options.map((opt, i) => {
          const dist = Math.abs(i - active)
          const selected = dist === 0
          return (
            <button
              type="button"
              key={opt.value}
              role="option"
              aria-selected={selected}
              tabIndex={-1}
              onClick={() => {
                onChange(opt.value)
                lockRef.current = true
                scrollToIndex(i, true)
                window.setTimeout(() => {
                  lockRef.current = false
                }, 180)
              }}
              className={cn(
                'flex w-full items-center justify-center transition-[color,opacity,transform] duration-150 text-current',
                selected ? 'font-semibold' : 'font-medium',
              )}
              style={{
                height: WHEEL_ITEM_H,
                scrollSnapAlign: 'center',
                opacity: selected ? 1 : dist === 1 ? 0.45 : 0.22,
                transform: selected ? 'scale(1.06)' : dist === 1 ? 'scale(0.96)' : 'scale(0.9)',
              }}
            >
              <span className="font-sans text-[13px] tabular-nums tracking-tight sm:text-sm">
                {opt.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
