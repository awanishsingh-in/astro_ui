import { useCallback, useId, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'
import type { TabItem } from '@/types/ui'
import { cn } from '@/utils/cn'

export interface TabsController {
  /** Shared id prefix that wires each tab to its panel. */
  idPrefix: string
  value: string
  setValue: (id: string) => void
}

/**
 * Owns tab state and the id prefix shared by `Tabs` and `TabPanel`, so the
 * ARIA wiring is never hand-rolled at the call site.
 */
export function useTabs(initial: string): TabsController {
  const idPrefix = useId()
  const [value, setValue] = useState(initial)
  return useMemo(() => ({ idPrefix, value, setValue }), [idPrefix, value])
}

export interface TabsProps {
  items: TabItem[]
  controller: TabsController
  /** `underline` for section tabs, `segmented` for lens switches. */
  variant?: 'underline' | 'segmented'
  label: string
  className?: string
}

/**
 * Keyboard-navigable tabs (arrow keys, Home/End) following the ARIA tabs
 * pattern, with roving tabindex.
 */
export function Tabs({ items, controller, variant = 'underline', label, className }: TabsProps) {
  const { idPrefix, value, setValue } = controller

  const move = useCallback(
    (delta: number) => {
      const enabled = items.filter((i) => !i.disabled)
      if (enabled.length === 0) return
      const index = enabled.findIndex((i) => i.id === value)
      const next = enabled[(index + delta + enabled.length) % enabled.length]
      if (next) setValue(next.id)
    },
    [items, value, setValue],
  )

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        move(1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        move(-1)
        break
      case 'Home': {
        event.preventDefault()
        const first = items.find((i) => !i.disabled)
        if (first) setValue(first.id)
        break
      }
      case 'End': {
        event.preventDefault()
        const last = [...items].reverse().find((i) => !i.disabled)
        if (last) setValue(last.id)
        break
      }
      default:
        break
    }
  }

  const segmented = variant === 'segmented'

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        'flex min-w-0 items-center',
        segmented
          ? 'gap-1 rounded-control bg-surface-sunken p-1'
          : 'no-scrollbar rail-bleed gap-1 overflow-x-auto border-b border-border',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`${idPrefix}-${item.id}`}
            aria-selected={active}
            aria-controls={`${idPrefix}-${item.id}-panel`}
            tabIndex={active ? 0 : -1}
            disabled={item.disabled}
            onClick={() => setValue(item.id)}
            className={cn(
              'relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap',
              'transition-colors duration-150 ease-out-soft disabled:text-faint',
              segmented
                ? cn(
                    'h-10 rounded-xs px-4 text-sm font-medium lg:h-9 lg:px-3.5',
                    'transition-[background-color,color,box-shadow] duration-200 ease-out-soft',
                    active ? 'bg-surface text-ink shadow-card' : 'text-muted hover:text-purple',
                  )
                : cn(
                    'h-11 px-3 text-sub',
                    // The rule scales out from the centre — a 200ms move, not a snap.
                    'after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-gold',
                    'after:origin-center after:transition-transform after:duration-200',
                    'after:ease-out-soft',
                    active
                      ? 'font-semibold text-ink after:scale-x-100'
                      : 'font-medium text-muted after:scale-x-0 hover:text-purple',
                  ),
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className={cn('font-mono text-label', active ? 'text-gold-deep' : 'text-muted')}>
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export interface TabPanelProps {
  controller: TabsController
  id: string
  children: ReactNode
  className?: string
}

/** The panel half of the tabs pattern. */
export function TabPanel({ controller, id, children, className }: TabPanelProps) {
  const { idPrefix, value } = controller
  if (value !== id) return null
  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-${id}-panel`}
      aria-labelledby={`${idPrefix}-${id}`}
      tabIndex={0}
      className={cn('animate-fade-in focus-visible:outline-none', className)}
    >
      {children}
    </div>
  )
}
