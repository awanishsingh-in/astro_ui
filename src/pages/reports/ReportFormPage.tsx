import { Calculator } from 'lucide-react'
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

/**
 * Birth form for a paid report — Check goes to the payment gateway.
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

  return (
    <PageContainer width="content" className="pb-16 pt-4 sm:pt-6">
      <article className="mx-auto max-w-lg animate-rise space-y-6">
        <button
          type="button"
          onClick={() => navigate(paths.reportIntro(topic.id), { replace: true })}
          className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
        >
          ← Back
        </button>

        <header className="space-y-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            {topic.title}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Enter the birth chart
          </h1>
          <p className="text-sm leading-relaxed text-muted text-pretty">
            Same details Matching uses. Check continues to payment.
          </p>
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
          iconLeft={<Calculator className="size-4" />}
          onClick={runCheck}
        >
          Check
        </Button>
      </article>
    </PageContainer>
  )
}
