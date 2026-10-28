import type { CSSProperties } from 'react'
import { Calculator } from 'lucide-react'
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
import {
  CALCULATOR_ACCENT,
  calculatorById,
  type CalculatorKind,
} from '@/data/calculator-hub'
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
import './CalculatorFormPage.css'

/** One calculator — single birth form + Check → result page. */
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

  const accent = card ? CALCULATOR_ACCENT[card.id] : CALCULATOR_ACCENT.manglik
  const Icon = card?.icon

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
  if (!card || !Icon) return <Navigate to={paths.calculatorRoot} replace />

  return (
    <PageContainer
      width="content"
      flush
      className="px-5 py-3 md:px-6 lg:px-8 lg:py-4"
    >
      <article
        className="calc-form-shell mx-auto flex w-full max-w-xl flex-col gap-3"
        style={{ '--calc-accent': accent } as CSSProperties}
      >
        <header
          className={cn(
            'calc-form-hero relative shrink-0 overflow-hidden rounded-[1.5rem]',
            'border border-[color-mix(in_srgb,var(--calc-accent)_42%,transparent)]',
            'px-4 py-4 sm:px-5 sm:py-5',
            'shadow-[0_18px_44px_-28px_var(--calc-accent-glow)]',
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 32%, transparent) 0%,  52%, color-mix(in srgb, var(--color-info) 22%, transparent) 100%)`,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full opacity-50 blur-3xl motion-safe:animate-pulse-soft"
            style={{ background: accent }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-14 -left-10 size-32 rounded-full bg-secondary/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--calc-accent)_70%,transparent)] to-transparent"
          />

          <div className="relative flex items-start gap-3.5">
            <span
              className={cn(
                'inline-flex size-12 shrink-0 items-center justify-center rounded-2xl',
                'border border-[color-mix(in_srgb,var(--calc-accent)_50%,transparent)]',
                'bg-[color-mix(in_srgb,var(--calc-accent)_18%,transparent)]',
                'text-[var(--calc-accent)] shadow-[0_0_28px_-8px_var(--calc-accent-glow)]',
              )}
            >
              <Icon className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Enter the birth chart
              </h1>
            </div>
          </div>
        </header>

        <div className="calc-form-card rounded-[1.5rem]">
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
            className={cn(
              'h-auto border-[color-mix(in_srgb,var(--calc-accent)_32%,transparent)]',
              'bg-[color-mix(in_srgb,var(--color-surface)_92%,var(--calc-accent))]',
              'shadow-[0_16px_40px_-28px_var(--calc-accent-glow)]',
            )}
          />
        </div>

        <Button
          variant="primary"
          size="lg"
          className={cn(
            'calc-form-check w-full rounded-full',
            'shadow-[0_14px_36px_-12px_var(--calc-accent-glow)]',
          )}
          loading={checking}
          iconLeft={<Calculator className="size-4" />}
          onClick={runCheck}
        >
          {checking ? 'Checking…' : `Check ${card.title}`}
        </Button>
      </article>
    </PageContainer>
  )
}
