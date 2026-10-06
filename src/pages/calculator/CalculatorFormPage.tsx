import { Calculator, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
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
import { calculatorById, type CalculatorKind } from '@/data/calculator-hub'
import { buildCalculatorResult } from '@/data/calculator-mock'
import { PageContainer } from '@/layouts/PageContainer'
import { useProfiles } from '@/profiles/profiles-context'
import { paths } from '@/routes/paths'
import {
  clearMatchDraft,
  consumeMatchPick,
  personFromProfile,
  readMatchDraft,
  saveMatchDraft,
} from '@/utils/match-draft'
import { cn } from '@/utils/cn'

/**
 * One calculator — single birth form + Check → result page.
 * Fits the immersive viewport (no page scroll); chrome Back returns to the prior screen.
 */
export default function CalculatorFormPage() {
  const { kind = '' } = useParams<{ kind: string }>()
  const card = calculatorById(kind)
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { profiles } = useProfiles()

  const [person, setPerson] = useState<PersonDraft>(emptyPerson)
  const [errors, setErrors] = useState<PersonErrors>({})
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const draft = readMatchDraft()
    if (draft?.focus === 'a' && draft.a.name && draft.returnTo === paths.calculator(kind)) {
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
  }, [kind, profiles, toast])

  const openSavedProfiles = useCallback(() => {
    saveMatchDraft({
      a: person,
      b: emptyPerson,
      focus: 'a',
      returnTo: paths.calculator(kind),
    })
    navigate(`${paths.matchingProfiles}?for=a`)
  }, [kind, navigate, person])

  const runCheck = useCallback(() => {
    if (!card) return
    const found = validatePerson(person)
    setErrors(found)
    if (Object.keys(found).length) return

    setChecking(true)
    window.setTimeout(() => {
      const result = buildCalculatorResult(
        card.id as CalculatorKind,
        person.name,
        toBirthDetails(person),
        person.profileId,
      )
      setChecking(false)
      navigate(paths.calculatorResult(card.id), {
        state: {
          result,
          from: (location.state as { from?: string } | null)?.from,
        },
      })
    }, 650)
  }, [card, location.state, navigate, person])

  if (!user) return null
  if (!card) return <Navigate to={paths.calculatorRoot} replace />

  return (
    <PageContainer
      width="content"
      flush
      className="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden px-5 py-3 md:px-6 lg:px-8 lg:py-4"
    >
      <article className="mx-auto flex h-full min-h-0 w-full max-w-xl flex-col gap-3 animate-rise">
        <header className="relative shrink-0 overflow-hidden rounded-[1.35rem] border border-[#7c4dff]/35 px-4 py-3.5 sm:px-5 sm:py-4">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(124,77,255,0.28)_0%,rgba(15,12,36,0.92)_55%,rgba(58,123,213,0.2)_100%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[#7c4dff]/35 blur-3xl"
          />
          <div className="relative space-y-1.5">
            <p className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c4a0ff]">
              <Sparkles className="size-3" aria-hidden />
              {card.title}
            </p>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Enter the birth chart
            </h1>
            <p className="text-xs text-white/65 text-pretty sm:text-sm">{card.hint}</p>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-[1.35rem]">
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
            className="h-auto"
          />
        </div>

        <div className="shrink-0 pb-1">
          <Button
            variant="primary"
            size="lg"
            className={cn(
              'w-full rounded-full',
              'shadow-[0_14px_36px_-12px_rgba(124,77,255,0.9)]',
            )}
            loading={checking}
            iconLeft={<Calculator className="size-4" />}
            onClick={runCheck}
          >
            {checking ? 'Checking…' : 'Check'}
          </Button>
        </div>
      </article>
    </PageContainer>
  )
}
