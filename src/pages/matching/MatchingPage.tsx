import { HeartHandshake, Info, RotateCw } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { SectionHeader } from '@/components/common/SectionHeader'
import { GunaMilanChart } from '@/components/matching/GunaMilanChart'
import {
  emptyPerson,
  PersonForm,
  toBirthDetails,
  validatePerson,
  type PersonDraft,
  type PersonErrors,
} from '@/components/matching/PersonForm'
import { ScoreDial } from '@/components/matching/ScoreDial'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { useAuth } from '@/auth/auth-context'
import { useProfiles } from '@/profiles/profiles-context'
import { PageContainer } from '@/layouts/PageContainer'
import { getMatch } from '@/services/astrology.service'
import { toAppError } from '@/services/client'
import type { MatchResult } from '@/data/matching-mock'
import type { AppError } from '@/types/ui'
import { cn } from '@/utils/cn'
import { formatDateShort, formatTime12 } from '@/utils/format'

/**
 * Kundli Matching.
 *
 * Two charts in, eight kootas out. The number is shown once and the breakdown
 * is given the space, because the breakdown is what can actually be reasoned
 * about — and a single figure invites more confidence than the tradition
 * supports.
 */
export default function MatchingPage() {
  const { user } = useAuth()

  const { profiles } = useProfiles()

  const [a, setA] = useState<PersonDraft>(emptyPerson)
  const [b, setB] = useState<PersonDraft>(emptyPerson)
  const [errorsA, setErrorsA] = useState<PersonErrors>({})
  const [errorsB, setErrorsB] = useState<PersonErrors>({})

  const [result, setResult] = useState<MatchResult | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<AppError | null>(null)

  const check = useCallback(async () => {
    const foundA = validatePerson(a)
    const foundB = validatePerson(b)
    setErrorsA(foundA)
    setErrorsB(foundB)
    if (Object.keys(foundA).length || Object.keys(foundB).length) return

    setIsChecking(true)
    setError(null)
    try {
      setResult(
        await getMatch(
          { name: a.name.trim(), details: toBirthDetails(a), profileId: a.profileId },
          { name: b.name.trim(), details: toBirthDetails(b), profileId: b.profileId },
        ),
      )
    } catch (caught) {
      setError(toAppError(caught))
    } finally {
      setIsChecking(false)
    }
  }, [a, b])

  if (!user) return null

  return (
    <>
      <MobileHeader title="Kundli Matching" showBack user={user} />

      <PageContainer width="content">
        <SectionHeader
          as="h1"
          size="lg"
          className="max-lg:[&>div>h1]:sr-only"
          title="Kundli Matching"
          description="Guna Milan across thirty-six points, with every koota shown rather than summed away."
        />

        {result ? (
          <MatchReport result={result} onReset={() => { setResult(null); setError(null) }} />
        ) : (
          <div className="mt-8 space-y-6">
            <div className="grid gap-5 lg:grid-cols-2">
              <PersonForm
                label="Person 1"
                person={a}
                errors={errorsA}
                onChange={(next) => { setA(next); setErrorsA({}) }}
                profiles={profiles}
              />
              <PersonForm
                label="Person 2"
                person={b}
                errors={errorsB}
                onChange={(next) => { setB(next); setErrorsB({}) }}
                profiles={profiles}
              />
            </div>

            {error && <ErrorState variant="inline" error={error} onRetry={() => void check()} />}

            {isChecking ? (
              <LoadingState variant="calculating" label="Matching the two charts…" />
            ) : (
              <div className="space-y-4">
                <Button
                  fullWidth
                  onClick={() => void check()}
                  iconLeft={<HeartHandshake className="size-4" />}
                  className="lg:w-auto lg:px-10"
                >
                  Check compatibility
                </Button>
                <p className="flex items-start gap-2 text-xs text-muted text-pretty">
                  <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                  Guna Milan compares two birth stars against a classical checklist. It is one
                  tradition&rsquo;s method, not a measurement, and it says nothing about how two
                  people treat each other.
                </p>
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </>
  )
}

function MatchReport({ result, onReset }: { result: MatchResult; onReset: () => void }) {
  return (
    <div className="mt-8 space-y-8 animate-rise">
      <Card padding="lg" className="gap-6 lg:flex-row lg:items-center">
        <ScoreDial
          value={result.total}
          max={result.max}
          caption="gunas matched"
          className="mx-auto lg:mx-0"
        />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Person profile={result.a} />
            <Person profile={result.b} />
          </div>
          <p className="text-body text-ink text-pretty">{result.summary}</p>
          <p className="text-sm text-muted text-pretty">{result.caveat}</p>
        </div>
      </Card>

      <section aria-labelledby="kootas-title" className="space-y-4">
        <SectionHeader
          as="h2"
          size="md"
          title={<span id="kootas-title">The eight kootas</span>}
          description="Bar width is what each koota is worth, so Nadi&rsquo;s eight points read as eight times Varna&rsquo;s one."
        />
        <Card padding="lg">
          <GunaMilanChart kootas={result.kootas} />
        </Card>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Dimension
          title="Where it holds"
          tone="positive"
          items={result.strengths.map((k) => `${k.name} — ${k.detail}`)}
          empty="No koota scores full marks."
        />
        <Dimension
          title="Where it rubs"
          tone="caution"
          items={result.frictions.map((k) => `${k.name} — ${k.concern ?? k.detail}`)}
          empty="No koota falls badly short."
        />
      </div>

      <Card tone="sunken" padding="lg" className="gap-2">
        <p className="font-mono text-label uppercase text-muted">Manglik</p>
        <p className="text-sub text-purple text-pretty">{result.manglik.note}</p>
      </Card>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={onReset}
          iconLeft={<RotateCw className="size-4" />}
        >
          Match two other charts
        </Button>
      </div>
    </div>
  )
}

function Person({ profile }: { profile: MatchResult['a'] }) {
  return (
    <span className="min-w-0">
      <span className="block truncate text-sub font-medium text-ink">{profile.name}</span>
      <span className="block font-mono text-label uppercase text-muted">
        {formatDateShort(profile.details.date)} · {formatTime12(profile.details.time)} ·{' '}
        {profile.moonRashi} · {profile.moonNakshatra}
      </span>
    </span>
  )
}

function Dimension({
  title,
  tone,
  items,
  empty,
}: {
  title: string
  tone: 'positive' | 'caution'
  items: string[]
  empty: string
}) {
  return (
    <Card padding="lg" className="gap-3">
      <div className="flex items-center gap-2">
        <h3 className="text-heading font-semibold text-ink">{title}</h3>
        <Badge tone={tone} mono>
          {items.length}
        </Badge>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item} className="flex gap-3 text-sm text-purple">
              <span
                aria-hidden
                className={cn(
                  'mt-1.5 size-1.5 shrink-0 rounded-full',
                  tone === 'positive' ? 'bg-dignity-exalted' : 'bg-caution',
                )}
              />
              <span className="text-pretty">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
