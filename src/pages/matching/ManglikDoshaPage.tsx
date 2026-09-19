import { Calculator, Orbit, RotateCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { SectionHeader } from '@/components/common/SectionHeader'
import {
  emptyPerson,
  PersonForm,
  toBirthDetails,
  validatePerson,
  type PersonDraft,
  type PersonErrors,
} from '@/components/matching/PersonForm'
import { useToast } from '@/components/feedback/toast-context'
import { useAuth } from '@/auth/auth-context'
import { MANGLIK_HOUSES, type ManglikResult } from '@/data/manglik-mock'
import { PageContainer } from '@/layouts/PageContainer'
import { useProfiles } from '@/profiles/profiles-context'
import { paths } from '@/routes/paths'
import { getManglik } from '@/services/astrology.service'
import { toAppError } from '@/services/client'
import type { AppError } from '@/types/ui'
import {
  clearMatchDraft,
  consumeMatchPick,
  personFromProfile,
  readMatchDraft,
  saveMatchDraft,
} from '@/utils/match-draft'
import { cn } from '@/utils/cn'

/**
 * Manglik / Kuja dosha calculator — enter one birth chart and read Mars houses.
 */
export default function ManglikDoshaPage() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const { profiles } = useProfiles()

  const [person, setPerson] = useState<PersonDraft>(emptyPerson)
  const [errors, setErrors] = useState<PersonErrors>({})
  const [result, setResult] = useState<ManglikResult | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<AppError | null>(null)

  // Reuse matching's saved-profile pick draft when returning from /matching/profiles.
  useEffect(() => {
    const draft = readMatchDraft()
    if (draft?.focus === 'a' && draft.a.name) {
      setPerson(draft.a)
      clearMatchDraft()
    }

    const pick = consumeMatchPick()
    if (!pick || pick.slot !== 'a') return
    const profile = profiles.find((p) => p.id === pick.profileId)
    if (!profile) return
    setPerson(personFromProfile(profile))
    setErrors({})
    toast.success('Filled chart', { description: profile.name })
  }, [profiles, toast])

  const openSavedProfiles = useCallback(() => {
    saveMatchDraft({
      a: person,
      b: emptyPerson,
      focus: 'a',
      returnTo: paths.matchingManglik,
    })
    navigate(`${paths.matchingProfiles}?for=a`)
  }, [navigate, person])

  const run = useCallback(async () => {
    const found = validatePerson(person)
    setErrors(found)
    if (Object.keys(found).length) return

    setIsChecking(true)
    setError(null)
    try {
      const next = await getManglik({
        name: person.name.trim(),
        details: toBirthDetails(person),
        profileId: person.profileId,
      })
      setResult(next)
    } catch (caught) {
      setError(toAppError(caught))
      setResult(null)
    } finally {
      setIsChecking(false)
    }
  }, [person])

  const reset = () => {
    setResult(null)
    setError(null)
    setPerson(emptyPerson)
    setErrors({})
  }

  if (!user) return null

  return (
    <PageContainer width="content">
      <SectionHeader
        as="h1"
        size="lg"
        title="Manglik dosha calculator"
        description="See whether Mars sits in a classical Kuja-dosha house for one birth chart."
      />

      {!result && (
        <div className="mt-8 space-y-6">
          <PersonForm
            label="Birth chart"
            person={person}
            errors={errors}
            onChange={(next) => {
              setPerson(next)
              setErrors({})
            }}
            hasSavedProfiles={profiles.length > 0}
            onUseSavedProfile={openSavedProfiles}
          />

          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={() => void run()}
              loading={isChecking}
              iconLeft={<Calculator className="size-4" />}
              className="w-full max-w-sm rounded-full px-10 sm:w-auto"
            >
              {isChecking ? 'Checking Mars…' : 'Calculate Manglik'}
            </Button>
            <p className="max-w-md text-center text-xs text-muted text-pretty">
              Houses checked: {MANGLIK_HOUSES.join(', ')}. Same reading Matching uses for both
              persons.
            </p>
          </div>

          {isChecking && (
            <LoadingState variant="calculating" label="Placing Mars on the chart…" />
          )}
          {error && !isChecking && (
            <ErrorState error={error} onRetry={() => void run()} />
          )}
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6 animate-rise">
          <Card
            padding="lg"
            className={cn(
              'gap-5 border-border/80',
              result.isManglik ? 'bg-copper/10 border-copper/35' : 'bg-surface/90',
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-label uppercase tracking-[0.14em] text-gold-deep">
                  Result
                </p>
                <h2 className="mt-1 text-title text-ink">{result.summary}</h2>
              </div>
              <Badge tone={result.isManglik ? 'caution' : 'positive'}>
                {result.isManglik ? 'Manglik' : 'Not Manglik'}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Name" value={result.name} />
              <Stat
                label="Mars house"
                value={result.marsBhava != null ? `Bhava ${result.marsBhava}` : '—'}
              />
              <Stat label="Mars rashi" value={result.marsRashi ?? '—'} />
            </div>

            <p className="text-sub text-ink text-pretty">{result.detail}</p>
            <p className="border-t border-border/70 pt-4 text-sm text-muted text-pretty">
              {result.caveat}
            </p>
          </Card>

          <Card tone="sunken" padding="md" className="gap-2">
            <p className="flex items-center gap-2 font-mono text-label uppercase text-muted">
              <Orbit className="size-3.5" aria-hidden />
              Classical houses
            </p>
            <p className="text-sm text-purple text-pretty">
              Manglik is read when Mars occupies house {MANGLIK_HOUSES.join(', ')}. Other placements
              are treated as clear of this dosha in this calculator.
            </p>
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={reset}
              iconLeft={<RotateCw className="size-4" />}
            >
              Check another chart
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate(paths.matching)}>
              Back to Matching
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-border/70 bg-surface/50 px-3.5 py-3">
      <p className="font-mono text-label uppercase tracking-[0.12em] text-faint">{label}</p>
      <p className="mt-1 text-sub font-medium text-ink">{value}</p>
    </div>
  )
}
