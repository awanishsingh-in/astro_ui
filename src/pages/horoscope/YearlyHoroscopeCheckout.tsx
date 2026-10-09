import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, CreditCard, Plus, ShieldCheck, Sparkles } from 'lucide-react'
import { useAuth } from '@/auth/auth-context'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { useToast } from '@/components/feedback/toast-context'
import { RELATION_LABEL, type ChartProfile } from '@/data/profiles'
import { PageContainer } from '@/layouts/PageContainer'
import { unlockYearlyHoroscope } from '@/onboarding/past-intro'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'

const UNIT_PRICE = 499
const OFFER_MIN = 2
const OFFER_RATE = 0.4

type Step = 'offer' | 'profiles' | 'cart' | 'pay' | 'done'

function inr(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

/**
 * Yearly personalised horoscope checkout.
 * Offer → multi-profile pick → cart (40% off at 2+) → demo payment.
 */
export function YearlyHoroscopeCheckout({
  profiles,
  onClose,
  onUnlocked,
}: {
  profiles: ChartProfile[]
  onClose: () => void
  /** Called after pay with the profile ids included in this purchase. */
  onUnlocked?: (profileIds: string[]) => void
}) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const [step, setStep] = useState<Step>('offer')
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    profiles[0] ? [profiles[0].id] : [],
  )
  const [paying, setPaying] = useState(false)

  const selected = useMemo(
    () => profiles.filter((p) => selectedIds.includes(p.id)),
    [profiles, selectedIds],
  )
  const subtotal = selected.length * UNIT_PRICE
  const offerOn = selected.length >= OFFER_MIN
  const discount = offerOn ? Math.round(subtotal * OFFER_RATE) : 0
  const total = subtotal - discount

  function toggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function confirmPay() {
    setPaying(true)
    window.setTimeout(() => {
      setPaying(false)
      if (user?.id) {
        unlockYearlyHoroscope(user.id, selectedIds)
        onUnlocked?.(selectedIds)
      }
      setStep('done')
      toast.success('Payment successful', {
        description: `Yearly horoscope unlocked for ${selected.length} profile${selected.length === 1 ? '' : 's'}.`,
      })
    }, 900)
  }

  function goBack() {
    if (paying) return
    if (step === 'offer') {
      onClose()
      return
    }
    if (step === 'profiles') setStep('offer')
    else if (step === 'cart') setStep('profiles')
    else if (step === 'pay') setStep('cart')
    else if (step === 'done') onClose()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const backLabel =
    step === 'offer' || step === 'done'
      ? '← Back to horoscope'
      : step === 'profiles'
        ? '← Back to offer'
        : step === 'cart'
          ? '← Back to profiles'
          : '← Back to cart'

  return (
    <PageContainer width="content" className="pb-16 pt-6 sm:pt-10">
      <article className="mx-auto flex w-full max-w-lg flex-col gap-5 animate-rise">
        <button
          type="button"
          onClick={goBack}
          disabled={paying}
          className="self-start text-xs text-muted underline-offset-2 hover:text-ink hover:underline disabled:opacity-50"
        >
          {backLabel}
        </button>

        {step === 'offer' && (
          <Card padding="lg" className="flex flex-col gap-5 border-border/80 p-6 sm:gap-6 sm:p-8">
            <div className="space-y-2.5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                Yearly horoscope
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-ink text-pretty sm:text-3xl">
                Pay to see your yearly horoscope
              </h1>
              <p className="text-sm leading-relaxed text-muted text-pretty">
                A full year from the birth chart — dasha, transits, and the houses that shape the year.
              </p>
            </div>

            <div className="rounded-2xl border border-copper/35 bg-copper/10 px-4 py-3.5">
              <p className="text-sm font-semibold text-gold-deep">Offer</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink text-pretty">
                {inr(UNIT_PRICE)} per profile. Add 2 profiles and get 40% off.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="mt-1 w-full rounded-full"
              onClick={() => {
                setStep('profiles')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              Proceed
            </Button>
          </Card>
        )}

        {step === 'profiles' && (
          <Card
            key="profiles"
            padding="lg"
            className="flex flex-col gap-4 border-border/80 p-6 sm:p-6"
          >
            <div className="space-y-1.5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                Step 2 of 4
              </p>
              <h1 className="text-2xl font-semibold text-ink text-pretty">
                Who should get the yearly horoscope?
              </h1>
              <p className="text-sm leading-snug text-muted text-pretty">
                Select the profile — or more than one — you want yearly details for.
              </p>
            </div>

            <div
              className={cn(
                'rounded-2xl border px-4 py-3 text-sm leading-relaxed',
                selected.length >= OFFER_MIN
                  ? 'border-copper/40 bg-copper/10 text-ink'
                  : 'border-copper/30 bg-copper/8 text-ink',
              )}
            >
              <p className="font-semibold text-gold-deep">Offer</p>
              <p className="mt-1 text-muted text-pretty">
                Add 2 profiles and get 40% off — {inr(UNIT_PRICE)} each before discount.
              </p>
            </div>

            <ul className="space-y-2" role="listbox" aria-label="Profiles" aria-multiselectable>
              {profiles.map((profile) => {
                const on = selectedIds.includes(profile.id)
                return (
                  <li key={profile.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={on}
                      onClick={() => toggle(profile.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition',
                        on
                          ? 'border-copper bg-copper/12 text-ink'
                          : 'border-border/80 bg-surface/80 text-ink hover:border-copper/40',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded-md border',
                          on ? 'border-copper bg-copper text-midnight' : 'border-border-strong',
                        )}
                      >
                        {on && <Check className="size-3.5" strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">{profile.name}</span>
                        <span className="block text-xs text-muted">
                          {RELATION_LABEL[profile.relation]}
                          {profile.note ? ` · ${profile.note}` : ''}
                        </span>
                      </span>
                      <span className="text-sm text-muted">{inr(UNIT_PRICE)}</span>
                    </button>
                  </li>
                )
              })}
            </ul>

            {profiles.length === 0 && (
              <p className="text-sm text-muted">No profiles yet. Add one to continue.</p>
            )}

            <div className="flex flex-col gap-2.5 border-t border-border/60 pt-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full rounded-full"
                iconLeft={<Plus className="size-3.5" />}
                onClick={() => navigate(paths.profile)}
              >
                Add a profile
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full rounded-full"
                disabled={selected.length === 0}
                onClick={() => {
                  setStep('cart')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Proceed with {selected.length || 0} profile
                {selected.length === 1 ? '' : 's'}
              </Button>
            </div>
          </Card>
        )}

        {step === 'cart' && (
          <Card padding="lg" className="flex flex-col gap-4 border-border/80 p-6 sm:gap-5 sm:p-7">
            <h1 className="text-2xl font-semibold text-ink">Your cart</h1>
            <ul className="divide-y divide-border/60">
              {selected.map((profile) => (
                <li key={profile.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{profile.name}</p>
                    <p className="text-xs text-muted">Yearly horoscope</p>
                  </div>
                  <p className="text-sm font-medium text-ink">{inr(UNIT_PRICE)}</p>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setStep('profiles')}
              className="inline-flex items-center gap-2 text-sm font-medium text-copper hover:underline"
            >
              <Plus className="size-4" />
              Add more profiles
            </button>

            <div
              className={cn(
                'rounded-2xl border px-4 py-3.5 text-sm leading-relaxed',
                offerOn
                  ? 'border-copper/40 bg-copper/10 text-ink'
                  : 'border-border/80 bg-surface-sunken/50 text-muted',
              )}
            >
              {offerOn
                ? '40% off applied — you added 2 or more profiles.'
                : 'Add 2 profiles and get 40% off.'}
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <dt>Subtotal</dt>
                <dd>{inr(subtotal)}</dd>
              </div>
              {offerOn && (
                <div className="flex justify-between text-gold-deep">
                  <dt>40% off</dt>
                  <dd>−{inr(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-border/60 pt-2 text-base font-semibold text-ink">
                <dt>Total</dt>
                <dd>{inr(total)}</dd>
              </div>
            </dl>

            <Button
              variant="primary"
              size="lg"
              className="w-full rounded-full"
              iconLeft={<CreditCard className="size-4" />}
              onClick={() => setStep('pay')}
            >
              Pay {inr(total)}
            </Button>
          </Card>
        )}

        {step === 'pay' && (
          <Card padding="lg" className="flex flex-col gap-4 border-border/80 p-6 sm:gap-5 sm:p-7">
            <h1 className="text-2xl font-semibold text-ink">Payment gateway</h1>
            <p className="text-sm text-muted">Complete {inr(total)} for the yearly horoscope.</p>
            <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-surface-sunken/50 px-4 py-4">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Amount
                </p>
                <p className="mt-1 text-2xl font-semibold text-ink">{inr(total)}</p>
              </div>
              <p className="max-w-[10rem] text-right text-sm text-muted">
                Yearly horoscope · {selected.length} profile{selected.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-border/80 px-4 py-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold-deep" aria-hidden />
              <p className="text-sm text-muted text-pretty">
                Demo payment gateway · no real charge. Confirm to finish.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="ghost"
                size="md"
                className="rounded-full"
                disabled={paying}
                onClick={() => setStep('cart')}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1 rounded-full"
                disabled={paying}
                iconLeft={<CreditCard className="size-4" />}
                onClick={confirmPay}
              >
                {paying ? 'Processing…' : `Pay ${inr(total)}`}
              </Button>
            </div>
          </Card>
        )}

        {step === 'done' && (
          <Card padding="lg" className="flex flex-col gap-4 border-border/80 p-6 sm:gap-5 sm:p-8">
            <Sparkles className="size-6 text-copper" aria-hidden />
            <h1 className="text-2xl font-semibold text-ink">Payment complete</h1>
            <p className="text-sm leading-relaxed text-muted text-pretty">
              Yearly horoscope is unlocked for {selected.map((p) => p.name).join(', ')}.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="w-full rounded-full"
              onClick={() => navigate(paths.horoscope('yearly-personal'))}
            >
              Read yearly horoscope
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={onClose}>
              Back to hub
            </Button>
          </Card>
        )}
      </article>
    </PageContainer>
  )
}
