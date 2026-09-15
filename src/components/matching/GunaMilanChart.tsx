import type { KootaResult } from '@/data/matching-mock'
import { cn } from '@/utils/cn'

export interface GunaMilanChartProps {
  kootas: KootaResult[]
  className?: string
}

/**
 * The eight kootas, each as a proportion of the points it carries.
 *
 * Bar width is the koota's *weight* in the total, so Nadi's eight points look
 * eight times Varna's one — which is the thing a single number hides.
 */
export function GunaMilanChart({ kootas, className }: GunaMilanChartProps) {
  const totalMax = kootas.reduce((sum, k) => sum + k.max, 0)

  return (
    <ul className={cn('space-y-3', className)}>
      {kootas.map((koota) => {
        const full = koota.score === koota.max
        const empty = koota.score === 0
        const weight = (koota.max / totalMax) * 100

        return (
          <li key={koota.id} className="space-y-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <span className="text-sub font-medium text-ink">{koota.name}</span>
              <span
                className={cn(
                  'font-mono text-data',
                  empty ? 'text-critical' : full ? 'text-dignity-exalted' : 'text-muted',
                )}
              >
                {koota.score} / {koota.max}
              </span>
            </div>

            {/* The track is the koota's weight in the whole, not a fixed width. */}
            <div className="flex items-center gap-2">
              <div
                className="h-2 shrink-0 overflow-hidden rounded-full bg-surface-sunken"
                style={{ width: `${weight}%` }}
              >
                <div
                  className={cn(
                    'h-full rounded-full transition-[width] duration-700 ease-out-soft',
                    empty ? 'bg-critical/40' : full ? 'bg-gold' : 'bg-navy',
                  )}
                  style={{ width: `${(koota.score / koota.max) * 100}%` }}
                />
              </div>
              <span className="min-w-0 flex-1 truncate text-xs text-muted">{koota.detail}</span>
            </div>

            {koota.concern && (
              <p className="text-xs text-caution text-pretty">{koota.concern}</p>
            )}
          </li>
        )
      })}
    </ul>
  )
}
