import { NakshatraBadge } from '@/components/celestial/NakshatraBadge'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import type { Chart } from '@/types/astrology'
import { GRAHAS } from '@/utils/astro'
import { cn } from '@/utils/cn'
import { formatDegree } from '@/utils/format'

export interface ChartNakshatraPanelProps {
  chart: Chart
  className?: string
}

/**
 * Charts tab — Moon nakshatra as the centrepiece, then every graha’s star.
 */
export function ChartNakshatraPanel({ chart, className }: ChartNakshatraPanelProps) {
  const moon = chart.grahas.find((g) => g.graha === 'Mo')

  return (
    <div className={cn('animate-rise space-y-5', className)}>
      <div className="space-y-1.5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
          Charts
        </p>
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Birth star
        </h2>
        <p className="max-w-lg text-sm leading-relaxed text-muted text-pretty">
          The Moon’s nakshatra opens your Vimshottari dasha. Pada marks how far Chandra had
          travelled inside that star.
        </p>
      </div>

      {moon && (
        <article
          className={cn(
            'relative overflow-hidden rounded-3xl border border-border/80',
            'bg-[radial-gradient(90%_80%_at_80%_0%,rgba(180,140,90,0.2),transparent_50%),var(--color-surface)]',
            'px-5 py-7 sm:px-8 sm:py-9',
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 top-4 size-36 rounded-full border border-copper/20"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-2 top-10 size-24 rounded-full border border-copper/30"
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-copper/35 bg-copper/12 px-3 py-1">
                <PlanetGlyph code="Mo" size="sm" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                  Chandra nakshatra
                </span>
              </div>
              <h3 className="font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                {moon.nakshatra.name}
              </h3>
              <p className="text-sm text-muted">
                Pada {moon.nakshatra.pada} of 4 · in {moon.rashi} ·{' '}
                {formatDegree(moon.degree, moon.minute)}
              </p>
              <NakshatraBadge
                name={moon.nakshatra.name}
                pada={moon.nakshatra.pada}
                lord={moon.nakshatra.lord}
                size="md"
              />
            </div>

            <div className="grid grid-cols-4 gap-1.5 self-start sm:self-center">
              {[1, 2, 3, 4].map((p) => (
                <span
                  key={p}
                  className={cn(
                    'flex size-11 items-center justify-center rounded-xl border font-mono text-sm font-semibold transition',
                    p === moon.nakshatra.pada
                      ? 'border-copper bg-copper/20 text-copper'
                      : 'border-border/70 bg-surface-sunken/40 text-muted',
                  )}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </article>
      )}

      <section className="space-y-3" aria-label="Graha nakshatras">
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Every graha’s star
        </h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {chart.grahas.map((g) => {
            const meta = GRAHAS[g.graha]
            return (
              <li
                key={g.graha}
                className="flex items-center gap-3 rounded-2xl border border-border/80 bg-surface/80 px-3.5 py-3"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-sunken/50 text-ink">
                  <PlanetGlyph code={g.graha} size="md" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{meta.name}</p>
                  <p className="truncate text-xs text-muted">
                    {g.nakshatra.name} · pada {g.nakshatra.pada} · {g.rashi}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
