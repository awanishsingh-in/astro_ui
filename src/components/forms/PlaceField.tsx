import { MapPin } from 'lucide-react'
import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Input } from '@/components/forms/Input'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { searchPlaces } from '@/data/places'
import type { BirthPlace } from '@/types/user'
import { cn } from '@/utils/cn'
import { formatCoordinates } from '@/utils/format'

export interface PlaceFieldProps {
  value: BirthPlace | null
  onChange: (place: BirthPlace | null) => void
  invalid?: boolean
  placeholder?: string
  className?: string
}

/**
 * Birth-place lookup: type a town, pick the nearest listed one.
 *
 * An ARIA combobox — the listbox is keyboard-navigable and the resolved
 * coordinates are shown back, because those are what the chart is built from.
 */
export function PlaceField({
  value,
  onChange,
  invalid,
  placeholder = 'Start typing a town',
  className,
}: PlaceFieldProps) {
  const listId = useId()
  const [query, setQuery] = useState(value?.label ?? '')
  const [isOpen, setIsOpen] = useState(false)

  /*
    Keep the visible text in step when `value` is set from outside — filling
    the form from a saved chart, for instance. Adjusting state during render
    like this is React's own pattern for a prop-driven reset; an effect would
    paint the stale text for a frame first.
  */
  const externalLabel = value?.label ?? ''
  const lastExternal = useRef(externalLabel)
  if (externalLabel !== lastExternal.current) {
    lastExternal.current = externalLabel
    if (externalLabel) setQuery(externalLabel)
  }

  const [highlight, setHighlight] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => (isOpen ? searchPlaces(query) : []), [isOpen, query])

  useOnClickOutside(wrapperRef, () => setIsOpen(false), isOpen)

  const pick = (place: BirthPlace) => {
    onChange(place)
    setQuery(place.label)
    setIsOpen(false)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (event.key === 'ArrowDown') setIsOpen(true)
      return
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setHighlight((h) => (h + 1) % results.length)
        break
      case 'ArrowUp':
        event.preventDefault()
        setHighlight((h) => (h - 1 + results.length) % results.length)
        break
      case 'Enter':
        event.preventDefault()
        pick(results[highlight])
        break
      case 'Escape':
        setIsOpen(false)
        break
      default:
        break
    }
  }

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <Input
        role="combobox"
        aria-expanded={isOpen && results.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          isOpen && results.length > 0 ? `${listId}-${highlight}` : undefined
        }
        autoComplete="off"
        invalid={invalid}
        placeholder={placeholder}
        value={query}
        suffix={<MapPin />}
        onChange={(event) => {
          setQuery(event.target.value)
          setHighlight(0)
          setIsOpen(true)
          // Typing after a pick invalidates it — the chart needs a real place.
          if (value) onChange(null)
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={onKeyDown}
      />

      {isOpen && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Matching places"
          className={cn(
            'absolute inset-x-0 top-[calc(100%+0.375rem)] z-40 max-h-64 overflow-y-auto',
            'animate-scale-in origin-top rounded-card border border-border bg-surface p-1 shadow-overlay',
          )}
        >
          {results.map((place, index) => (
            <li key={place.label} id={`${listId}-${index}`} role="option" aria-selected={index === highlight}>
              <button
                type="button"
                tabIndex={-1}
                onMouseEnter={() => setHighlight(index)}
                onClick={() => pick(place)}
                className={cn(
                  'flex w-full flex-col items-start gap-0.5 rounded-xs px-3 py-2.5 text-left',
                  index === highlight ? 'bg-navy-soft' : 'bg-transparent',
                )}
              >
                <span className="text-sub text-ink">{place.label}</span>
                <span className="font-mono text-label uppercase text-muted">
                  {formatCoordinates(place.latitude, place.longitude)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
