import { Calculator } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
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

/**
 * One calculator — single birth form + Check → result page.
 */
export default function CalculatorFormPage() {
  const { kind = '' } = useParams<{ kind: string }>()
  const card = calculatorById(kind)
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
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
      navigate(paths.calculatorResult(card.id), { state: { result } })
    }, 650)
  }, [card, navigate, person])

  if (!user) return null
  if (!card) return <Navigate to={paths.calculatorRoot} replace />

  return (
    <PageContainer width="content" className="pb-16 pt-4 sm:pt-6">
      <article className="mx-auto max-w-lg animate-rise space-y-6">
        <button
          type="button"
          onClick={() => navigate(paths.calculatorRoot)}
          className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
        >
          ← All calculators
        </button>

        <header className="space-y-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            {card.title}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Enter the birth chart
          </h1>
          <p className="text-sm leading-relaxed text-muted text-pretty">{card.hint}</p>
        </header>

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

        <Button
          variant="primary"
          size="lg"
          className="w-full rounded-full"
          loading={checking}
          iconLeft={<Calculator className="size-4" />}
          onClick={runCheck}
        >
          {checking ? 'Checking…' : 'Check'}
        </Button>
      </article>
    </PageContainer>
  )
}
