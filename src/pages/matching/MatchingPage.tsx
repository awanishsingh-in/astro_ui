import { ArrowLeft, Calculator, Download, HeartHandshake, Home, Info, RotateCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { SectionHeader } from '@/components/common/SectionHeader'
import { GunaMilanChart } from '@/components/matching/GunaMilanChart'
import {
  MatchDetailPdfFlow,
  type DetailPdfPhase,
} from '@/components/matching/MatchDetailPdfFlow'
import { MatchReportBook } from '@/components/matching/MatchReportBook'
import {
  emptyPerson,
  PersonForm,
  toBirthDetails,
  validatePerson,
  type PersonDraft,
  type PersonErrors,
} from '@/components/matching/PersonForm'
import { ScoreDial } from '@/components/matching/ScoreDial'
import { useToast } from '@/components/feedback/toast-context'
import { useAuth } from '@/auth/auth-context'
import {
  MATCH_TYPES,
  matchTypeLabel,
  type MatchRelationType,
} from '@/data/match-types'
import { useProfiles } from '@/profiles/profiles-context'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'
import { getMatch } from '@/services/astrology.service'
import { toAppError } from '@/services/client'
import type { MatchResult } from '@/data/matching-mock'
import type { AppError } from '@/types/ui'
import { cn } from '@/utils/cn'
import { formatDateShort, formatTime12 } from '@/utils/format'
import {
  clearMatchDraft,
  consumeMatchPick,
  personFromProfile,
  readMatchDraft,
  saveMatchDraft,
  type MatchPersonSlot,
} from '@/utils/match-draft'
import {
  createMatchReportPdfBlob,
  downloadMatchReportPdf,
} from '@/utils/match-report-download'

type Step = 'details' | 'type' | 'result' | 'pdf'

/**
 * Kundli Matching - details → match type → Guna Milan result.
 */
export default function MatchingPage() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const { profiles } = useProfiles()

  const [step, setStep] = useState<Step>('details')
  const [a, setA] = useState<PersonDraft>(emptyPerson)
  const [b, setB] = useState<PersonDraft>(emptyPerson)
  const [errorsA, setErrorsA] = useState<PersonErrors>({})
  const [errorsB, setErrorsB] = useState<PersonErrors>({})
  const [matchType, setMatchType] = useState<MatchRelationType | null>(null)

  const [result, setResult] = useState<MatchResult | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<AppError | null>(null)
  const [detailPdfPhase, setDetailPdfPhase] = useState<DetailPdfPhase>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  // Restore draft + apply a profile chosen on the saved-profiles page.
  useEffect(() => {
    const draft = readMatchDraft()
    // Drafts owned by the Manglik calculator should not fill Matching.
    if (draft?.returnTo === paths.matchingManglik) return

    if (draft) {
      setA(draft.a)
      setB(draft.b)
      clearMatchDraft()
    }

    const pick = consumeMatchPick()
    if (!pick) return
    const profile = profiles.find((p) => p.id === pick.profileId)
    if (!profile) return
    const filled = personFromProfile(profile)
    if (pick.slot === 'a') {
      setA(filled)
      setErrorsA({})
    } else {
      setB(filled)
      setErrorsB({})
    }
    toast.success(`Filled ${pick.slot === 'a' ? 'Person 1' : 'Person 2'}`, {
      description: profile.name,
    })
  }, [profiles, toast])

  const openSavedProfiles = useCallback(
    (slot: MatchPersonSlot) => {
      saveMatchDraft({ a, b, focus: slot })
      navigate(`${paths.matchingProfiles}?for=${slot}`)
    },
    [a, b, navigate],
  )

  const goToMatchType = useCallback(() => {
    const foundA = validatePerson(a)
    const foundB = validatePerson(b)
    setErrorsA(foundA)
    setErrorsB(foundB)
    if (Object.keys(foundA).length || Object.keys(foundB).length) return
    setError(null)
    setMatchType(null)
    setStep('type')
  }, [a, b])

  const runMatch = useCallback(async () => {
    if (!matchType) return

    setIsChecking(true)
    setError(null)
    try {
      setResult(
        await getMatch(
          { name: a.name.trim(), details: toBirthDetails(a), profileId: a.profileId },
          { name: b.name.trim(), details: toBirthDetails(b), profileId: b.profileId },
        ),
      )
      setStep('result')
    } catch (caught) {
      setError(toAppError(caught))
    } finally {
      setIsChecking(false)
    }
  }, [a, b, matchType])

  const resetAll = () => {
    setResult(null)
    setError(null)
    setMatchType(null)
    setDetailPdfPhase(null)
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    setPdfUrl(null)
    setStep('details')
  }

  const downloadBasicReport = useCallback(() => {
    if (!result) return
    const filename = downloadMatchReportPdf(result, matchType, 'basic')
    toast.success('Basic report downloaded', {
      description: filename,
    })
  }, [result, matchType, toast])

  const openDetailPdfOffer = useCallback(() => {
    setDetailPdfPhase('offer')
  }, [])

  const completeDetailPayment = useCallback(() => {
    if (!result) return
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    const blob = createMatchReportPdfBlob(result, matchType, 'detailed')
    const url = URL.createObjectURL(blob)
    setPdfUrl(url)
    setDetailPdfPhase(null)
    setStep('pdf')
    toast.success('Payment successful', {
      description: 'Your detailed PDF is ready.',
    })
  }, [result, matchType, pdfUrl, toast])

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    }
  }, [pdfUrl])

  if (!user) return null

  if (step === 'pdf' && result && pdfUrl) {
    return (
      <DetailedPdfScreen
        result={result}
        matchType={matchType}
        onDownload={() => {
          const filename = downloadMatchReportPdf(result, matchType, 'detailed')
          toast.success('Detailed report downloaded', { description: filename })
        }}
        onHome={() => navigate(paths.ask)}
      />
    )
  }

  return (
    <>
      <PageContainer width="content">
        {step === 'details' && (
          <>
            <SectionHeader
              as="h1"
              size="lg"
              title="Kundli Matching"
              description="Guna Milan across thirty-six points, with every koota shown rather than summed away."
            />

            <div className="mt-8 space-y-6">
              <div className="grid gap-5 lg:grid-cols-2">
                <PersonForm
                  label="Person 1"
                  person={a}
                  errors={errorsA}
                  onChange={(next) => {
                    setA(next)
                    setErrorsA({})
                  }}
                  hasSavedProfiles={profiles.length > 0}
                  onUseSavedProfile={() => openSavedProfiles('a')}
                />
                <PersonForm
                  label="Person 2"
                  person={b}
                  errors={errorsB}
                  onChange={(next) => {
                    setB(next)
                    setErrorsB({})
                  }}
                  hasSavedProfiles={profiles.length > 0}
                  onUseSavedProfile={() => openSavedProfiles('b')}
                />
              </div>

              <div className="flex flex-col items-center space-y-4">
                <Button
                  onClick={goToMatchType}
                  iconLeft={<HeartHandshake className="size-4" />}
                  className="w-full max-w-sm rounded-full px-10 sm:w-auto"
                >
                  Check match
                </Button>
                <p className="flex max-w-xl items-start gap-2 text-center text-xs text-muted text-pretty sm:justify-center">
                  <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    Next you will choose how these two relate - partner, family, friend, and more -
                    then see the Guna Milan.
                  </span>
                </p>
              </div>
            </div>
          </>
        )}

        {step === 'type' && (
          <div className="mt-2 space-y-6 animate-rise sm:mt-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <SectionHeader
                as="h1"
                size="lg"
                title="Match type"
                description={`How does ${a.name.trim() || 'Person 1'} relate to ${b.name.trim() || 'Person 2'}?`}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('details')}
                iconLeft={<ArrowLeft className="size-4" />}
                className="rounded-full"
              >
                Back
              </Button>
            </div>

            <p className="rounded-card border border-border/70 bg-surface/60 px-4 py-3 font-mono text-label uppercase tracking-[0.1em] text-muted">
              {a.name.trim() || 'Person 1'} · {b.name.trim() || 'Person 2'}
            </p>

            <div
              className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
              role="radiogroup"
              aria-label="Match type"
            >
              {MATCH_TYPES.map((option) => {
                const active = matchType === option.id
                const Icon = option.icon
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setMatchType(option.id)}
                    className={cn(
                      'flex flex-col items-start gap-2 rounded-card border px-3.5 py-3.5 text-left',
                      'transition-[border-color,background-color,transform] duration-150 ease-out-soft',
                      'active:scale-[0.99]',
                      active
                        ? 'border-copper/55 bg-copper/12 shadow-[0_0_24px_-12px_rgba(220,132,79,0.45)]'
                        : 'border-border bg-surface hover:border-border-strong hover:bg-navy-soft/70',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'inline-flex size-9 items-center justify-center rounded-control border',
                        active
                          ? 'border-copper/40 bg-copper/20 text-gold-deep'
                          : 'border-border bg-surface-sunken text-muted',
                      )}
                    >
                      <Icon className="size-4" strokeWidth={active ? 2.25 : 1.75} />
                    </span>
                    <span className="text-sub font-semibold text-ink">{option.label}</span>
                    <span className="text-xs text-muted text-pretty">{option.hint}</span>
                  </button>
                )
              })}
            </div>

            {error && (
              <ErrorState variant="inline" error={error} onRetry={() => void runMatch()} />
            )}

            {isChecking ? (
              <LoadingState variant="calculating" label="Matching the two charts…" />
            ) : (
              <div className="flex flex-col items-center gap-3 pt-2">
                <Button
                  onClick={() => void runMatch()}
                  disabled={!matchType}
                  iconLeft={<HeartHandshake className="size-4" />}
                  className="w-full max-w-sm rounded-full px-10 sm:w-auto"
                >
                  {matchType
                    ? `Run ${matchTypeLabel(matchType).toLowerCase()} match`
                    : 'Select a match type'}
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 'result' && result && (
          <MatchReport
            result={result}
            matchType={matchType}
            onReset={resetAll}
            onChangeType={() => {
              setResult(null)
              setError(null)
              setStep('type')
            }}
            onDownloadBasic={downloadBasicReport}
            onGetDetailPdf={openDetailPdfOffer}
            onOpenManglik={() => navigate(paths.matchingManglik)}
          />
        )}
      </PageContainer>

      <MatchDetailPdfFlow
        phase={detailPdfPhase}
        onClose={() => setDetailPdfPhase(null)}
        onProceedToPay={() => setDetailPdfPhase('pay')}
        onPaymentSuccess={completeDetailPayment}
      />
    </>
  )
}

