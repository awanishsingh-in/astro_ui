import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Divider } from '@/components/common/Divider'
import { IconButton } from '@/components/common/IconButton'
import { Input } from '@/components/forms/Input'
import { ReadingCard } from '@/components/readings/ReadingCard'
import { ReadingsNoMatch } from '@/components/readings/ReadingsStates'
import { useBookmarks } from '@/hooks/useBookmarks'
import type { Reading } from '@/types/readings'
import { cn } from '@/utils/cn'
import { pluralise } from '@/utils/format'

export interface AllLensProps {
  readings: Reading[]
  className?: string
}

type Filter = 'all' | 'saved'

/**
 * The flat list — the third lens, for when you just want to find a sentence.
 *
 * Grouped by Today and Earlier rather than by an exact timestamp, because the
 * date is the least interesting thing about a reading. Search covers the
 * question, the verdict and the citation, so "bh 10" and "Jupiter" both work.
 */
export function AllLens({ readings, className }: AllLensProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const { ids: savedIds } = useBookmarks()

  const matches = useMemo(() => {
    const pool = filter === 'saved' ? readings.filter((r) => savedIds.includes(r.id)) : readings
    const q = query.trim().toLowerCase()
    if (!q) return pool

    return pool.filter((reading) => {
      const haystack = [
        reading.question,
        reading.answer.verdict,
        reading.answer.reason,
        reading.answer.source.dashaPath,
        reading.answer.source.bhava !== undefined ? `bh ${reading.answer.source.bhava}` : '',
        ...reading.answer.source.grahas,
        ...reading.answer.points,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [readings, query, filter, savedIds])

  const today = matches.filter((r) => isToday(r.askedAt))
  const earlier = matches.filter((r) => !isToday(r.askedAt))

  return (
    <div className={cn('space-y-5', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          inputSize="md"
          tone="sunken"
          icon={<Search />}
          type="search"
          placeholder="Search your readings"
          aria-label="Search your readings"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-0 flex-1"
          suffix={
            query ? (
              <IconButton
                label="Clear search"
                icon={<X />}
                size="sm"
                onClick={() => setQuery('')}
                className="-mr-2"
              />
            ) : undefined
          }
        />

        <div role="group" aria-label="Filter readings" className="flex gap-1 rounded-control bg-surface-sunken p-1">
          {(['all', 'saved'] as Filter[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
              className={cn(
                'rounded-xs px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                filter === option ? 'bg-surface text-ink shadow-card' : 'text-muted hover:text-purple',
              )}
            >
              {option}
              {option === 'saved' && savedIds.length > 0 && (
                <span className="ml-1.5 font-mono text-label text-muted">{savedIds.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {matches.length === 0 ? (
        query ? (
          <ReadingsNoMatch query={query.trim()} />
        ) : (
          <p className="rounded-card border border-border bg-surface-sunken p-6 text-center text-sm text-muted">
            Nothing saved yet. Use the bookmark on any reading to keep it here.
          </p>
        )
      ) : (
        <div className="space-y-6">
          {today.length > 0 && (
            <Group label="Today" count={today.length} readings={today} />
          )}
          {earlier.length > 0 && (
            <Group label={today.length > 0 ? 'Earlier' : 'All'} count={earlier.length} readings={earlier} />
          )}
        </div>
      )}
    </div>
  )
}

function Group({
  label,
  count,
  readings,
}: {
  label: string
  count: number
  readings: Reading[]
}) {
  return (
    <section className="space-y-3">
      <Divider label={`${label} · ${pluralise(count, 'reading')}`} />
      <ul className="space-y-3">
        {readings.map((reading) => (
          <li key={reading.id}>
            <ReadingCard reading={reading} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function isToday(iso: string): boolean {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}
