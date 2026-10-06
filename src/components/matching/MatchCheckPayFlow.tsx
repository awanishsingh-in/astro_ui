import { CreditCard, HeartHandshake, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import { Modal } from '@/components/modals/Modal'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import {
  formatMatchCheckInr,
  MATCH_CHECK_PRICE,
  MATCH_UNLIMITED_DAYS,
} from '@/onboarding/match-check-unlock'
import { cn } from '@/utils/cn'

export type MatchCheckPayPhase = 'offer' | 'pay' | null

export interface MatchCheckPayFlowProps {
  phase: MatchCheckPayPhase
  onClose: () => void
  onProceedToPay: () => void
  onPaymentSuccess: () => void
}

/**
 * Demo paywall — ₹99 unlocks unlimited Kundli matching for one month.
 */
export function MatchCheckPayFlow({
  phase,
  onClose,
  onProceedToPay,
  onPaymentSuccess,
}: MatchCheckPayFlowProps) {
  const desktop = useIsDesktop()
  const Overlay = desktop ? Modal : BottomSheet
  const [paying, setPaying] = useState(false)

  if (!phase) return null

  if (phase === 'offer') {
    return (
      <Overlay
        isOpen
        onClose={onClose}
        title="Unlock unlimited matching"
        description={`Your free match is used. Pay ${formatMatchCheckInr()} once for ${MATCH_UNLIMITED_DAYS} days of unlimited Guna Milan — any profiles, as often as you like.`}
        footer={
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" size="md" onClick={onClose}>
              Not now
            </Button>
            <Button variant="primary" size="md" onClick={onProceedToPay}>
              Unlock · {formatMatchCheckInr()}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-card border border-copper/40 bg-copper/10 px-4 py-3.5">
            <HeartHandshake className="mt-0.5 size-5 shrink-0 text-copper" aria-hidden />
            <p className="text-sm text-ink text-pretty">
              One payment · match family, friends, or anyone for a full month. Demo only · no real
              charge.
            </p>
          </div>
          <p className="font-mono text-label uppercase tracking-[0.12em] text-muted">
            {formatMatchCheckInr()} · {MATCH_UNLIMITED_DAYS} days · unlimited matches
          </p>
        </div>
      </Overlay>
    )
  }

  const confirmPay = () => {
    setPaying(true)
    window.setTimeout(() => {
      setPaying(false)
      onPaymentSuccess()
    }, 900)
  }

  return (
    <Overlay
      isOpen
      onClose={paying ? () => undefined : onClose}
      title="Payment gateway"
      description={`Complete ${formatMatchCheckInr()} for ${MATCH_UNLIMITED_DAYS} days of unlimited matching.`}
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" size="md" onClick={onClose} disabled={paying}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={confirmPay}
            disabled={paying}
            iconLeft={<CreditCard className="size-4" />}
          >
            {paying ? 'Processing…' : `Pay ${formatMatchCheckInr()}`}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div
          className={cn(
            'rounded-card border border-border bg-surface-sunken px-4 py-4',
            'flex items-center justify-between gap-3',
          )}
        >
          <div>
            <p className="font-mono text-label uppercase tracking-[0.12em] text-muted">Amount</p>
            <p className="mt-1 text-title font-semibold text-ink">
              {formatMatchCheckInr(MATCH_CHECK_PRICE)}
            </p>
          </div>
          <p className="text-right text-sm text-muted">
            Unlimited matching · {MATCH_UNLIMITED_DAYS} days
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-card border border-border px-4 py-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold-deep" aria-hidden />
          <p className="text-sm text-muted text-pretty">
            Demo payment gateway · no real charge. Confirm to unlock matching for a month.
          </p>
        </div>
      </div>
    </Overlay>
  )
}
