import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import type { PanchangAlertPref } from '@/data/panchang-mock'
import { cn } from '@/utils/cn'

export function PanchangAlertsView({
  alerts,
  onToggle,
  onSave,
}: {
  alerts: PanchangAlertPref[]
  onToggle: (id: string) => void
  onSave: () => void
}) {
  return (
    <Card padding="lg" className="max-w-2xl gap-6 border-border/80 sm:p-7">
      <div className="space-y-1.5">
        <h2 className="text-heading font-semibold text-ink">Daily alerts</h2>
        <p className="text-sm leading-relaxed text-muted">Push and email — free, needs an account.</p>
      </div>

      <ul className="divide-y divide-border/60">
        {alerts.map((alert) => (
          <li key={alert.id} className="flex items-center justify-between gap-5 py-4">
            <div className="min-w-0 space-y-1">
              <p className="font-medium text-ink">{alert.title}</p>
              <p className="text-xs leading-relaxed text-muted text-pretty">{alert.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={alert.enabled}
              onClick={() => onToggle(alert.id)}
              className={cn(
                'relative h-7 w-12 shrink-0 rounded-full transition-colors',
                alert.enabled ? 'bg-copper' : 'bg-border-strong',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 size-6 rounded-full bg-warm-white shadow transition-transform',
                  alert.enabled ? 'left-5' : 'left-0.5',
                )}
              />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">
          Quiet hours · 22:00 – 07:00
        </p>
        <Button variant="secondary" size="sm" className="rounded-full" onClick={onSave}>
          Save alerts
        </Button>
      </div>
    </Card>
  )
}
