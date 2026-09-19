import { ArrowRight, Heart, Info, RotateCw } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { SectionHeader } from '@/components/common/SectionHeader'
import { Field } from '@/components/forms/Field'
import { Select } from '@/components/forms/Select'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { useAuth } from '@/auth/auth-context'
import type { CompatibilityResult } from '@/data/compatibility-mock'
import { useProfiles } from '@/profiles/profiles-context'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'
import { getCompatibility } from '@/services/astrology.service'
import { toAppError } from '@/services/client'
import type { AppError } from '@/types/ui'
import { cn } from '@/utils/cn'

/**
 * Love compatibility - the lighter read.
 *
 * Two saved charts, four dimensions, one sketch. It exists because people ask
 * for a quick answer, and it is honest about being quick: every screen here
 * points at Kundli Matching for the full eight kootas.
 */
export default function CompatibilityPage() {
  const { user } = useAuth()

  const { profiles, selectedId } = useProfiles()

  // Start from whichever chart is being read elsewhere in the app.
  const [aId, setAId] = useState(selectedId)
  const [bId, setBId] = useState(
    profiles.find((p) => p.id !== selectedId)?.id ?? profiles[0]?.id ?? '',
  )
  const [result, setResult] = useState<CompatibilityResult | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<AppError | null>(null)

  const sameChart = aId === bId

  const check = useCallback(async () => {
    const a = profiles.find((p) => p.id === aId)
    const b = profiles.find((p) => p.id === bId)
    if (!a || !b || a.id === b.id) return

    setIsChecking(true)
    setError(null)
    try {
      setResult(
        await getCompatibility(
          { name: a.name, details: a.birthDetails, profileId: a.id },
          { name: b.name, details: b.birthDetails, profileId: b.id },
        ),
      )
    } catch (caught) {
      setError(toAppError(caught))
    } finally {
      setIsChecking(false)
    }
  }, [aId, bId, profiles])

  if (!user) return null

  const options = profiles.map((p) => ({
    value: p.id,
    label: `${p.name}${p.note ? ` · ${p.note}` : ''}`,
  }))

  return (
    <>
      <MobileHeader title="Compatibility" showBack user={user} />

      <PageContainer width="content">
        <SectionHeader
          as="h1"
          size="lg"
          className="max-lg:[&>div>h1]:sr-only"
          title="Love compatibility"
          description="A quick read between two saved charts - temperament, pace, mind and distance."
        />

        <Card padding="lg" className="mt-8 gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="First chart">
              <Select
                inputSize="md"
                options={options}
                value={aId}
                onChange={(event) => { setAId(event.target.value); setResult(null) }}
              />
            </Field>
            <Field
              label="Second chart"
              error={sameChart ? 'Pick two different charts.' : undefined}
            >
              <Select
                inputSize="md"
                options={options}
                value={bId}
                invalid={sameChart}
                onChange={(event) => { setBId(event.target.value); setResult(null) }}
              />
            </Field>

            <Button
              onClick={() => void check()}
              disabled={sameChart}
              loading={isChecking}
              fullWidth
              size="lg"
              iconLeft={
                <Heart
                  className={cn('size-4', !isChecking && 'motion-safe:animate-pulse-soft')}
                  aria-hidden
                />
              }
              className="sm:col-span-2 shadow-glow"
            >
              {isChecking ? 'Reading both charts' : 'Check compatibility'}
            </Button>
          </div>
        </Card>

        {error && <ErrorState className="mt-6" variant="inline" error={error} onRetry={() => void check()} />}

        {isChecking && !result && (
          <LoadingState className="mt-6" variant="calculating" label="Reading both moon signs…" />
        )}

        {result && !isChecking && (
          <CompatibilityReport result={result} onReset={() => setResult(null)} />
        )}
      </PageContainer>
    </>
  )
}

function CompatibilityReport({
  result,
  onReset,
}: {
  result: CompatibilityResult
  onReset: () => void
}) {
  return (
    <div className="mt-8 space-y-6 animate-rise">
      {/* The two signs facing each other - the whole read, in one band. */}
      <Card padding="lg" className="gap-6">
        <div className="flex items-center justify-between gap-4">
          <Side person={result.a} align="start" />
          <div className="shrink-0 text-center">
            <p className="font-mono text-display text-ink">{result.overall}</p>
            <p className="font-mono text-label uppercase text-muted">of 100</p>
          </div>
          <Side person={result.b} align="end" />
        </div>

        <p className="text-body text-ink text-pretty">{result.summary}</p>
      </Card>

      <Card padding="lg" className="gap-5">
        <p className="font-mono text-label uppercase text-muted">The four dimensions</p>
        <ul className="space-y-4">
          {result.dimensions.map((dimension) => (
            <li key={dimension.label} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sub font-medium text-ink">{dimension.label}</span>
                <span className="font-mono text-data text-muted">{dimension.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className={cn(
                    'h-full rounded-full transition-[width] duration-700 ease-out-soft',
                    dimension.value >= 70 ? 'bg-gold' : dimension.value >= 58 ? 'bg-navy' : 'bg-border-strong',
                  )}
                  style={{ width: `${dimension.value}%` }}
                />
              </div>
              <p className="text-sm text-muted text-pretty">{dimension.detail}</p>
            </li>
          ))}
        </ul>
      </Card>

      {result.frictions.length > 0 && (
        <Card tone="sunken" padding="lg" className="gap-2">
          <p className="font-mono text-label uppercase text-caution">Where it asks more</p>
          <ul className="space-y-1.5">
            {result.frictions.map((friction) => (
              <li key={friction} className="text-sm text-purple text-pretty">
                {friction}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="flex items-start gap-2 rounded-card border border-border p-4 text-xs text-muted text-pretty">
        <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        {result.caveat}
      </p>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button variant="secondary" size="sm" to={paths.matching} iconRight={<ArrowRight className="size-4" />}>
          Run the full Guna Milan
        </Button>
        <Button variant="ghost" size="sm" onClick={onReset} iconLeft={<RotateCw className="size-4" />}>
          Pick two others
        </Button>
      </div>
    </div>
  )
}

function Side({
  person,
  align,
}: {
  person: CompatibilityResult['a']
  align: 'start' | 'end'
}) {
  return (
    <div className={cn('min-w-0 flex-1', align === 'end' && 'text-right')}>
      <p className="truncate text-sub font-medium text-ink">{person.name}</p>
      <p className="truncate font-mono text-data text-purple">{person.rashi}</p>
      <p className="font-mono text-label uppercase text-muted">
        {person.element} · {person.mode}
      </p>
    </div>
  )
}
