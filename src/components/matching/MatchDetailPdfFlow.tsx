import { CreditCard, FileText, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import { Modal } from '@/components/modals/Modal'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { cn } from '@/utils/cn'

export type DetailPdfPhase = 'offer' | 'pay' | null

export interface MatchDetailPdfFlowProps {
  phase: DetailPdfPhase
  onClose: () => void
  onProceedToPay: () => void
  onPaymentSuccess: () => void
}

/**
 * ₹99 detailed-PDF purchase — offer sheet, then a demo payment gateway.
 * Plus plan does not skip this; every detailed PDF is a one-time ₹99 unlock.
 */
export function MatchDetailPdfFlow({
  phase,
  onClose,
  onProceedToPay,
  onPaymentSuccess,
}: MatchDetailPdfFlowProps) {
  const desktop = useIsDesktop()
  const Overlay = desktop ? Modal : BottomSheet
  const [paying, setPaying] = useState(false)

  if (!phase) return null

  if (phase === 'offer') {
    return (
      <Overlay
        isOpen
        onClose={onClose}
        title="Get the detailed PDF"
        description="A clear eight-koota breakdown for this match — strengths, frictions, and Manglik notes."
        footer={
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" size="md" onClick={onClose}>
              Not now
            </Button>
            <Button variant="primary" size="md" onClick={onProceedToPay}>
              Proceed
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-card border border-gold-border/60 bg-gold-soft/40 px-4 py-3.5">
            <FileText className="mt-0.5 size-5 shrink-0 text-gold-deep" aria-hidden />
            <p className="text-sm text-ink text-pretty">
              Pay ₹99 — a decent way to get the detailed PDF for this match. Cyklos Plus does not
              include this report; it is a separate one-time unlock.
            </p>
          </div>
          <p className="font-mono text-label uppercase tracking-[0.12em] text-muted">
            One-time · ₹99 · this match only
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
      description="Complete ₹99 to unlock the detailed match PDF."
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
            {paying ? 'Processing…' : 'Pay ₹99'}
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
            <p className="mt-1 text-title font-semibold text-ink">₹99</p>
          </div>
          <p className="text-right text-sm text-muted">Detailed Kundli Matching PDF</p>
        </div>

        <div className="flex items-start gap-3 rounded-card border border-border px-4 py-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold-deep" aria-hidden />
          <p className="text-sm text-muted text-pretty">
            Demo payment gateway · no real charge. Confirm to continue to your PDF.
          </p>
        </div>
      </div>
    </Overlay>
  )
}
