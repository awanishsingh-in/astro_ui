import { ArrowRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import {
  emptyPerson,
  PersonForm,
  validatePerson,
  type PersonDraft,
  type PersonErrors,
} from '@/components/matching/PersonForm'
import { useToast } from '@/components/feedback/toast-context'
import { useAuth } from '@/auth/auth-context'
import { reportById } from '@/data/reports-hub'
import { hasReportUnlocked, saveReportDraft } from '@/onboarding/reports-unlock'
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
 * Birth form for a paid report — continues to the payment gateway.
 */
export default function ReportFormPage() {
  const { reportId = '' } = useParams<{ reportId: string }>()
  const topic = reportById(reportId)
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const { profiles } = useProfiles()

  const [person, setPerson] = useState<PersonDraft>(emptyPerson)
  const [errors, setErrors] = useState<PersonErrors>({})

  useEffect(() => {
    const draft = readMatchDraft()
    if (draft?.focus === 'a' && draft.a.name && draft.returnTo === paths.reportForm(reportId)) {
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
  }, [profiles, reportId, toast])

  const openSavedProfiles = useCallback(() => {
    saveMatchDraft({
      a: person,
      b: emptyPerson,
      focus: 'a',
      returnTo: paths.reportForm(reportId),
    })
    navigate(`${paths.matchingProfiles}?for=a`)
  }, [navigate, person, reportId])

  const runCheck = () => {
    if (!topic) return
    const found = validatePerson(person)
    setErrors(found)
    if (Object.keys(found).length || !person.place) return

    saveReportDraft({
      reportId: topic.id,
      name: person.name.trim(),
      gender: person.gender,
      date: person.date,
      time: person.time,
      placeLabel: person.place.label,
      placeLat: person.place.latitude,
      placeLng: person.place.longitude,
      placeTz: person.place.timeZone,
      profileId: person.profileId,
    })
    navigate(paths.reportPay(topic.id))
  }

  if (!user) return null
  if (!topic) return <Navigate to={paths.reportsRoot} replace />
  if (hasReportUnlocked(user.id, topic.id)) {
    return <Navigate to={paths.reportView(topic.id)} replace />
  }

  const Icon = topic.icon

  return (
    <PageContainer width="content" flush className="px-5 py-4 md:px-6 lg:px-8 lg:py-5">
      <article className="mx-auto flex w-full max-w-xl animate-rise flex-col gap-3">
        <header className="flex items-start gap-3">
          <span
            className={cn(
              'rg-icon-tile inline-flex size-11 shrink-0 items-center justify-center rounded-2xl',
            )}
          >
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-sm font-medium text-silver-300">{topic.title}</p>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Enter the birth details
            </h1>
          </div>
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
          hideEyebrow
          showDetailsHeading={false}
          savedHint="Fill in one tap"
          className="h-auto"
        />

        <Button
          variant="primary"
          size="lg"
          className="w-full rounded-full"
          iconRight={<ArrowRight className="size-4" />}
          onClick={runCheck}
        >
          Continue to payment
        </Button>
      </article>
    </PageContainer>
  )
}
