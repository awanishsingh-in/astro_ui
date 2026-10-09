import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Clover,
  Focus,
  Heart,
  HeartPulse,
  Home,
  MessageCircle,
  Plus,
  RefreshCw,
  Sparkles,
  Sprout,
  Wallet,
} from 'lucide-react'
import { useAuth } from '@/auth/auth-context'
import { Button } from '@/components/common/Button'
import { ErrorState } from '@/components/common/ErrorState'
import { RubberSegment } from '@/components/common/RubberSegment'
import { Modal } from '@/components/modals/Modal'
import { buildChart } from '@/data/chart-mock'
import {
  chartSeedFor,
  RELATION_LABEL,
  type ChartProfile,
} from '@/data/profiles'
import {
  buildHoroscopeDateChips,
  buildSignHoroscopeSummary,
  verticalToKind,
  type HoroscopePeriod,
  type HoroscopeVerticalId,
  type SignHoroscopeVertical,
} from '@/data/horoscope-hub'
import type { HoroscopeKind } from '@/data/horoscope-mock'
import { useAsync } from '@/hooks/useAsync'
import { useDisclosure } from '@/hooks/useDisclosure'
import { PageContainer } from '@/layouts/PageContainer'
import {
  getYearlyHoroscopeUnlockedProfileIds,
  hasYearlyHoroscopeUnlocked,
} from '@/onboarding/past-intro'
import {
  HoroscopeBody,
  HoroscopeSkeleton,
} from '@/pages/horoscope/HoroscopePage'
import { YearlyHoroscopeCheckout } from '@/pages/horoscope/YearlyHoroscopeCheckout'
import { useProfiles } from '@/profiles/profiles-context'
import { paths } from '@/routes/paths'
import { getHoroscope } from '@/services/astrology.service'
import dhanuIcon from '@/assets/zodiac/dhanu.jpg'
import kanyaIcon from '@/assets/zodiac/kanya.jpg'
import karkaIcon from '@/assets/zodiac/karka.jpg'
import kumbhaIcon from '@/assets/zodiac/kumbha.jpg'
import makaraIcon from '@/assets/zodiac/makara.jpg'
import meenaIcon from '@/assets/zodiac/meena.jpg'
import meshaIcon from '@/assets/zodiac/mesha.jpg'
import mithunaIcon from '@/assets/zodiac/mithuna.jpg'
import simhaIcon from '@/assets/zodiac/simha.jpg'
import tulaIcon from '@/assets/zodiac/tula.jpg'
import vrishabhaIcon from '@/assets/zodiac/vrishabha.jpg'
import vrischikaIcon from '@/assets/zodiac/vrischika.jpg'
import type { RashiName } from '@/types/astrology'
import { RASHIS } from '@/utils/astro'
import { cn } from '@/utils/cn'

/** Illustrated art for each moon sign / rashi card. */
const RASHI_ART: Record<RashiName, string> = {
  Mesha: meshaIcon,
  Vrishabha: vrishabhaIcon,
  Mithuna: mithunaIcon,
  Karka: karkaIcon,
  Simha: simhaIcon,
  Kanya: kanyaIcon,
  Tula: tulaIcon,
  Vrischika: vrischikaIcon,
  Dhanu: dhanuIcon,
  Makara: makaraIcon,
  Kumbha: kumbhaIcon,
  Meena: meenaIcon,
}

/**
 * Immersive horoscope hub — full-bleed width, no side rail.
 * Signs in one horizontal strip · span · dates · summary · personalise.
 */
/** Moon rashi for a saved profile — used by the personalised hub card. */
function moonRashiFor(profile: ChartProfile): RashiName {
  const chart = buildChart(chartSeedFor(profile), 'D1')
  const moon = chart.grahas.find((g) => g.graha === 'Mo')
  return (moon?.rashi ?? chart.lagna.rashi) as RashiName
}

