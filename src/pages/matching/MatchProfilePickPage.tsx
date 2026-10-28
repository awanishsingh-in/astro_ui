import { Search, Users, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Avatar } from '@/components/common/Avatar'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { IconButton } from '@/components/common/IconButton'
import { Input } from '@/components/forms/Input'
import { MatchThemeShell } from '@/components/matching/MatchThemeShell'
import { useAuth } from '@/auth/auth-context'
import {
  ADDABLE_RELATIONS,
  RELATION_LABEL,
  RELATION_ORDER,
  type ProfileRelation,
} from '@/data/profiles'
import { PageContainer } from '@/layouts/PageContainer'
import { useProfiles } from '@/profiles/profiles-context'
import { paths } from '@/routes/paths'
import { emptyPerson } from '@/components/matching/PersonForm'
import {
  readMatchDraft,
  saveMatchDraft,
  saveMatchPick,
  type MatchPersonSlot,
} from '@/utils/match-draft'
import { cn } from '@/utils/cn'
import { formatDateShort, formatTime12 } from '@/utils/format'

type CategoryFilter = 'all' | ProfileRelation

/**
 * Full-page saved profiles — browse from account, or pick for Matching / calculators.
 */
export default function MatchProfilePickPage() {
  const { user } = useAuth()
  const { profiles, select } = useProfiles()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')

  const browseMode = location.pathname === paths.savedProfiles
  const slotParam = params.get('for')
  const slot: MatchPersonSlot = slotParam === 'b' ? 'b' : 'a'
  const draft = readMatchDraft()
  const returnTo = draft?.returnTo ?? paths.matching
  // Don't offer the chart already filling the other person (pick mode only).
  const takenByOther = browseMode
    ? undefined
    : slot === 'a'
      ? draft?.b.profileId
      : draft?.a.profileId

  const available = useMemo(
    () =>
      takenByOther
        ? profiles.filter((p) => p.id !== takenByOther)
        : profiles,
    [profiles, takenByOther],
  )

  /** Same folders as “add another profile” — Family, Friend, Relative, Other. */
  const categoryOptions = ADDABLE_RELATIONS

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return available.filter((p) => {
      if (category !== 'all' && p.relation !== category) return false
      if (!q) return true
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
  }, [available, query, category])

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
    if (browseMode) {
      select(profileId)
      navigate(paths.chart)
      return
    }
    saveMatchPick({ slot, profileId })
    navigate(returnTo, { replace: true })
  }

  const addSomeoneNew = () => {
    if (browseMode) {
      navigate(`${paths.profile}?add=1`)
      return
    }
    // Clear this slot so Matching opens blank for manual entry.
    const current = readMatchDraft()
    saveMatchDraft({
      a: slot === 'a' ? emptyPerson : (current?.a ?? emptyPerson),
      b: slot === 'b' ? emptyPerson : (current?.b ?? emptyPerson),
      focus: slot,
      returnTo: current?.returnTo ?? returnTo,
    })
    navigate(returnTo)
  }

  const trimmedQuery = query.trim()
  const emptyAfterFilter =
    category !== 'all' && filtered.length === 0 && !trimmedQuery

  return (
    <MatchThemeShell>
      <PageContainer width="content">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Saved <span className="text-silver-300">profile</span>
            </h1>
            <p className="max-w-xl text-sm text-muted text-pretty">
              {browseMode
                ? 'Your saved charts — open one anytime.'
                : returnTo === paths.matchingManglik
                  ? 'Pick a saved chart for the Manglik dosha calculator.'
                  : `Pick who to match${draft?.a.name || draft?.b.name ? ` with ${[draft.a.name, draft.b.name].filter(Boolean).join(' / ')}` : ''}. Your other side is kept.`}
            </p>
          </div>

          {available.length > 0 && (
            <div className="flex max-w-full shrink-0 flex-col gap-1.5 self-start sm:items-end sm:self-center">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
                Category
              </span>
              <div
                role="tablist"
                aria-label="Filter by category"
                className="flex max-w-[min(100vw-2rem,28rem)] flex-wrap justify-end gap-1.5"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={category === 'all'}
                  onClick={() => setCategory('all')}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                    category === 'all'
                      ? 'bg-copper text-[var(--btn-primary-fg)]'
                      : 'border border-border text-muted hover:border-copper/50 hover:text-ink',
                  )}
                >
                  All
                </button>
                {categoryOptions.map((relation) => {
                  const active = category === relation
                  return (
                    <button
                      key={relation}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setCategory(relation)}
                      className={cn(
                        'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                        active
                          ? 'bg-copper text-[var(--btn-primary-fg)]'
                          : 'border border-border text-muted hover:border-copper/50 hover:text-ink',
                      )}
                    >
                      {RELATION_LABEL[relation]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </header>

        {available.length > 0 && (
          <div className="mt-5">
            <Input
              inputSize="md"
              tone="celestial"
              icon={<Search />}
              type="search"
              placeholder="Search by name"
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
                ? browseMode
                  ? 'Add someone from Profile — they’ll show up here.'
                  : 'Add someone from Profile, then return here to fill the match form.'
                : 'The other person already uses your only saved chart. Add another profile to match against.'
            }
            action={
              !browseMode && profiles.length === 0 ? (
                <Button variant="primary" size="md" className="rounded-full" onClick={addSomeoneNew}>
                  Enter birth details
                </Button>
              ) : undefined
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            className="mt-8"
            variant="inline"
            icon={emptyAfterFilter ? <Users /> : <Search />}
            title={
              emptyAfterFilter
                ? `No ${RELATION_LABEL[category as ProfileRelation].toLowerCase()} charts`
                : 'Nothing matches that'
            }
            description={
              emptyAfterFilter
                ? browseMode
                  ? 'Try another category.'
                  : 'Try another category, or add someone new below.'
                : `No saved profile mentions “${trimmedQuery}”. Try another name or place.`
            }
          />
        ) : (
          <div className="mt-6 space-y-6">
            {grouped.map((group) => (
              <section key={group.relation} className="space-y-2">
                {category === 'all' && (
                  <h2 className="px-0.5 font-mono text-label uppercase tracking-[0.12em] text-faint">
                    {group.label}
                  </h2>
                )}
                <ul className="space-y-2">
                  {group.items.map((profile) => {
                    const selected =
                      (slot === 'a' && draft?.a.profileId === profile.id) ||
                      (slot === 'b' && draft?.b.profileId === profile.id)
                    const takenAsOther =
                      (slot === 'a' && draft?.b.profileId === profile.id) ||
                      (slot === 'b' && draft?.a.profileId === profile.id)
                    return (
                      <li key={profile.id}>
                        {takenAsOther ? (
                          <div
                            className={cn(
                              'flex w-full items-center gap-3 rounded-[1.15rem] border px-4 py-3.5',
                              'border-border/60 bg-surface/70 opacity-70',
                            )}
                          >
                            <Avatar name={profile.name} size="md" />
                            <span className="min-w-0 flex-1 text-left">
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="truncate text-sub font-medium text-ink">
                                  {profile.name}
                                </span>
                                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-silver-300">
                                  {RELATION_LABEL[profile.relation]}
                                </span>
                              </span>
                              <span className="mt-0.5 block truncate font-mono text-label uppercase text-muted">
                                {formatDateShort(profile.birthDetails.date)} ·{' '}
                                {profile.birthDetails.timeUnknown
                                  ? 'time unknown'
                                  : formatTime12(profile.birthDetails.time)}
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-faint">
                                {profile.birthDetails.place.label}
                              </span>
                            </span>
                            <span className="shrink-0 text-xs text-muted">
                              Already the other person
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => choose(profile.id)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-[1.15rem] border px-4 py-3.5 text-left',
                              'transition hover:border-copper/50 hover:bg-copper/5',
                              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper',
                              selected
                                ? 'border-copper/60 bg-copper/10 shadow-[0_0_24px_-12px_rgba(201,145,115,0.55)]'
                                : 'border-border bg-surface',
                            )}
                          >
                            <Avatar name={profile.name} size="md" />
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="truncate text-sub font-medium text-ink">
                                  {profile.name}
                                </span>
                                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-silver-300">
                                  {RELATION_LABEL[profile.relation]}
                                </span>
                              </span>
                              <span className="mt-0.5 block truncate font-mono text-label uppercase text-muted">
                                {formatDateShort(profile.birthDetails.date)} ·{' '}
                                {profile.birthDetails.timeUnknown
                                  ? 'time unknown'
                                  : formatTime12(profile.birthDetails.time)}
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-faint">
                                {profile.birthDetails.place.label}
                              </span>
                            </span>
                            {selected && (
                              <span className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-silver-300">
                                Selected
                              </span>
                            )}
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}

            {!browseMode && (
              <button
                type="button"
                onClick={addSomeoneNew}
                className="flex w-full items-center justify-center gap-2 rounded-[1.15rem] border border-dashed border-border-strong px-4 py-4 text-sm font-semibold text-silver-300 hover:border-copper/60 hover:bg-copper/5"
              >
                + Someone new: enter their birth details
              </button>
            )}
          </div>
        )}
      </PageContainer>
    </MatchThemeShell>
  )
}
