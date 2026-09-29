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
  /** Matches Input — birth forms use `celestial` / auth uses `adventure`. */
  tone?: 'surface' | 'sunken' | 'celestial' | 'adventure'
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
  const adventure = tone === 'adventure'
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
            <span
              className={cn(
                'inline-flex size-5 items-center justify-center rounded-full',
                adventure ? 'bg-[#7c4dff]/25 text-[#c4a0ff]' : 'bg-gold/20 text-gold',
              )}
            >
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
            adventure
              ? 'border-white/10 bg-[#0e0820]'
              : celestial
                ? 'border-[var(--color-field-border)] bg-[var(--color-field)] backdrop-blur-md'
                : 'border-border bg-surface',
          )}
        >
          <div
            className={cn(
              'flex items-center gap-2 border-b px-3.5 py-2',
              adventure
                ? 'border-white/10'
                : celestial
                  ? 'border-[var(--color-field-border)]'
                  : 'border-border',
            )}
          >
            <span
              className={cn(
                'font-mono text-[10px] uppercase tracking-[0.14em]',
                adventure ? 'text-[#c4a0ff]' : celestial ? 'text-copper' : 'text-muted',
              )}
            >
              {results.length > 0
                ? `${results.length} match${results.length === 1 ? '' : 'es'}`
                : 'No matches'}
            </span>
            <span className={cn('text-[11px]', adventure ? 'text-white/45' : 'text-muted')}>
              Pick the nearest listed town
            </span>
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
                          ? adventure
                            ? 'bg-[#7c4dff]/20'
                            : celestial
                              ? 'bg-gold-soft/50'
                              : 'bg-navy-soft'
                          : adventure
                            ? 'bg-transparent hover:bg-white/5'
                            : 'bg-transparent hover:bg-navy-soft/60',
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full border',
                          active
                            ? adventure
                              ? 'border-[#c4a0ff]/45 bg-[#7c4dff]/20 text-[#c4a0ff]'
                              : 'border-gold/45 bg-gold/15 text-gold'
                            : adventure
                              ? 'border-white/10 text-[#c4a0ff]/70'
                              : celestial
                                ? 'border-[var(--color-field-border)] text-copper/70'
                                : 'border-border text-muted',
                        )}
                      >
                        <MapPin className="size-3.5" strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block truncate text-sub font-medium',
                            adventure ? 'text-white' : celestial ? 'text-on-celestial' : 'text-ink',
                          )}
                        >
                          {city}
                        </span>
                        <span
                          className={cn(
                            'mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs',
                            adventure
                              ? 'text-white/45'
                              : celestial
                                ? 'text-on-celestial-muted'
                                : 'text-muted',
                          )}
                        >
                          {region && <span>{region}</span>}
                          <span aria-hidden className={adventure ? 'text-white/25' : 'text-faint'}>
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
            <p
              className={cn(
                'px-4 py-5 text-center text-sm text-pretty',
                adventure ? 'text-white/45' : 'text-muted',
              )}
            >
              No towns matched “{trimmed}”. Try another spelling or a nearby city.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
