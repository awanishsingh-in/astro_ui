import {
  ChevronRight,
  Download,
  FileText,
  HeartHandshake,
  Home,
  Plus,
  Sparkles,
} from 'lucide-react'
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
  MatchCheckPayFlow,
  type MatchCheckPayPhase,
} from '@/components/matching/MatchCheckPayFlow'
import {
  MatchDetailPdfFlow,
  type DetailPdfPhase,
} from '@/components/matching/MatchDetailPdfFlow'
import { MatchReportBook } from '@/components/matching/MatchReportBook'
import { MatchThemeShell } from '@/components/matching/MatchThemeShell'
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
import {
  canStartMatchCheck,
  formatMatchCheckInr,
  formatUnlimitedExpiry,
  grantUnlimitedMatchAccess,
  hasUnlimitedMatchAccess,
  hasUsedFreeMatch,
  markFreeMatchUsed,
  MATCH_UNLIMITED_DAYS,
} from '@/onboarding/match-check-unlock'
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
import { consumeMatchResume, saveMatchResume } from '@/utils/match-resume'

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
  const [matchPayPhase, setMatchPayPhase] = useState<MatchCheckPayPhase>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [accessTick, setAccessTick] = useState(0)
  const freeMatchUsed = Boolean(user && hasUsedFreeMatch(user.id))
  const unlimitedActive = Boolean(user && hasUnlimitedMatchAccess(user.id))
  const needsMatchPay = freeMatchUsed && !unlimitedActive
  const unlimitedExpiry =
    user && unlimitedActive ? formatUnlimitedExpiry(user.id) : null
  // Re-read access flags after pay / first free match.
  void accessTick

  // Restore result after Manglik calculator, then draft / pick. Forms stay blank otherwise.
  useEffect(() => {
    const resume = consumeMatchResume()
    if (resume) {
      setA(resume.a)
      setB(resume.b)
      setMatchType(resume.matchType)
      setResult(resume.result)
      setStep('result')
      return
    }

    const draft = readMatchDraft()
    // Drafts owned by the Manglik calculator should not fill Matching.
    if (draft?.returnTo === paths.matchingManglik) return

    if (draft) {
      setA(draft.a)
      setB(draft.b)
      clearMatchDraft()
    }

    const pick = consumeMatchPick()
    if (pick) {
      const profile = profiles.find((p) => p.id === pick.profileId)
      if (profile) {
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
      }
    }
  }, [profiles, toast])

  const openSavedProfiles = useCallback(
    (slot: MatchPersonSlot) => {
      saveMatchDraft({ a, b, focus: slot })
      navigate(`${paths.matchingProfiles}?for=${slot}`)
    },
    [a, b, navigate],
  )

  const proceedToMatchType = useCallback(() => {
    setError(null)
    setMatchType(null)
    setStep('type')
  }, [])

  const goToMatchType = useCallback(() => {
    if (!user) return
    const foundA = validatePerson(a)
    const foundB = validatePerson(b)
    setErrorsA(foundA)
    setErrorsB(foundB)
    if (Object.keys(foundA).length || Object.keys(foundB).length) return

    if (!canStartMatchCheck(user.id)) {
      setMatchPayPhase('offer')
      return
    }

    proceedToMatchType()
  }, [a, b, user, proceedToMatchType])

  const runMatch = useCallback(async () => {
    if (!matchType || !user) return

    setIsChecking(true)
    setError(null)
    try {
      setResult(
        await getMatch(
          { name: a.name.trim(), details: toBirthDetails(a), profileId: a.profileId },
          { name: b.name.trim(), details: toBirthDetails(b), profileId: b.profileId },
        ),
      )
      if (!hasUsedFreeMatch(user.id)) {
        markFreeMatchUsed(user.id)
        setAccessTick((n) => n + 1)
      }
      setStep('result')
    } catch (caught) {
      setError(toAppError(caught))
    } finally {
      setIsChecking(false)
    }
  }, [a, b, matchType, user])

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
      <MatchThemeShell>
        <DetailedPdfScreen
          result={result}
          matchType={matchType}
          onDownload={() => {
            const filename = downloadMatchReportPdf(result, matchType, 'detailed')
            toast.success('Detailed report downloaded', { description: filename })
          }}
          onHome={() => navigate(paths.ask)}
        />
      </MatchThemeShell>
    )
  }

  return (
    <MatchThemeShell className={step === 'details' ? 'h-full overflow-hidden' : undefined}>
      <PageContainer
        width="wide"
        flush={step === 'details'}
        className={cn(
          step === 'details' &&
            'flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden px-5 py-3 md:px-6 lg:px-8 lg:py-4',
        )}
      >
        {step === 'details' && (
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
            <header className="relative shrink-0">
              <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Kundli Matching
              </h1>
              <p className="match-subtitle mt-1 text-xs text-muted text-pretty sm:text-sm">
                Pick saved kundlis or enter birth details for two people.
              </p>
            </header>

            <div className="grid min-h-0 flex-1 gap-3 overflow-hidden lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-stretch lg:gap-2">
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
                className="min-h-0 max-h-full overflow-y-auto"
              />

              <div
                aria-hidden
                className="match-plus-wrap relative flex shrink-0 items-center justify-center py-0.5 lg:sticky lg:top-1/3 lg:px-0.5"
              >
                <span className="match-plus-blur pointer-events-none absolute size-12 rounded-full bg-primary/35 blur-xl animate-[pulse-soft_2.8s_ease-in-out_infinite]" />
                <span
                  className={cn(
                    'match-plus relative z-[1] inline-flex size-11 items-center justify-center rounded-full',
                    'border border-white/25 bg-gradient-to-br from-primary via-secondary to-primary-pressed',
                    'text-white shadow-[0_12px_32px_-10px_rgba(201,145,115,0.55)]',
                  )}
                >
                  <Plus className="size-5 drop-shadow-sm" strokeWidth={2.75} />
                </span>
              </div>

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
                className="min-h-0 max-h-full overflow-y-auto"
              />
            </div>

            <div className="flex shrink-0 flex-col items-center gap-1">
              <Button
                onClick={goToMatchType}
                size="md"
                iconLeft={<HeartHandshake className="size-4" />}
                className="w-full max-w-sm rounded-full px-8 sm:w-auto"
              >
                {needsMatchPay
                  ? `Unlock unlimited · ${formatMatchCheckInr()}`
                  : 'Check match'}
              </Button>
              <p className="match-footer-note text-center text-[11px] text-muted text-pretty">
                {unlimitedExpiry
                  ? `Unlimited matching until ${unlimitedExpiry}`
                  : needsMatchPay
                    ? `${formatMatchCheckInr()} once · unlimited matches for ${MATCH_UNLIMITED_DAYS} days`
                    : `First match free · then ${formatMatchCheckInr()} for ${MATCH_UNLIMITED_DAYS} days unlimited`}
              </p>
            </div>
          </div>
        )}

        {step === 'type' && (
          <div className="mt-2 space-y-6 animate-rise sm:mt-4">
            <div>
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                Match <span className="text-silver-300">type</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted text-pretty">
                How is {b.name.trim() || 'Person 2'} related to {a.name.trim() || 'Person 1'}? This
                changes how we read the result.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-[1.25rem] border border-border/80 bg-surface px-4 py-3.5">
              <span className="text-sm font-semibold text-ink">{a.name.trim() || 'Person 1'}</span>
              <HeartHandshake className="size-4 text-silver-300" aria-hidden />
              <span className="text-sm font-semibold text-ink">{b.name.trim() || 'Person 2'}</span>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="ml-auto text-xs font-semibold text-muted hover:text-silver-300"
              >
                Edit people
              </button>
            </div>

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
                      'relative flex flex-col items-start gap-2 rounded-[1.15rem] border px-3.5 py-3.5 text-left',
                      'transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out-soft',
                      'active:scale-[0.99]',
                      active
                        ? 'border-copper/55 bg-copper/12 shadow-[0_0_28px_-12px_rgba(201,145,115,0.55)]'
                        : 'border-border bg-surface hover:border-border-strong hover:bg-surface-raised',
                    )}
                  >
                    {option.id === 'partner' && (
                      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-silver-300">
                        Most chosen
                      </span>
                    )}
                    <span
                      aria-hidden
                      className={cn(
                        'inline-flex size-9 items-center justify-center rounded-xl border',
                        active
                          ? 'border-copper/45 bg-copper/20 text-silver-300 shadow-[0_0_18px_-6px_rgba(201,145,115,0.55)]'
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
                  className="w-full max-w-md rounded-full px-10 sm:w-auto"
                >
                  {matchType
                    ? `Run ${matchTypeLabel(matchType).toLowerCase()} match`
                    : 'Select a match type'}
                </Button>
                <p className="text-center text-xs text-muted">
                  You can change the type later from the result.
                </p>
              </div>
            )}
          </div>
        )}

        {step === 'result' && result && (
          <MatchReport
            result={result}
            matchType={matchType}
            onChangeType={() => {
              setResult(null)
              setError(null)
              setStep('type')
            }}
            onDownloadBasic={downloadBasicReport}
            onGetDetailPdf={openDetailPdfOffer}
            onOpenManglik={() => {
              if (!result) return
              saveMatchResume({ a, b, matchType, result })
              navigate(paths.calculator('manglik'), { state: { from: paths.matching } })
            }}
          />
        )}
      </PageContainer>

      <MatchDetailPdfFlow
        phase={detailPdfPhase}
        onClose={() => setDetailPdfPhase(null)}
        onProceedToPay={() => setDetailPdfPhase('pay')}
        onPaymentSuccess={completeDetailPayment}
      />

      <MatchCheckPayFlow
        phase={matchPayPhase}
        onClose={() => setMatchPayPhase(null)}
        onProceedToPay={() => setMatchPayPhase('pay')}
        onPaymentSuccess={() => {
          if (!user) return
          grantUnlimitedMatchAccess(user.id)
          setAccessTick((n) => n + 1)
          setMatchPayPhase(null)
          toast.success('Unlimited matching unlocked', {
            description: `${MATCH_UNLIMITED_DAYS} days · match any profiles as often as you like.`,
          })
          proceedToMatchType()
        }}
      />
    </MatchThemeShell>
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
  onChangeType,
  onDownloadBasic,
  onGetDetailPdf,
  onOpenManglik,
}: {
  result: MatchResult
  matchType: MatchRelationType | null
  onChangeType: () => void
  onDownloadBasic: () => void
  onGetDetailPdf: () => void
  onOpenManglik: () => void
}) {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem-2.5rem)] flex-col">
      <div className="mt-6 flex-1 space-y-8 animate-rise sm:mt-8">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onDownloadBasic}
            className={cn(
              'group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full',
              'border border-primary/45 bg-primary/15 px-3.5 py-2',
              'shadow-[0_0_0_1px_rgba(201,145,115,0.45),0_10_28_14_rgba(15,11,25,0.55)]',
              'transition duration-200',
              'hover:-translate-y-0.5 hover:border-[var(--color-primary-hover)] hover:bg-primary/25',
              'hover:shadow-[0_0_0_1px_rgba(201,145,115,0.45),0_14_32_12_rgba(15,11,25,0.55)]',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              'active:translate-y-0 active:scale-[0.985]',
            )}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/25 via-transparent to-secondary/20 opacity-80 transition group-hover:opacity-100"
            />
            <span
              aria-hidden
              className={cn(
                'relative inline-flex size-7 shrink-0 items-center justify-center rounded-full',
                'btn-primary',
                'shadow-[0_6px_16px_-6px_rgba(201,145,115,0.55)]',
              )}
            >
              <Download className="size-3.5" strokeWidth={2.25} />
            </span>
            <span className="relative text-sm font-semibold text-white">Download basic PDF</span>
            <span
              className={cn(
                'relative rounded-full border border-[#E6BC9F]/35 bg-[#1B101D]/80',
                'px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#E6BC9F]',
                'shadow-[0_0_16px_-6px_rgba(201,145,115,0.55)]',
              )}
            >
              Free
            </span>
          </button>
        </div>

        {/* Hero result - dial, both people, then the reading */}
        <Card
          padding="lg"
          className="gap-6 border-border/80 bg-surface/90 shadow-card sm:gap-7 sm:p-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-label uppercase tracking-[0.16em] text-silver-400">
              {matchType ? `${matchTypeLabel(matchType)} match` : 'Guna Milan'}
            </p>
            <button
              type="button"
              onClick={onChangeType}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border border-border-strong/70',
                'bg-surface-raised/70 px-3 py-1.5 text-xs font-semibold text-ink',
                'transition hover:border-primary/50 hover:bg-primary/10 hover:text-silver-300',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              )}
            >
              Change match type
              <ChevronRight className="size-3.5 opacity-70" aria-hidden />
            </button>
          </div>

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

        <button
          type="button"
          onClick={onOpenManglik}
          aria-label="Open Manglik dosha calculator"
          className={cn(
            'group relative w-full overflow-hidden rounded-[1.65rem] border border-primary/50 px-5 py-6 text-center sm:px-8 sm:py-7',
            'bg-[linear-gradient(155deg,#1a2b4a_0%,var(--color-surface)_48%,#0f1a2e_100%)]',
            'shadow-[0_0_0_1px_rgba(201,145,115,0.45),0_24_56_20_rgba(15,11,25,0.55)]',
            'transition duration-200',
            'hover:-translate-y-0.5 hover:border-[var(--color-primary-hover)] hover:shadow-[0_0_0_1px_rgba(201,145,115,0.45),0_28_64_18_rgba(15,11,25,0.55)]',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
            'active:translate-y-0',
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl transition group-hover:bg-primary/18"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-secondary/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px,  1px, transparent 0)',
              backgroundSize: '16px 16px',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent"
          />

          <div className="relative mx-auto flex max-w-xl flex-col items-center gap-4">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-accent/35 bg-primary/20 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)] shadow-[0_0_20px_-6px_rgba(201,145,115,0.55)]">
              <Sparkles className="size-3.5" aria-hidden />
              Free · Manglik check
            </p>

            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-semibold tracking-tight text-white text-pretty sm:text-3xl">
                Is Manglik / Kuja dosha shaping this match?
              </h3>
              <p className="text-sm leading-relaxed text-white/70 text-pretty sm:text-base">
                {result.manglik.a && result.manglik.b
                  ? `${result.a.name.split(' ')[0]} & ${result.b.name.split(' ')[0]} both show Manglik — see the full Mars-house reading.`
                  : result.manglik.a || result.manglik.b
                    ? `One chart shows Manglik — open the calculator for the classical Kuja check.`
                    : `This match looks clear — still explore the Manglik calculator for any chart.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-semibold',
                  result.manglik.a
                    ? 'border-[#6E4234]/45 bg-[#6E4234]/15 text-[#F2D7C7]'
                    : 'border-white/20 bg-white/5 text-white/75',
                )}
              >
                {result.a.name.split(' ')[0]} · {result.manglik.a ? 'Manglik' : 'Clear'}
              </span>
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-semibold',
                  result.manglik.b
                    ? 'border-[#6E4234]/45 bg-[#6E4234]/15 text-[#F2D7C7]'
                    : 'border-white/20 bg-white/5 text-white/75',
                )}
              >
                {result.b.name.split(' ')[0]} · {result.manglik.b ? 'Manglik' : 'Clear'}
              </span>
            </div>

            <span
              className={cn(
                'mt-1 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-full',
                'btn-primary px-6 py-3',
                'text-sm font-semibold text-white',
                'shadow-[0_14px_36px_-12px_rgba(201,145,115,0.55)]',
                'transition',
              )}
            >
              Check Manglik now
              <ChevronRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
            <p className="text-[11px] text-white/45">Tap the card · free single-chart calculator</p>
          </div>
        </button>
      </div>

      <div
        className={cn(
          'sticky bottom-0 z-20 -mx-5 mt-auto md:-mx-6 lg:-mx-8',
          'bg-gradient-to-t from-canvas via-canvas/95 to-transparent',
          '-mb-6 lg:-mb-10 pb-safe pt-3',
        )}
      >
        <div className="px-5 pb-4 md:px-6 lg:px-8">
          <button
            type="button"
            onClick={onGetDetailPdf}
            aria-label="Get detailed match PDF for ₹99"
            className={cn(
              'group relative w-full overflow-hidden rounded-[1.5rem] border border-primary/45 px-5 py-5 text-left sm:px-6 sm:py-5',
              'bg-[linear-gradient(155deg,#1a2b4a_0%,var(--color-surface)_50%,#0f1a2e_100%)]',
              'shadow-[0_0_0_1px_rgba(201,145,115,0.45),0_20_48_18_rgba(15,11,25,0.55)]',
              'transition duration-200',
              'hover:-translate-y-0.5 hover:border-[var(--color-primary-hover)] hover:shadow-[0_0_0_1px_rgba(201,145,115,0.45),0_26_56_16_rgba(15,11,25,0.55)]',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              'active:translate-y-0',
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full bg-primary/10 blur-3xl transition group-hover:bg-primary/18"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-secondary/30 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-accent/65 to-transparent"
            />

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="min-w-0 flex-1 space-y-2.5">
                <p className="inline-flex items-center gap-1.5 rounded-full border border-accent/35 bg-primary/20 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
                  <Sparkles className="size-3" aria-hidden />
                  One-time · ₹99
                </p>
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className={cn(
                      'mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-2xl',
                      'border border-accent/35 bg-primary/20 text-[var(--color-accent)]',
                      'shadow-[0_0_24px_-8px_rgba(201,145,115,0.55)]',
                    )}
                  >
                    <FileText className="size-5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <h3 className="font-serif text-lg font-semibold tracking-tight text-white text-pretty sm:text-xl">
                      Unlock the full koota breakdown
                    </h3>
                    <p className="text-xs leading-relaxed text-white/65 text-pretty sm:text-sm">
                      Strengths, frictions &amp; notes for this match — a detailed PDF, separate from
                      Plus.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-stretch gap-1.5 sm:items-end">
                <span
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-full',
                    'btn-primary px-5 py-2.5',
                    'text-sm font-semibold text-white',
                    'shadow-[0_12px_28px_-10px_rgba(201,145,115,0.55)]',
                    'transition',
                  )}
                >
                  <Download className="size-4" strokeWidth={2.25} aria-hidden />
                  Get detail PDF
                  <ChevronRight
                    className="size-4 transition group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
                <p className="text-center text-[10px] text-white/40 sm:text-right">
                  Basic score PDF stays free above
                </p>
              </div>
            </div>
          </button>
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
        'shadow-[0_0_28px_-14px_rgba(201,145,115,0.55)]',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            'inline-flex size-11 shrink-0 items-center justify-center rounded-full',
            'border border-copper/45 bg-copper/20 font-mono text-sm font-semibold text-silver-400',
          )}
        >
          {initials || '·'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-silver-400">{slot}</p>
          <p className="mt-0.5 truncate text-sub font-semibold text-ink">{profile.name}</p>
          <p className="mt-1.5 font-mono text-label uppercase tracking-[0.06em] text-muted">
            {formatDateShort(profile.details.date)} · {formatTime12(profile.details.time)}
          </p>
          <p className="mt-1 font-mono text-label uppercase tracking-[0.08em] text-silver-300">
            {profile.moonRashi} · {profile.moonNakshatra}
          </p>
        </div>
      </div>
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