function DetailedPdfScreen({
  result,
  matchType,
  onDownload,
  onHome,
}: {
  result: MatchResult
  matchType: MatchRelationType | null
  onDownload: () => void
  onHome: () => void
}) {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <PageContainer width="wide" className="flex min-h-0 flex-1 flex-col pb-0 lg:pb-0">
        <SectionHeader
          as="h1"
          size="lg"
          title="Detailed match PDF"
          description="Payment complete. Flip through your report like a book, then download or return home."
        />
        <div className="mt-5 min-h-0 flex-1 pb-4">
          <MatchReportBook result={result} matchType={matchType} />
        </div>
      </PageContainer>

      <div
        className={cn(
          'sticky bottom-0 z-20 border-t border-border/80',
          'bg-canvas/90 backdrop-blur-md pb-safe',
        )}
      >
        <PageContainer width="wide" flush className="flex flex-col gap-2.5 py-4 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onDownload}
            iconLeft={<Download className="size-4" strokeWidth={2} />}
            className="w-full rounded-full sm:w-auto"
          >
            Download the detailed PDF
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onHome}
            iconLeft={<Home className="size-4" strokeWidth={2} />}
            className="w-full rounded-full sm:w-auto"
          >
            Go to home page
          </Button>
        </PageContainer>
      </div>
    </div>
  )
}

