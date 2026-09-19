import { Check, ChevronRight, Search, Users, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Avatar } from '@/components/common/Avatar'
import { EmptyState } from '@/components/common/EmptyState'
import { IconButton } from '@/components/common/IconButton'
import { SectionHeader } from '@/components/common/SectionHeader'
import { Input } from '@/components/forms/Input'
import { useAuth } from '@/auth/auth-context'
import { RELATION_LABEL, RELATION_ORDER } from '@/data/profiles'
import { PageContainer } from '@/layouts/PageContainer'
import { useProfiles } from '@/profiles/profiles-context'
import { paths } from '@/routes/paths'
import {
  readMatchDraft,
  saveMatchPick,
  type MatchPersonSlot,
} from '@/utils/match-draft'
import { cn } from '@/utils/cn'
import { formatDateShort, formatTime12 } from '@/utils/format'

/**
 * Full-page picker - choose a saved chart to fill Person 1 or Person 2 on Matching.
 */
export default function MatchProfilePickPage() {
  const { user } = useAuth()
  const { profiles } = useProfiles()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [query, setQuery] = useState('')

  const slotParam = params.get('for')
  const slot: MatchPersonSlot = slotParam === 'b' ? 'b' : 'a'
  const draft = readMatchDraft()
  const returnTo = draft?.returnTo ?? paths.matching
  const personLabel =
    returnTo === paths.matchingManglik
      ? 'the chart'
      : slot === 'a'
        ? 'Person 1'
        : 'Person 2'
  // Don't offer the chart already filling the other person.
  const takenByOther =
    slot === 'a' ? draft?.b.profileId : draft?.a.profileId

  const available = useMemo(
    () =>
      takenByOther
        ? profiles.filter((p) => p.id !== takenByOther)
        : profiles,
    [profiles, takenByOther],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return available
    return available.filter((p) => {
      const haystack = [
        p.name,
        p.note ?? '',
        RELATION_LABEL[p.relation],
        p.birthDetails.place.label,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [available, query])

  const grouped = useMemo(
    () =>
      RELATION_ORDER.map((relation) => ({
        relation,
        label: RELATION_LABEL[relation],
        items: filtered.filter((p) => p.relation === relation),
      })).filter((group) => group.items.length > 0),
    [filtered],
  )

  if (!user) return null

  const choose = (profileId: string) => {
    saveMatchPick({ slot, profileId })
    navigate(returnTo, { replace: true })
  }

  const trimmedQuery = query.trim()

  return (
    <PageContainer width="content">
      <SectionHeader
        as="h1"
        size="lg"
        title="Saved profiles"
        description={
          returnTo === paths.matchingManglik
            ? 'Pick a saved chart for the Manglik dosha calculator.'
            : `Pick whose chart fills ${personLabel} on Kundli Matching.`
        }
      />

        {(draft?.a.name || draft?.b.name) && (
          <p className="mt-3 rounded-card border border-border/70 bg-surface/60 px-3.5 py-2.5 font-mono text-label uppercase tracking-[0.1em] text-muted">
            Filling {personLabel}
            {draft.a.name || draft.b.name
              ? ` · draft kept for ${[draft.a.name, draft.b.name].filter(Boolean).join(' / ') || 'both'}`
              : ''}
          </p>
        )}

        {available.length > 0 && (
          <div className="mt-5">
            <Input
              inputSize="md"
              tone="sunken"
              icon={<Search />}
              type="search"
              placeholder="Search by name or place"
              aria-label="Search saved profiles"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
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
          </div>
        )}

        {available.length === 0 ? (
          <EmptyState
            className="mt-8"
            icon={<Users />}
            title={
              profiles.length === 0
                ? 'No saved profiles yet'
                : 'No other profiles left'
            }
            description={
              profiles.length === 0
                ? 'Add someone from Profile, then return here to fill the match form.'
                : 'The other person already uses your only saved chart. Add another profile to match against.'
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            className="mt-8"
            variant="inline"
            icon={<Search />}
            title="Nothing matches that"
            description={`No saved profile mentions “${trimmedQuery}”. Try another name or place.`}
          />
        ) : (
          <div className="mt-6 space-y-6">
            {grouped.map((group) => (
              <section key={group.relation} className="space-y-2">
                <h2 className="px-0.5 font-mono text-label uppercase tracking-[0.12em] text-faint">
                  {group.label}
                </h2>
                <ul className="overflow-hidden rounded-panel border border-border bg-surface divide-y divide-border/80">
                  {group.items.map((profile) => {
                    const selected =
                      (slot === 'a' && draft?.a.profileId === profile.id) ||
                      (slot === 'b' && draft?.b.profileId === profile.id)
                    return (
                      <li key={profile.id}>
                        <button
                          type="button"
                          onClick={() => choose(profile.id)}
                          className={cn(
                            'flex w-full items-center gap-3 px-4 py-3.5 text-left',
                            'transition-colors hover:bg-navy-soft/70',
                            selected && 'bg-copper/10',
                          )}
                        >
                          <Avatar name={profile.name} size="md" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sub font-medium text-ink">
                              {profile.name}
                            </span>
                            <span className="mt-0.5 block truncate font-mono text-label uppercase text-muted">
                              {profile.note ? `${profile.note} · ` : ''}
                              {formatDateShort(profile.birthDetails.date)} ·{' '}
                              {profile.birthDetails.timeUnknown
                                ? 'time unknown'
                                : formatTime12(profile.birthDetails.time)}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-faint">
                              {profile.birthDetails.place.label}
                            </span>
                          </span>
                          {selected ? (
                            <Check className="size-4 shrink-0 text-gold-deep" aria-hidden />
                          ) : (
                            <ChevronRight className="size-4 shrink-0 text-faint" aria-hidden />
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </PageContainer>
  )
}