export default function HoroscopeFlow() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profiles, selected, select } = useProfiles()
  const changeProfile = useDisclosure()
  const [checkout, setCheckout] = useState(false)
  const [yearlyUnlocked, setYearlyUnlocked] = useState(() =>
    user ? hasYearlyHoroscopeUnlocked(user.id) : false,
  )
  const [unlockedProfileIds, setUnlockedProfileIds] = useState<string[]>(() =>
    user ? getYearlyHoroscopeUnlockedProfileIds(user.id) : [],
  )
  const [period, setPeriod] = useState<HoroscopePeriod>('daily')
  /** Sign locked to the paid personalised hub — not changed by general browsing. */
  const [personalRashi, setPersonalRashi] = useState<RashiName>(() =>
    moonRashiFor(selected),
  )
  /** Free / generalised strip selection. */
  const [generalRashi, setGeneralRashi] = useState<RashiName>(() =>
    moonRashiFor(selected),
  )
  /** After unlock: show the free all-signs hub instead of the selected card only. */
  const [showGeneral, setShowGeneral] = useState(false)
  const chips = buildHoroscopeDateChips(period)
  const todayIso = chips.find((c) => {
    const now = new Date()
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    return c.iso === iso
  })?.id
  const [selectedChipId, setSelectedChipId] = useState(
    () => todayIso ?? chips[3]?.id ?? chips[0]?.id ?? '',
  )

  const seed = chartSeedFor(selected)
  /** Free hub + generalised browse share `generalRashi`; personalised hub keeps `personalRashi`. */
  const rashi = !yearlyUnlocked || showGeneral ? generalRashi : personalRashi
  const unlockedProfiles = profiles.filter((p) => unlockedProfileIds.includes(p.id))
  const effectiveUnlocked =
    unlockedProfiles.length > 0
      ? unlockedProfiles
      : yearlyUnlocked
        ? [selected]
        : []
  const canChangeProfile = effectiveUnlocked.length >= 2

  useEffect(() => {
    if (!user) {
      setYearlyUnlocked(false)
      setUnlockedProfileIds([])
      return
    }
    setYearlyUnlocked(hasYearlyHoroscopeUnlocked(user.id))
    setUnlockedProfileIds(getYearlyHoroscopeUnlockedProfileIds(user.id))
  }, [user])

  useEffect(() => {
    if (showGeneral || !yearlyUnlocked) return
    setPersonalRashi(moonRashiFor(selected))
  }, [selected.id, showGeneral, yearlyUnlocked])

  useEffect(() => {
    const next = buildHoroscopeDateChips(period)
    const now = new Date()
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const match = next.find((c) => c.iso === iso) ?? next[Math.min(3, next.length - 1)]
    if (match) setSelectedChipId(match.id)
  }, [period])

  const selectedChip = chips.find((c) => c.id === selectedChipId) ?? chips[0]
  const summary = selectedChip
    ? buildSignHoroscopeSummary(rashi, 'general', period, selectedChip.iso)
    : null

  function openPersonal() {
    if (yearlyUnlocked) {
      navigate(paths.horoscope('yearly-personal'))
      return
    }
    setCheckout(true)
  }

  function askAboutSummary() {
    if (!summary) return
    const q = `${summary.headline}: ${summary.summary} What should I watch and lean into?`
    navigate(`${paths.ask}?q=${encodeURIComponent(q)}&from=horoscope`)
  }

  function openGeneral() {
    setGeneralRashi(personalRashi)
    setShowGeneral(true)
  }

  function backToPersonal() {
    setShowGeneral(false)
  }

  function onYearlyUnlocked(profileIds: string[]) {
    setYearlyUnlocked(true)
    const merged = [
      ...new Set([
        ...unlockedProfileIds,
        ...profileIds,
        ...getYearlyHoroscopeUnlockedProfileIds(user?.id ?? ''),
      ]),
    ]
    setUnlockedProfileIds(merged)
    const first =
      profiles.find((p) => profileIds.includes(p.id)) ??
      profiles.find((p) => p.id === selected.id) ??
      selected
    select(first.id)
    setPersonalRashi(moonRashiFor(first))
    setShowGeneral(false)
    setCheckout(false)
  }

  function chooseUnlockedProfile(profile: ChartProfile) {
    select(profile.id)
    setPersonalRashi(moonRashiFor(profile))
    changeProfile.close()
  }

  if (checkout) {
    return (
      <YearlyHoroscopeCheckout
        profiles={profiles}
        onClose={() => setCheckout(false)}
        onUnlocked={onYearlyUnlocked}
      />
    )
  }

  const rashiMeta = RASHIS.find((r) => r.name === rashi)
  const showRashiStrip = !yearlyUnlocked || showGeneral

  return (
    <PageContainer
      width="wide"
      className={cn(
        'pt-4 sm:pt-6 px-6 sm:px-8 lg:px-12 xl:px-16',
        yearlyUnlocked ? 'pb-10' : 'pb-16',
      )}
    >
      <article className="animate-rise space-y-8 sm:space-y-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {yearlyUnlocked && !showGeneral
              ? 'Your personalised horoscope'
              : 'Select your zodiac sign'}
          </h1>
          {yearlyUnlocked && !showGeneral && (
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={openGeneral}
            >
              View generalized horoscope
            </Button>
          )}
          {yearlyUnlocked && showGeneral && (
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={backToPersonal}
            >
              Back to your personalised horoscope
            </Button>
          )}
        </header>

        {showRashiStrip ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Moon sign / rashi
              </p>
              <p className="text-sm text-muted">
                {rashiMeta?.english} · {rashi}
              </p>
            </div>
            <RashiStrip selected={generalRashi} onSelect={setGeneralRashi} />
          </section>
        ) : (
          <section className="w-full space-y-3">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Moon sign / rashi
            </p>
            <SelectedRashiCard
              rashi={personalRashi}
              period={period}
              dateLabel={summary?.dateLabel}
              mood={summary?.mood}
              headline={summary?.headline}
              profileName={selected.name}
              profileAction={canChangeProfile ? 'change' : 'add'}
              onProfileAction={
                canChangeProfile ? changeProfile.open : () => setCheckout(true)
              }
            />
          </section>
        )}

        <Modal
          isOpen={changeProfile.isOpen}
          onClose={changeProfile.close}
          title="Change profile"
          description="Pick a profile with personalised horoscope unlocked."
          size="sm"
        >
          <ul className="space-y-2">
            {effectiveUnlocked.map((profile) => {
              const moon = moonRashiFor(profile)
              const moonMeta = RASHIS.find((r) => r.name === moon)
              const active = profile.id === selected.id
              return (
                <li key={profile.id}>
                  <button
                    type="button"
                    onClick={() => chooseUnlockedProfile(profile)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition',
                      active
                        ? 'border-copper/60 bg-copper/10'
                        : 'border-border/80 hover:border-copper/40 hover:bg-surface-raised/60',
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink">{profile.name}</span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {RELATION_LABEL[profile.relation]}
                        {moonMeta ? ` · ${moonMeta.english}` : ''}
                      </span>
                    </span>
                    {active && (
                      <span className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-copper">
                        Current
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
            <li>
              <button
                type="button"
                onClick={() => {
                  changeProfile.close()
                  setCheckout(true)
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl border border-dashed border-copper/45',
                  'bg-copper/5 px-4 py-3 text-left transition',
                  'hover:border-copper/70 hover:bg-copper/10',
                )}
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-copper/35 bg-copper/15 text-copper">
                  <Plus className="size-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-ink">Add profile</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    Unlock personalised horoscope for another account
                  </span>
                </span>
              </button>
            </li>
          </ul>
        </Modal>

        {/* Daily / Weekly / Monthly */}
        <section className="mx-auto flex w-full max-w-3xl flex-col items-center space-y-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Span
          </p>
          <RubberSegment
            className="w-full border border-border/70"
            aria-label="Horoscope period"
            items={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
            ]}
            value={period}
            onChange={(next) => setPeriod(next as HoroscopePeriod)}
            size="lg"
            radius={22}
            inset={4}
            trackColor="var(--color-surface-sunken)"
            thumbColor="var(--color-copper)"
            textColor="var(--color-muted)"
            activeTextColor="var(--color-midnight)"
          />
        </section>

        {/* Dates — horizontal strip, drag to scroll */}
        <section className="mx-auto flex w-full flex-col items-center space-y-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            {period === 'daily' ? 'Pick a day' : period === 'weekly' ? 'Pick a week' : 'Pick a month'}
          </p>
          <div className="w-full py-3">
            <DateStrip
              chips={chips}
              selectedId={selectedChipId}
              period={period}
              onSelect={setSelectedChipId}
            />
          </div>
        </section>

        {summary && (
          <article
            className={cn(
              'relative overflow-hidden rounded-[1.75rem] border border-[#7c4dff]/40',
              'bg-[linear-gradient(155deg,#24105a_0%,#120e28_42%,#0d1a38_100%)]',
              'px-5 py-6 shadow-[0_0_0_1px_rgba(124,77,255,0.15),0_28px_64px_-28px_rgba(124,77,255,0.75)]',
              'sm:px-8 sm:py-8',
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-[#7c4dff]/35 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-28 -left-10 h-52 w-52 rounded-full bg-[#3a7bd5]/25 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#c4a0ff]/70 to-transparent"
            />

            <div className="relative flex flex-col gap-6 sm:gap-7">
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c4a0ff]/35 bg-[#7c4dff]/20 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e8d6ff]">
                      <Sparkles className="size-3" aria-hidden />
                      {period}
                    </span>
                    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/70">
                      {summary.english} · {summary.rashi}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="font-serif text-3xl font-semibold tracking-tight text-white text-pretty sm:text-4xl">
                      {summary.headline}
                    </h2>
                    <p className="text-sm text-white/55">{summary.dateLabel}</p>
                  </div>
                </div>
                <p
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border border-[#9dffc0]/30',
                    'bg-[#1a3d2a]/70 px-3.5 py-1.5 text-xs font-semibold text-[#9dffc0]',
                    'shadow-[0_0_20px_-8px_rgba(157,255,192,0.65)]',
                  )}
                >
                  Mood · {summary.mood}
                </p>
              </header>

              <div className="max-w-3xl space-y-4">
                <p className="text-base leading-relaxed text-white/80 text-pretty sm:text-lg">
                  {summary.summary}
                </p>
                <ul className="space-y-2.5">
                  {summary.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-[#c4a0ff]"
                      />
                      <span className="text-sm leading-relaxed text-white/70 text-pretty sm:text-[15px]">
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-center border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={askAboutSummary}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3',
                    'bg-gradient-to-r from-[#7c4dff] to-[#3a7bd5]',
                    'text-sm font-semibold text-white',
                    'shadow-[0_12px_28px_-16px_rgba(124,77,255,0.7)]',
                    'transition hover:from-[#8b5cff] hover:to-[#4a8be5]',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c4dff]',
                  )}
                >
                  <MessageCircle className="size-4" aria-hidden />
                  Ask about this
                </button>
              </div>
            </div>
          </article>
        )}

        {summary && (
          <section className="scroll-mt-24 space-y-6" aria-label="Today by area of life">
            <header className="space-y-1">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Today by area of life
              </p>
              <p className="max-w-xl text-sm text-muted text-pretty">
                Card on the left, reading on the right — next area starts below when you finish one.
              </p>
            </header>

            <div className="flex flex-col gap-12 sm:gap-14">
              {summary.verticals.map((vertical, index) => (
                <AreaBlock
                  key={vertical.id}
                  vertical={vertical}
                  period={period}
                  seed={seed}
                  birthDate={selected.birthDetails.date}
                  english={summary.english}
                  index={index}
                  total={summary.verticals.length}
                />
              ))}
            </div>
          </section>
        )}

        {/* Spacer so content clears the fixed CTA (free hub only). */}
        {!yearlyUnlocked && <div className="h-32" aria-hidden />}
      </article>

      {!yearlyUnlocked && (
        <div
          className={cn(
            'fixed inset-x-0 bottom-0 z-30 border-t border-border/80',
            'bg-canvas/95 backdrop-blur-md pb-safe',
          )}
        >
          <div className="mx-auto flex w-full max-w-lg flex-col items-center px-5 py-3.5 sm:px-6">
            <Button
              variant="primary"
              size="lg"
              className="w-full rounded-full"
              iconLeft={<Sparkles className="size-4" />}
              onClick={openPersonal}
            >
              Read personalised horoscope
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

/** Unlocked hub: smaller zodiac art on the left, detail + profile action on the right. */
function SelectedRashiCard({
  rashi,
  period,
  dateLabel,
  mood,
  headline,
  profileName,
  profileAction,
  onProfileAction,
}: {
  rashi: RashiName
  period: HoroscopePeriod
  dateLabel?: string
  mood?: string
  headline?: string
  profileName?: string
  profileAction: 'add' | 'change'
  onProfileAction: () => void
}) {
  const meta = RASHIS.find((r) => r.name === rashi)
  if (!meta) return null

  return (
    <div
      className={cn(
        'relative flex flex-wrap items-stretch gap-4 overflow-hidden rounded-[1.5rem] border border-[#7c4dff]/40 p-3.5',
        'bg-[linear-gradient(155deg,#24105a_0%,#120e28_45%,#0d1a38_100%)]',
        'shadow-[0_0_0_1px_rgba(124,77,255,0.14),0_24px_48px_-28px_rgba(124,77,255,0.7)]',
        'sm:flex-nowrap sm:gap-5 sm:p-4',
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[#7c4dff]/25 blur-3xl"
      />

      <div
        className={cn(
          'relative h-[7.5rem] w-[5.25rem] shrink-0 overflow-hidden rounded-[1rem] border border-copper/70',
          'shadow-[0_0_0_1px_rgba(124,77,255,0.35),0_0_20px_-10px_rgba(124,77,255,0.7)]',
          'sm:h-[8.25rem] sm:w-[5.75rem]',
        )}
      >
        <img
          src={RASHI_ART[rashi]}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full scale-110 object-cover opacity-85"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#14082e]/90 via-[#14082e]/35 to-[#7c4dff]/10"
        />
        <div className="relative z-[1] flex h-full flex-col items-center justify-end gap-0.5 px-2 pb-2.5 text-center">
          <span className="text-sm font-semibold text-copper drop-shadow-sm">{meta.name}</span>
          <span aria-hidden className="text-base leading-none text-copper/70">
            {meta.glyph}
          </span>
          <span className="text-[11px] text-copper/80">{meta.english}</span>
        </div>
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col justify-center gap-2.5 py-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#c4a0ff]/35 bg-[#7c4dff]/20 px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#e8d6ff]">
            {period}
          </span>
          {mood && (
            <span
              className={cn(
                'rounded-full border border-[#9dffc0]/30 bg-[#1a3d2a]/70',
                'px-2.5 py-0.5 text-[10px] font-semibold text-[#9dffc0]',
              )}
            >
              Mood · {mood}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <p className="font-serif text-xl font-semibold tracking-tight text-white text-pretty sm:text-2xl">
            {meta.english}
            <span className="text-white/45"> · </span>
            {meta.name}
          </p>
          {profileName && (
            <p className="text-sm font-medium text-[#e8d6ff]/90">{profileName}</p>
          )}
          {headline && (
            <p className="text-sm font-medium text-white/80 text-pretty">{headline}</p>
          )}
          {dateLabel && <p className="text-xs text-white/50">{dateLabel}</p>}
        </div>
        <p className="text-xs leading-relaxed text-white/55 text-pretty sm:text-[13px]">
          Your moon sign for this personalised hub — readings below follow {meta.english}.
        </p>
      </div>

      <div className="relative flex w-full shrink-0 items-center justify-end sm:w-auto sm:pl-2">
        <button
          type="button"
          onClick={onProfileAction}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-full border border-white/20',
            'bg-white/5 px-4 py-2.5 text-sm font-semibold text-white',
            'transition hover:border-[#c4a0ff]/50 hover:bg-[#7c4dff]/25',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c4dff]',
          )}
        >
          {profileAction === 'change' ? (
            <>
              <RefreshCw className="size-3.5" aria-hidden />
              Change profile
            </>
          ) : (
            <>
              <Plus className="size-3.5" aria-hidden />
              Add profile
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function RashiStrip({
  selected,
  onSelect,
}: {
  selected: RashiName
  onSelect: (name: RashiName) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<{
    active: boolean
    moved: boolean
    capturing: boolean
    pointerId: number | null
    startX: number
    scrollLeft: number
  }>({
    active: false,
    moved: false,
    capturing: false,
    pointerId: null,
    startX: 0,
    scrollLeft: 0,
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const active = el.querySelector<HTMLElement>('[data-selected="true"]')
    if (!active) return
    const left = active.offsetLeft - el.clientWidth / 2 + active.clientWidth / 2
    el.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [selected])

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el || e.button !== 0) return
    drag.current = {
      active: true,
      moved: false,
      capturing: false,
      pointerId: e.pointerId,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current.active || !ref.current) return
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) <= 6) return
    drag.current.moved = true
    if (!drag.current.capturing) {
      drag.current.capturing = true
      try {
        ref.current.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      ref.current.style.cursor = 'grabbing'
    }
    ref.current.scrollLeft = drag.current.scrollLeft - dx
  }

  function onPointerUp() {
    drag.current.active = false
    drag.current.capturing = false
    drag.current.pointerId = null
    const el = ref.current
    if (el) el.style.cursor = 'grab'
  }

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label="Moon sign"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="flex cursor-grab flex-nowrap gap-3 overflow-x-auto px-1 py-5 select-none [scrollbar-width:none] active:cursor-grabbing sm:gap-3.5 sm:py-6 [&::-webkit-scrollbar]:hidden"
    >
      {RASHIS.map((r) => {
        const active = selected === r.name
        return (
          <button
            key={r.name}
            type="button"
            role="option"
            aria-selected={active}
            data-selected={active ? 'true' : undefined}
            onClick={() => {
              if (drag.current.moved) return
              onSelect(r.name)
            }}
            className={cn(
              'group/rashi relative flex h-[12.5rem] w-[7.25rem] shrink-0 flex-col items-end justify-end overflow-hidden rounded-[1.25rem] border px-3 pb-4 pt-3 transition sm:h-[13.5rem] sm:w-[8.25rem] sm:pb-5 sm:pt-4',
              active
                ? 'border-copper text-copper shadow-[0_0_0_1px_rgba(124,77,255,0.45),0_0_28px_-8px_rgba(124,77,255,0.75)]'
                : 'border-border/80 text-ink hover:border-copper/40',
            )}
          >
            {/* Soft background art only — no foreground icon */}
            <img
              src={RASHI_ART[r.name]}
              alt=""
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-0 size-full object-cover transition duration-300',
                'scale-110 group-hover/rashi:scale-[1.15]',
                active ? 'opacity-80' : 'opacity-70 group-hover/rashi:opacity-75',
              )}
            />
            <div
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-0',
                'bg-gradient-to-t from-[#0a0818]/90 via-[#0a0818]/45 to-[#0a0818]/15',
                active && 'from-[#14082e]/88 via-[#14082e]/40 to-[#7c4dff]/10',
              )}
            />

            <div className="relative z-[1] flex w-full flex-col items-center gap-0.5 text-center">
              <span
                className={cn(
                  'text-base font-semibold drop-shadow-sm sm:text-lg',
                  active ? 'text-copper' : 'text-white',
                )}
              >
                {r.name}
              </span>
              <span aria-hidden className={cn('text-lg leading-none', active ? 'text-copper/70' : 'text-white/45')}>
                {r.glyph}
              </span>
              <span
                className={cn(
                  'text-xs sm:text-sm',
                  active ? 'text-copper/80' : 'text-white/65',
                )}
              >
                {r.english}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

const VERTICAL_ICON: Record<
  HoroscopeVerticalId,
  typeof Briefcase
> = {
  career: Briefcase,
  love: Heart,
  health: HeartPulse,
  finance: Wallet,
  lucky: Clover,
  focus: Focus,
  family: Home,
  growth: Sprout,
}

const VERTICAL_TONE: Record<
  HoroscopeVerticalId,
  { text: string; bar: string }
> = {
  love: { text: 'text-[#ff8fab]', bar: 'bg-[#ff5c7a]' },
  finance: { text: 'text-[#7dffb3]', bar: 'bg-[#3dd68c]' },
  career: { text: 'text-[#ffc46b]', bar: 'bg-[#f0a03a]' },
  health: { text: 'text-[#7ec8ff]', bar: 'bg-[#4aa3f0]' },
  lucky: { text: 'text-[#e8d6ff]', bar: 'bg-[#9b6dff]' },
  focus: { text: 'text-[#ffd88a]', bar: 'bg-[#e8b84a]' },
  family: { text: 'text-[#ffb38a]', bar: 'bg-[#f08a4a]' },
  growth: { text: 'text-[#9dffc0]', bar: 'bg-[#3dd68c]' },
}

/** One life area: summary card left, reading right — next area starts below. */
function AreaBlock({
  vertical,
  period,
  seed,
  birthDate,
  english,
  index,
  total,
}: {
  vertical: SignHoroscopeVertical
  period: HoroscopePeriod
  seed: string
  birthDate: string
  english: string
  index: number
  total: number
}) {
  const kind = verticalToKind(vertical.id, period) as HoroscopeKind
  const { status, data, error, retry } = useAsync(
    (signal) => getHoroscope(kind, seed, birthDate, signal),
    [kind, seed, birthDate],
  )
  const Icon = VERTICAL_ICON[vertical.id]
  const tone = VERTICAL_TONE[vertical.id]
  const isLast = index === total - 1

  return (
    <article
      id={`area-${vertical.id}`}
      className="scroll-mt-24"
      aria-label={`${vertical.label} reading`}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)] lg:items-start lg:gap-7">
        <aside className="lg:sticky lg:top-20">
          <div
            className={cn(
              'relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-[1.75rem] border border-[#7c4dff]/40',
              'bg-[linear-gradient(160deg,#24105a_0%,#120e28_45%,#0d1a38_100%)]',
              'shadow-[0_0_0_1px_rgba(124,77,255,0.14),0_28px_64px_-28px_rgba(124,77,255,0.7)]',
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#7c4dff]/30 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-[#3a7bd5]/20 blur-3xl"
            />

            <div className="relative flex items-center justify-between gap-2 px-5 pb-2 pt-5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c4a0ff]">
                {english} · {vertical.label}
              </p>
              <p className="font-mono text-[10px] tabular-nums text-white/45">
                {index + 1} / {total}
              </p>
            </div>

            <div className="relative flex flex-1 flex-col justify-between gap-5 px-5 pb-6 pt-2">
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      'inline-flex size-14 shrink-0 items-center justify-center rounded-2xl',
                      'border border-[#c4a0ff]/35 bg-[#7c4dff]/25 text-[#e8d6ff]',
                      'shadow-[0_0_24px_-8px_rgba(196,160,255,0.85)]',
                    )}
                  >
                    <Icon className="size-6" aria-hidden strokeWidth={2} />
                  </span>
                  <span className={cn('text-2xl font-semibold tabular-nums', tone.text)}>
                    {vertical.score}%
                  </span>
                </div>

                <div className="space-y-3">
                  <h2 className="font-serif text-3xl font-semibold tracking-tight text-white">
                    {vertical.label}
                  </h2>
                  <div
                    aria-hidden
                    className="h-2.5 w-full overflow-hidden rounded-full bg-white/10"
                  >
                    <div
                      className={cn('h-full rounded-full', tone.bar)}
                      style={{ width: `${vertical.score}%` }}
                    />
                  </div>
                  <p className="text-base leading-relaxed text-white/70 text-pretty sm:text-[17px]">
                    {vertical.blurb}
                  </p>
                </div>
              </div>

              {!isLast && (
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  Next area below
                </p>
              )}
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          {status === 'error' ? (
            <ErrorState error={error} onRetry={retry} title="This horoscope did not load" />
          ) : status === 'loading' || status === 'idle' || !data ? (
            <HoroscopeSkeleton />
          ) : (
            <HoroscopeBody horoscope={data} />
          )}
        </div>
      </div>
    </article>
  )
}

const DATE_CHIP_PX = 84
const DATE_CENTER_SCALE = 1.28
const DATE_GAP_PX = 12
const DATE_STRIDE = DATE_CHIP_PX + DATE_GAP_PX
const DATE_CENTER_PX = Math.round(DATE_CHIP_PX * DATE_CENTER_SCALE)

/**
 * Fixed-center date lens (transform carousel):
 * Purple disc is CSS-pinned to 50%. The chip row translates so the active
 * index always sits on that same center — no overflow scroll math.
 */
function DateStrip({
  chips,
  selectedId,
  period,
  onSelect,
}: {
  chips: ReturnType<typeof buildHoroscopeDateChips>
  selectedId: string
  period: HoroscopePeriod
  onSelect: (id: string) => void
}) {
  const indexOfId = (id: string) => {
    const i = chips.findIndex((c) => c.id === id)
    return i < 0 ? 0 : i
  }

  const [activeIndex, setActiveIndex] = useState(() => indexOfId(selectedId))
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const activeIndexRef = useRef(activeIndex)
  const wheelLock = useRef(0)
  const dragRef = useRef<{
    active: boolean
    startX: number
    originIndex: number
    moved: boolean
    pointerId: number | null
    samples: { t: number; x: number }[]
  }>({
    active: false,
    startX: 0,
    originIndex: 0,
    moved: false,
    pointerId: null,
    samples: [],
  })

  activeIndexRef.current = activeIndex

  // Keep the lens on the selected chip when span / list / selection changes.
  useLayoutEffect(() => {
    setActiveIndex(indexOfId(selectedId))
    setDragX(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, period, chips.map((c) => c.id).join('|')])

  const clampIndex = (i: number) => Math.max(0, Math.min(chips.length - 1, i))

  const commitIndex = (i: number) => {
    const next = clampIndex(i)
    setActiveIndex(next)
    setDragX(0)
    const id = chips[next]?.id
    if (id && id !== selectedId) onSelect(id)
  }

  // While dragging, keep transform anchored to the drag origin so the row follows the finger.
  const originIndex = dragging ? dragRef.current.originIndex : activeIndex
  const liveIndex = dragging
    ? clampIndex(originIndex + Math.round(-dragX / DATE_STRIDE))
    : activeIndex
  const trackX = -DATE_CHIP_PX / 2 - originIndex * DATE_STRIDE + dragX

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    dragRef.current = {
      active: true,
      startX: e.clientX,
      originIndex: activeIndexRef.current,
      moved: false,
      pointerId: e.pointerId,
      samples: [{ t: performance.now(), x: e.clientX }],
    }
    setDragging(true)
    setDragX(0)
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== e.pointerId) return
    const dx = e.clientX - dragRef.current.startX
    if (Math.abs(dx) > 3) dragRef.current.moved = true
    const now = performance.now()
    dragRef.current.samples.push({ t: now, x: e.clientX })
    if (dragRef.current.samples.length > 6) dragRef.current.samples.shift()
    setDragX(dx)
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return
    if (
      dragRef.current.pointerId !== null &&
      e.pointerId !== dragRef.current.pointerId
    ) {
      return
    }
    const dx = e.clientX - dragRef.current.startX
    const moved = dragRef.current.moved
    const origin = dragRef.current.originIndex
    const samples = dragRef.current.samples
    dragRef.current.active = false
    dragRef.current.pointerId = null
    setDragging(false)
    if (!moved) {
      setDragX(0)
      return
    }

    // Momentum from recent pointer samples (px / ms → coast distance).
    let velocity = 0
    if (samples.length >= 2) {
      const first = samples[0]!
      const last = samples[samples.length - 1]!
      const dt = last.t - first.t
      if (dt > 0) velocity = (last.x - first.x) / dt
    }
    const coast = velocity * 160 // ms of glide
    const projected = -dx - coast
    const delta = Math.round(projected / DATE_STRIDE)
    commitIndex(origin + delta)
  }

  const onWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (Math.abs(delta) < 6) return
    e.preventDefault()
    const now = performance.now()
    if (now - wheelLock.current < 220) return
    wheelLock.current = now
    commitIndex(activeIndexRef.current + (delta > 0 ? 1 : -1))
  }

  return (
    <div
      className="relative w-full cursor-grab touch-none select-none active:cursor-grabbing"
      style={{ height: DATE_CENTER_PX }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onWheel={onWheel}
    >
      {/* Pinned purple disc — larger center lens */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2',
          'rounded-full bg-copper',
          'shadow-[0_0_40px_-4px_rgba(124,77,255,0.95)]',
        )}
        style={{ width: DATE_CENTER_PX, height: DATE_CENTER_PX }}
      />

      <div
        role="listbox"
        aria-label="Dates"
        className="absolute inset-0 z-[2] overflow-hidden"
        style={{
          WebkitMaskImage:
            'linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)',
          maskImage: 'linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)',
        }}
      >
        <div
          className="absolute top-1/2 flex will-change-transform"
          style={{
            left: '50%',
            gap: DATE_GAP_PX,
            transform: `translate3d(${trackX}px, -50%, 0)`,
            transition: dragging
              ? 'none'
              : 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {chips.map((chip, index) => {
            const inLens = index === liveIndex
            const dist = Math.abs(index - liveIndex)
            const scale = inLens
              ? DATE_CENTER_SCALE
              : Math.max(0.78, 1 - dist * 0.07)
            const blurPx = inLens ? 0 : Math.min(5, dist * 1.25)
            return (
              <button
                key={chip.id}
                type="button"
                role="option"
                aria-selected={inLens}
                onClick={() => {
                  if (dragRef.current.moved) return
                  commitIndex(index)
                }}
                className={cn(
                  'flex shrink-0 flex-col items-center justify-center rounded-full border bg-transparent',
                  'transition-[transform,filter,color,border-color] duration-300 ease-out',
                  inLens ? 'border-transparent text-midnight' : 'border-border-strong text-ink',
                )}
                style={{
                  width: DATE_CHIP_PX,
                  height: DATE_CHIP_PX,
                  transform: `scale(${scale})`,
                  filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
                  opacity: inLens ? 1 : Math.max(0.45, 1 - dist * 0.12),
                  zIndex: inLens ? 2 : 1,
                }}
              >
                {period === 'monthly' ? (
                  <>
                    <span
                      className={cn(
                        'font-semibold',
                        inLens ? 'text-base sm:text-lg' : 'text-sm sm:text-base',
                      )}
                    >
                      {chip.label}
                    </span>
                    <span
                      className={cn(
                        'mt-0.5 text-[10px] uppercase',
                        inLens ? 'text-midnight/75' : 'text-muted',
                      )}
                    >
                      {new Date(`${chip.iso}T12:00:00`).getFullYear()}
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className={cn(
                        'font-medium uppercase tracking-wide',
                        inLens ? 'text-[11px] sm:text-xs' : 'text-[10px] sm:text-[11px]',
                        inLens ? 'text-midnight/75' : 'text-muted',
                      )}
                    >
                      {chip.weekday}
                    </span>
                    <span
                      className={cn(
                        'font-semibold leading-none',
                        inLens ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl',
                      )}
                    >
                      {chip.dayNum}
                    </span>
                    <span
                      className={cn(
                        'mt-0.5 text-[10px] uppercase',
                        inLens ? 'text-midnight/70' : 'text-muted',
                      )}
                    >
                      {chip.monthShort}
                    </span>
                  </>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

