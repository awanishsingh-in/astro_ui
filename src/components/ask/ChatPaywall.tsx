import { Crown } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import { Modal } from '@/components/modals/Modal'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { cn } from '@/utils/cn'
import { useState } from 'react'

const PLANS = [
  {
    id: 'plus-month',
    name: 'Cyklos Plus',
    price: '₹199 / month',
    note: 'Chat with your chart · cancel anytime',
  },
  {
    id: 'plus-year',
    name: 'Cyklos Plus · Yearly',
    price: '₹1,799 / year',
    note: 'Two months free · best value',
  },
] as const

export interface ChatPaywallProps {
  isOpen: boolean
  onClose: () => void
  /** Demo unlock — no real payment. */
  onUnlock: (planId: string) => void
}

/**
 * Shown when someone tries to chat without an active plan.
 * Demo purchase only — stores unlock in localStorage via the parent.
 */
export function ChatPaywall({ isOpen, onClose, onUnlock }: ChatPaywallProps) {
  const desktop = useIsDesktop()
  const [planId, setPlanId] = useState<string>(PLANS[0].id)
  const Overlay = desktop ? Modal : BottomSheet

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      title="Chat needs a plan"
      description="Ask is included with Cyklos Plus. Choose a plan to message your chart."
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" size="md" onClick={onClose}>
            Not now
          </Button>
          <Button variant="primary" size="md" onClick={() => onUnlock(planId)}>
            Unlock chat
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-card border border-gold-border/60 bg-gold-soft/40 px-4 py-3">
          <Crown className="mt-0.5 size-5 shrink-0 text-gold-deep" aria-hidden />
          <p className="text-sm text-ink text-pretty">
            Free accounts can browse the chart. Chat with Cyklos is unlocked by a plan.
          </p>
        </div>

        <ul className="space-y-2" role="listbox" aria-label="Plans">
          {PLANS.map((plan) => {
            const active = plan.id === planId
            return (
              <li key={plan.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => setPlanId(plan.id)}
                  className={cn(
                    'flex w-full flex-col rounded-card border px-4 py-3 text-left transition-colors',
                    active
                      ? 'border-gold bg-gold-soft/50'
                      : 'border-border bg-surface hover:border-border-strong',
                  )}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-ink">{plan.name}</span>
                    <span className="font-mono text-sm text-gold-deep">{plan.price}</span>
                  </span>
                  <span className="mt-1 text-sm text-muted">{plan.note}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <p className="font-mono text-label uppercase tracking-[0.12em] text-muted">
          Demo payment · no real charge
        </p>
      </div>
    </Overlay>
  )
}
