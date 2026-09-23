import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import type { Chart } from '@/types/astrology'
import { BHAVA_SIGNIFIES, GRAHAS } from '@/utils/astro'
import { cn } from '@/utils/cn'
import { formatDegree } from '@/utils/format'

export interface ChartKpPanelProps {
  chart: Chart
  className?: string
}

/**
 * KP tab — cuspal / star-lord style reading from the birth chart (demo).
 */
export function ChartKpPanel({ chart, className }: ChartKpPanelProps) {
  const moon = chart.grahas.find((g) => g.graha === 'Mo')

  return (
    <div className={cn('animate-rise space-y-5', className)}>
      <div className="space-y-1.5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
          KP
        </p>
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Krishnamurti cusps
        </h2>
        <p className="max-w-lg text-sm leading-relaxed text-muted text-pretty">
          Star lords and house cusps from this chart — a KP-style lens on the same sky.
        </p>
      </div>

      <article
        className={cn(
          'relative overflow-hidden rounded-3xl border border-copper/35',
          'bg-[radial-gradient(100%_80%_at_0%_0%,rgba(232,168,78,0.18),transparent_55%),var(--color-surface)]',
          'px-5 py-6 sm:px-7 sm:py-7',
        )}
      >
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
          Ruling star
        </p>
        <p className="mt-2 font-serif text-3xl font-semibold text-ink">
          {moon ? moon.nakshatra.name : '—'}
        </p>
        {moon && (
          <p className="mt-1 text-sm text-muted">
            Pada {moon.nakshatra.pada} · lord {GRAHAS[moon.nakshatra.lord].name} · opens the dasha
          </p>
        )}
      </article>

      <section className="space-y-3" aria-label="KP cusps">
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Cusp table
        </h3>
        <ul className="overflow-hidden rounded-3xl border border-border/80 bg-surface/90">
          {chart.bhavas.map((b, i) => {
            const starLord =
              chart.grahas[(i + chart.grahas.findIndex((g) => g.graha === 'Mo')) % chart.grahas.length]
            return (
              <li
                key={b.bhava}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5 sm:px-5',
                  i > 0 && 'border-t border-border/60',
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-copper/30 bg-copper/10 font-mono text-xs font-semibold text-copper">
                  {b.bhava}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {b.rashi} · {BHAVA_SIGNIFIES[b.bhava as keyof typeof BHAVA_SIGNIFIES]}
                  </p>
                  <p className="truncate text-xs text-muted">
                    Cusp lord {b.lord}
                    {starLord
                      ? ` · star ${starLord.nakshatra.name} (${GRAHAS[starLord.nakshatra.lord].name})`
                      : ''}
                  </p>
                </div>
                {starLord && (
                  <span className="hidden shrink-0 sm:inline-flex">
                    <PlanetGlyph code={starLord.nakshatra.lord} size="sm" />
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="space-y-3" aria-label="KP graha levels">
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Graha · star · sub
        </h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {chart.grahas.map((g) => (
            <li
              key={g.graha}
              className="flex items-center gap-3 rounded-2xl border border-border/80 bg-surface/80 px-3.5 py-3"
            >
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-sunken/50">
                <PlanetGlyph code={g.graha} size="md" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{GRAHAS[g.graha].name}</p>
                <p className="truncate text-xs text-muted">
                  {g.nakshatra.name} · sub {GRAHAS[g.nakshatra.lord].name} ·{' '}
                  {formatDegree(g.degree, g.minute)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
