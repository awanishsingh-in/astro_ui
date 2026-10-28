import { Check } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/modals/Modal'
import {
  formatInr,
  MUHURAT_PLAN_SINGLE_PRICE,
  MUHURAT_PLAN_UNLIMITED_PRICE,
  MUHURAT_UNLIMITED_DAYS,
  type MuhuratPlanKind,
} from '@/data/muhurat-plans'
import { cn } from '@/utils/cn'

/**
 * Choose ₹49 (one download) or ₹399 (unlimited for a month).
 */
export function MuhuratPlanPaywall({
  isOpen,
  onClose,
  onChoose,
}: {
  isOpen: boolean
  onClose: () => void
  onChoose: (kind: MuhuratPlanKind) => void
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Get personalized muhurat"
      description="Pick a plan, then choose which muhurat to download."
      size="md"
    >
      <div className="grid gap-3 p-5 sm:grid-cols-2">
        <PlanCard
          price={formatInr(MUHURAT_PLAN_SINGLE_PRICE)}
          label="One download"
          points={['Download any one muhurat', 'Keep Get personalized on the hub', 'Shows under Your recent muhurat']}
          onPick={() => onChoose('single')}
          cta={`Pay ${formatInr(MUHURAT_PLAN_SINGLE_PRICE)}`}
        />
        <PlanCard
          price={formatInr(MUHURAT_PLAN_UNLIMITED_PRICE)}
          label="Unlimited · 1 month"
          points={[
            `Unlimited downloads for ${MUHURAT_UNLIMITED_DAYS} days`,
            'Find your muhurat rail on the hub',
            'Get personalized button hidden',
          ]}
          featured
          onPick={() => onChoose('unlimited')}
          cta={`Pay ${formatInr(MUHURAT_PLAN_UNLIMITED_PRICE)}`}
        />
      </div>
    </Modal>
  )
}

function PlanCard({
  price,
  label,
  points,
  featured,
  onPick,
  cta,
}: {
  price: string
  label: string
  points: string[]
  featured?: boolean
  onPick: () => void
  cta: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border p-4',
        featured
          ? 'border-copper/50 bg-gradient-to-br from-copper/20 to-primary/10'
          : 'border-border/80 bg-surface-sunken/40',
      )}
    >
      <div>
        <p className="font-serif text-2xl font-semibold text-ink">{price}</p>
        <p className="mt-0.5 text-sm font-medium text-muted">{label}</p>
      </div>
      <ul className="space-y-1.5">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-xs text-muted">
            <Check className="mt-0.5 size-3.5 shrink-0 text-silver-300" aria-hidden />
            <span className="text-pretty">{p}</span>
          </li>
        ))}
      </ul>
      <Button
        variant={featured ? 'primary' : 'secondary'}
        size="md"
        className="mt-auto w-full rounded-full"
        onClick={onPick}
      >
        {cta}
      </Button>
    </div>
  )
}
