import { Check, MapPin } from 'lucide-react'
import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Input } from '@/components/forms/Input'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { searchPlaces, splitPlaceLabel } from '@/data/places'
import type { BirthPlace } from '@/types/user'
import { cn } from '@/utils/cn'
import { formatCoordinates } from '@/utils/format'

export interface PlaceFieldProps {
  value: BirthPlace | null
  onChange: (place: BirthPlace | null) => void
  invalid?: boolean
  placeholder?: string
  /** Matches Input — birth forms use `celestial`. */
  tone?: 'surface' | 'sunken' | 'celestial'
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
  tone = 'surface',
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

  const trimmed = query.trim()
  const searching = isOpen && trimmed.length >= 2 && !value
  const results = useMemo(
    () => (searching ? searchPlaces(query) : []),
    [searching, query],
  )

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

  const celestial = tone === 'celestial'
  const showPanel = searching

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <Input
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          showPanel && results.length > 0 ? `${listId}-${highlight}` : undefined
        }
        autoComplete="off"
        invalid={invalid}
        placeholder={placeholder}
        value={query}
        tone={tone}
        icon={<MapPin strokeWidth={1.75} />}
        suffix={
          value ? (
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-gold/20 text-gold">
              <Check className="size-3" strokeWidth={2.5} />
            </span>
          ) : undefined
        }
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

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          aria-label="Matching places"
          className={cn(
            /* Open upward — birth place sits low on the form; a drop-down was clipped. */
            'absolute inset-x-0 bottom-[calc(100%+0.5rem)] z-50',
            'animate-scale-in origin-bottom rounded-card border shadow-overlay',
            celestial
              ? 'border-gold/25 bg-indigo-deep backdrop-blur-md'
              : 'border-border bg-surface',
          )}
        >
          <div
            className={cn(
              'flex items-center gap-2 border-b px-3.5 py-2',
              celestial ? 'border-celestial-line/80' : 'border-border',
            )}
          >
            <span
              className={cn(
                'font-mono text-[10px] uppercase tracking-[0.14em]',
                celestial ? 'text-gold/80' : 'text-muted',
              )}
            >
              {results.length > 0
                ? `${results.length} match${results.length === 1 ? '' : 'es'}`
                : 'No matches'}
            </span>
            <span className="text-[11px] text-muted">Pick the nearest listed town</span>
          </div>

          {results.length > 0 ? (
            <ul className="max-h-52 overflow-y-auto overscroll-contain p-1.5">
              {results.map((place, index) => {
                const { city, region } = splitPlaceLabel(place.label)
                const active = index === highlight
                return (
                  <li
                    key={place.label}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={active}
                  >
                    <button
                      type="button"
                      tabIndex={-1}
                      onMouseEnter={() => setHighlight(index)}
                      onClick={() => pick(place)}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-control px-3 py-2.5 text-left',
                        'transition-colors duration-150 ease-out-soft',
                        active
                          ? celestial
                            ? 'bg-gold-soft/50'
                            : 'bg-navy-soft'
                          : 'bg-transparent hover:bg-navy-soft/60',
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full border',
                          active
                            ? 'border-gold/45 bg-gold/15 text-gold'
                            : celestial
                              ? 'border-celestial-line text-gold/60'
                              : 'border-border text-muted',
                        )}
                      >
                        <MapPin className="size-3.5" strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block truncate text-sub font-medium',
                            celestial ? 'text-on-celestial' : 'text-ink',
                          )}
                        >
                          {city}
                        </span>
                        <span
                          className={cn(
                            'mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs',
                            celestial ? 'text-on-celestial-muted' : 'text-muted',
                          )}
                        >
                          {region && <span>{region}</span>}
                          <span aria-hidden className="text-faint">
                            ·
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.08em]">
                            {formatCoordinates(place.latitude, place.longitude)}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="px-4 py-5 text-center text-sm text-muted text-pretty">
              No towns matched “{trimmed}”. Try another spelling or a nearby city.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