function MatchReport({
  result,
  matchType,
  onReset,
  onChangeType,
  onDownloadBasic,
  onGetDetailPdf,
  onOpenManglik,
}: {
  result: MatchResult
  matchType: MatchRelationType | null
  onReset: () => void
  onChangeType: () => void
  onDownloadBasic: () => void
  onGetDetailPdf: () => void
  onOpenManglik: () => void
}) {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem-2.5rem)] flex-col">
      <div className="mt-6 flex-1 space-y-8 animate-rise sm:mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-label uppercase tracking-[0.16em] text-gold-deep">
            {matchType ? `${matchTypeLabel(matchType)} match` : 'Guna Milan'}
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onDownloadBasic}
            iconLeft={<Download className="size-3.5" strokeWidth={2} />}
            className="rounded-full"
          >
            Download basic PDF
            <span className="ml-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
              Free
            </span>
          </Button>
        </div>

        {/* Hero result - dial, both people, then the reading */}
        <Card
          padding="lg"
          className="gap-6 border-border/80 bg-surface/90 shadow-card sm:gap-7 sm:p-7"
        >
          <div className="flex justify-center sm:justify-start">
            <ScoreDial
              value={result.total}
              max={result.max}
              caption="gunas matched"
              size={168}
            />
          </div>

          <div className="grid gap-3 border-t border-border/70 pt-5 sm:grid-cols-2 sm:gap-4">
            <Person profile={result.a} slot="Person 1" />
            <Person profile={result.b} slot="Person 2" />
          </div>

          <div className="space-y-2.5 border-t border-border/70 pt-5">
            <p className="text-body text-ink text-pretty">{result.summary}</p>
            <p className="text-sm leading-relaxed text-muted text-pretty">{result.caveat}</p>
          </div>
        </Card>

        <section aria-labelledby="kootas-title" className="space-y-4">
          <SectionHeader
            as="h2"
            size="md"
            title={<span id="kootas-title">The eight kootas</span>}
            description="Bar width is what each koota is worth, so Nadi&rsquo;s eight points read as eight times Varna&rsquo;s one."
          />
          <Card padding="lg" className="border-border/80 bg-surface/90">
            <GunaMilanChart kootas={result.kootas} />
          </Card>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <Dimension
            title="Where it holds"
            tone="positive"
            items={result.strengths.map((k) => `${k.name} - ${k.detail}`)}
            empty="No koota scores full marks."
          />
          <Dimension
            title="Where it rubs"
            tone="caution"
            items={result.frictions.map((k) => `${k.name} - ${k.concern ?? k.detail}`)}
            empty="No koota falls badly short."
          />
        </div>

        <Card
          padding="lg"
          className={cn(
            'gap-5 overflow-hidden border-border/80',
            result.manglik.a || result.manglik.b
              ? 'border-copper/35 bg-copper/10'
              : 'bg-surface/90',
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="font-mono text-label uppercase tracking-[0.14em] text-gold-deep">
                Manglik dosha
              </p>
              <h3 className="text-heading text-ink">Kuja dosha for this match</h3>
            </div>
            <Badge
              tone={result.manglik.a || result.manglik.b ? 'caution' : 'positive'}
            >
              {result.manglik.a && result.manglik.b
                ? 'Both charts'
                : result.manglik.a || result.manglik.b
                  ? 'One chart'
                  : 'Clear'}
            </Badge>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <ManglikPersonChip
              name={result.a.name}
              slot="Person 1"
              isManglik={result.manglik.a}
            />
            <ManglikPersonChip
              name={result.b.name}
              slot="Person 2"
              isManglik={result.manglik.b}
            />
          </div>

          <p className="text-sub text-purple text-pretty">{result.manglik.note}</p>

          <div className="flex flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted text-pretty">
              Check any birth chart against the classical Mars houses (1, 2, 4, 7, 8, 12).
            </p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onOpenManglik}
              iconLeft={<Calculator className="size-3.5" strokeWidth={2} />}
              className="shrink-0 rounded-full"
            >
              Manglik dosha calculator
            </Button>
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6 pb-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={onReset}
            iconLeft={<RotateCw className="size-4" />}
          >
            Match two other charts
          </Button>
          <Button variant="ghost" size="sm" onClick={onChangeType}>
            Change match type
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'sticky bottom-0 z-20 -mx-5 mt-auto border-t border-border/80',
          'bg-canvas/90 backdrop-blur-md md:-mx-6 lg:-mx-8',
          '-mb-6 lg:-mb-10 pb-safe',
        )}
      >
        <div className="flex flex-col items-stretch gap-2 px-5 py-4 md:px-6 lg:px-8 sm:items-start">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onGetDetailPdf}
            iconLeft={<Download className="size-4" strokeWidth={2} />}
            className="w-full rounded-full sm:w-auto"
          >
            Get detail PDF
          </Button>
          <p className="text-xs text-muted text-pretty">
            Free accounts can download the basic score PDF above. The detailed breakdown is a
            one-time ₹99 unlock — even with Plus.
          </p>
        </div>
      </div>
    </div>
  )
}

