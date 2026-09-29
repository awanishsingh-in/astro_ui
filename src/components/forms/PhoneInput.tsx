import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Search } from 'lucide-react'
import {
  COUNTRY_DIALS,
  DEFAULT_COUNTRY_ISO,
  countryByIso,
  type CountryDial,
} from '@/data/country-dials'
import { cn } from '@/utils/cn'
import { useField } from './Field'

export type PhoneInputProps = {
  value: string
  onChange: (value: string) => void
  dialIso?: string
  onDialIsoChange?: (iso: string) => void
  invalid?: boolean
  disabled?: boolean
  placeholder?: string
  autoFocus?: boolean
  className?: string
  tone?: 'default' | 'adventure'
}

/**
 * Phone entry with a searchable country-code picker (all dial codes).
 * The menu portals to `document.body` so it never sits under the form button.
 */
export function PhoneInput({
  value,
  onChange,
  dialIso = DEFAULT_COUNTRY_ISO,
  onDialIsoChange,
  invalid,
  disabled,
  placeholder = '98765 43210',
  autoFocus,
  className,
  tone = 'default',
}: PhoneInputProps) {
  const field = useField()
  const hasError = invalid ?? field?.hasError ?? false
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [menuBox, setMenuBox] = useState<{
    top: number
    left: number
    width: number
    maxHeight: number
  } | null>(null)

  const selected = countryByIso(dialIso) ?? COUNTRY_DIALS[0]
  const adventure = tone === 'adventure'

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COUNTRY_DIALS
    return COUNTRY_DIALS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q.replace(/^\+/, '')) ||
        c.iso.toLowerCase().includes(q),
    )
  }, [query])

  useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setMenuBox(null)
      return
    }
    const place = () => {
      const rect = rootRef.current?.getBoundingClientRect()
      if (!rect) return
      const gap = 8
      const maxH = Math.min(280, Math.max(160, window.innerHeight - rect.bottom - gap - 16))
      setMenuBox({
        top: rect.bottom + gap,
        left: rect.left,
        width: rect.width,
        maxHeight: maxH,
      })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
      setQuery('')
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    window.setTimeout(() => searchRef.current?.focus(), 0)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function pick(country: CountryDial) {
    onDialIsoChange?.(country.iso)
    setOpen(false)
    setQuery('')
  }

  const menu =
    open &&
    menuBox &&
    createPortal(
      <div
        ref={menuRef}
        id={listId}
        role="listbox"
        aria-label="Country codes"
        style={{
          position: 'fixed',
          top: menuBox.top,
          left: menuBox.left,
          width: menuBox.width,
          maxHeight: menuBox.maxHeight,
          zIndex: 9999,
        }}
        className={cn(
          'flex flex-col overflow-hidden rounded-2xl border shadow-[0_24px_48px_-16px_rgba(0,0,0,0.75)]',
          adventure
            ? 'border-[#5b3d9a] bg-[#0e0820] text-white'
            : 'border-border bg-surface text-ink',
        )}
      >
        <div
          className={cn(
            'flex shrink-0 items-center gap-2 border-b px-3 py-2.5',
            adventure ? 'border-white/10 bg-[#0e0820]' : 'border-border bg-surface',
          )}
        >
          <Search
            className={cn('size-4 shrink-0', adventure ? 'text-white/45' : 'text-muted')}
            aria-hidden
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search country or code"
            className={cn(
              'min-w-0 flex-1 bg-transparent text-sm outline-none',
              adventure
                ? 'text-white placeholder:text-white/35'
                : 'text-ink placeholder:text-faint',
            )}
          />
        </div>

        <ul
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overscroll-contain py-1',
            adventure ? 'bg-[#0e0820]' : 'bg-surface',
          )}
        >
          {filtered.length === 0 ? (
            <li className={cn('px-3 py-3 text-sm', adventure ? 'text-white/45' : 'text-muted')}>
              No countries match
            </li>
          ) : (
            filtered.map((country) => {
              const active = country.iso === selected.iso
              return (
                <li key={`${country.iso}-${country.dial}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => pick(country)}
                    className={cn(
                      'flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors',
                      adventure
                        ? active
                          ? 'bg-[#7c4dff]/30 text-white'
                          : 'text-white/90 hover:bg-white/8'
                        : active
                          ? 'bg-copper/15 text-ink'
                          : 'hover:bg-navy-soft/70',
                    )}
                  >
                    <span className="text-base leading-none" aria-hidden>
                      {country.flag}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{country.name}</span>
                    <span
                      className={cn(
                        'font-mono text-xs',
                        adventure ? 'text-[#c4a0ff]' : 'text-muted',
                      )}
                    >
                      +{country.dial}
                    </span>
                    {active && (
                      <Check
                        className={cn(
                          'size-3.5 shrink-0',
                          adventure ? 'text-[#c4a0ff]' : 'text-copper',
                        )}
                        aria-hidden
                      />
                    )}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </div>,
      document.body,
    )

  return (
    <div ref={rootRef} className={cn('relative', open && 'z-20')}>
      <div
        className={cn(
          'flex h-control-lg items-stretch overflow-hidden rounded-control border bg-surface',
          'transition-[border-color,box-shadow] duration-200 ease-out-soft',
          'focus-within:border-copper focus-within:shadow-glow',
          hasError ? 'border-critical' : 'border-border',
          disabled && 'bg-surface-sunken text-faint',
          adventure &&
            'h-14 rounded-2xl border-[#5b3d9a]/70 bg-[#140d2c] focus-within:border-[#c4a0ff] focus-within:shadow-[0_0_0_3px_rgba(124,77,255,0.25)]',
          className,
        )}
      >
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={`Country code ${selected.name} +${selected.dial}`}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'flex shrink-0 items-center gap-1 border-r px-2.5 font-mono text-data-lg transition-colors sm:px-3',
            adventure
              ? 'border-[#5b3d9a]/70 text-[#c4a0ff] hover:bg-white/5'
              : 'border-border text-purple hover:bg-navy-soft/60',
            disabled && 'pointer-events-none opacity-60',
          )}
        >
          <span aria-hidden className="text-base leading-none">
            {selected.flag}
          </span>
          <span>+{selected.dial}</span>
          <ChevronDown
            className={cn('size-3.5 opacity-70 transition-transform', open && 'rotate-180')}
            aria-hidden
          />
        </button>

        <input
          id={field?.inputId}
          aria-describedby={field?.describedBy}
          aria-invalid={hasError || undefined}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          name="tel"
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            'h-full min-w-0 flex-1 bg-transparent px-3.5 font-mono text-data-lg text-ink outline-none',
            'placeholder:text-faint',
            adventure && 'text-white placeholder:text-white/35',
          )}
        />
      </div>
      {menu}
    </div>
  )
}