function Person({
  profile,
  slot,
}: {
  profile: MatchResult['a']
  slot: string
}) {
  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div
      className={cn(
        'rounded-card border border-copper/40 bg-copper/10 p-3.5 sm:p-4',
        'shadow-[0_0_28px_-14px_rgba(220,132,79,0.45)]',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            'inline-flex size-11 shrink-0 items-center justify-center rounded-full',
            'border border-copper/45 bg-copper/20 font-mono text-sm font-semibold text-gold-deep',
          )}
        >
          {initials || '·'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold-deep">{slot}</p>
          <p className="mt-0.5 truncate text-sub font-semibold text-ink">{profile.name}</p>
          <p className="mt-1.5 font-mono text-label uppercase tracking-[0.06em] text-muted">
            {formatDateShort(profile.details.date)} · {formatTime12(profile.details.time)}
          </p>
          <p className="mt-1 font-mono text-label uppercase tracking-[0.08em] text-copper">
            {profile.moonRashi} · {profile.moonNakshatra}
          </p>
        </div>
      </div>
    </div>
  )
}

function ManglikPersonChip({
  name,
  slot,
  isManglik,
}: {
  name: string
  slot: string
  isManglik: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-card border px-3.5 py-3',
        isManglik
          ? 'border-copper/40 bg-copper/15'
          : 'border-border/70 bg-surface-sunken/60',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{slot}</p>
        <Badge tone={isManglik ? 'caution' : 'positive'} mono>
          {isManglik ? 'Manglik' : 'Clear'}
        </Badge>
      </div>
      <p className="mt-1.5 truncate text-sub font-medium text-ink">{name}</p>
    </div>
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
