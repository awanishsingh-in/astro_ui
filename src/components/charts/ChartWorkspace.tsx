import { Maximize2, Send } from 'lucide-react'
import { useRef, useState, type FormEvent, type RefObject } from 'react'
import { ReadingNotes } from '@/components/astrology/ReadingNotes'
import { Button } from '@/components/common/Button'
import { ChartDiamond } from '@/components/charts/ChartDiamond'
import { VargaSelector, vargaLabel } from '@/components/charts/VargaSelector'
import { buildAnswer } from '@/data/answer-mock'
import {
  buildChartBasicsBundle,
  CHART_ASK_SUGGESTIONS,
} from '@/data/chart-basics'
import { buildDasha } from '@/data/dasha-mock'
import { vargas } from '@/data/vargas'
import type { Chart, GrahaCode, VargaCode } from '@/types/astrology'
import type { BirthDetails } from '@/types/user'
import { GRAHAS } from '@/utils/astro'
import { cn } from '@/utils/cn'

interface ChartAskTurn {
  id: string
  question: string
  verdict: string
  reason: string
  tags: string[]
}

export interface ChartWorkspaceProps {
  chart: Chart
  birthDetails: BirthDetails
  varga: VargaCode
  onVargaChange: (varga: VargaCode) => void
  activeBhava?: number
  onBhavaClick: (bhava: number) => void
  activeGraha: GrahaCode | null
  onClearSelection: () => void
  chartFrameRef: RefObject<HTMLDivElement | null>
  detailUnlocked: boolean
  onGetDetail: () => void
  className?: string
}

/**
 * Charts tab — kundali · fact cards · ask drawer (replies stay on this screen).
 */
export function ChartWorkspace({
  chart,
  birthDetails,
  varga,
  onVargaChange,
  activeBhava,
  onBhavaClick,
  activeGraha,
  onClearSelection,
  chartFrameRef,
  detailUnlocked,
  onGetDetail,
  className,
}: ChartWorkspaceProps) {
  const vargaMeta = vargas.find((v) => v.code === varga)
  const { basics, birth, avakhada } = buildChartBasicsBundle(chart, birthDetails)
  const [draft, setDraft] = useState('')
  const [turns, setTurns] = useState<ChartAskTurn[]>([])
  const [asking, setAsking] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)
  const hasSelection = Boolean(activeGraha || activeBhava)

  function ask(question: string) {
    const q = question.trim()
    if (!q || asking) return

    setAsking(true)
    setDraft('')
    window.setTimeout(() => {
      const dasha = buildDasha(chart, birthDetails.date)
      const reading = buildAnswer(q, chart, dasha)
      const tags = [
        ...reading.answer.source.grahas.map((g) => GRAHAS[g].english),
        reading.answer.source.bhava ? `${reading.answer.source.bhava}H` : '',
        'chart',
      ].filter(Boolean)

      setTurns((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${prev.length}`,
          question: q,
          verdict: reading.answer.verdict,
          reason: reading.answer.reason,
          tags: tags.slice(0, 4),
        },
      ])
      setAsking(false)
      window.requestAnimationFrame(() => {
        threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
      })
    }, 450)
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    ask(draft)
  }

  return (
    <div className={cn('animate-rise space-y-5', className)}>
      <VargaSelector value={varga} onChange={onVargaChange} />

      <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(18rem,22rem)] xl:items-start">
        <section className="overflow-hidden rounded-3xl border border-border/80 bg-surface/90 shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3 sm:px-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
              {vargaLabel(varga)}
              {vargaMeta ? ` · ${vargaMeta.name}` : ''}
            </p>
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-navy-soft hover:text-ink"
              aria-label="Expand chart"
              onClick={() =>
                chartFrameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            >
              <Maximize2 className="size-3.5" />
            </button>
          </div>

          <div ref={chartFrameRef} className="p-4 sm:p-5">
            <ChartDiamond
              chart={chart}
              tone="surface"
              activeBhava={activeBhava}
              onBhavaClick={onBhavaClick}
              className="mx-auto w-full max-w-[560px]"
            />
            <p className="mt-4 text-center text-xs text-muted text-pretty">
              Hover a house to highlight it · click for its detail panel
            </p>
          </div>

          {hasSelection && (
            <div className="border-t border-border/70 px-4 py-4 sm:px-5">
              <ReadingNotes
                chart={chart}
                activeGraha={activeGraha}
                activeBhava={activeBhava}
              />
              <button
                type="button"
                onClick={onClearSelection}
                className="mt-3 w-full rounded-full border border-copper/35 bg-copper/10 py-2 text-sm font-medium text-copper hover:bg-copper/15"
              >
                Clear selection
              </button>
            </div>
          )}
        </section>

        <div className="space-y-3">
          <FactCard
            title="Your basics"
            rows={[
              ['Lagna', basics.lagna],
              ['Moon Sign', basics.moonSign],
              ['Sun Sign', basics.sunSign],
              ['Nakshatra', basics.nakshatra],
            ]}
          />
          <FactCard
            title="At your birth"
            rows={[
              ['Tithi', birth.tithi],
              ['Yoga', birth.yoga],
              ['Karana', birth.karana],
              ['Weekday', birth.weekday],
              ['Sunrise', birth.sunrise],
              ['Ayanamsa', birth.ayanamsa],
            ]}
          />
          <FactCard
            title="Avakhada"
            rows={[
              ['Varna', avakhada.varna],
              ['Vashya', avakhada.vashya],
              ['Yoni', avakhada.yoni],
              ['Gana', avakhada.gana],
              ['Nadi', avakhada.nadi],
              ['Tara', avakhada.tara],
            ]}
          />
        </div>

        <aside className="flex min-h-[28rem] flex-col overflow-hidden rounded-3xl border border-border/80 bg-surface/90 shadow-card xl:sticky xl:top-20 xl:max-h-[calc(100dvh-7rem)]">
          <div className="border-b border-border/70 px-4 py-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              Suggested from this screen
            </p>
          </div>

          <div ref={threadRef} className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-3">
            {CHART_ASK_SUGGESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                disabled={asking}
                onClick={() => ask(q)}
                className={cn(
                  'rounded-2xl border border-border/80 bg-surface-sunken/40 px-3.5 py-3 text-left text-sm text-ink',
                  'transition hover:border-copper/40 hover:bg-copper/10 disabled:opacity-60',
                )}
              >
                {q}
              </button>
            ))}

            {turns.map((turn) => (
              <div
                key={turn.id}
                className="mt-1 space-y-2 rounded-2xl border border-border/70 bg-surface-sunken/30 p-3"
              >
                <p className="rounded-2xl bg-copper/15 px-3 py-2 text-sm text-ink text-pretty">
                  {turn.question}
                </p>
                <div className="space-y-2 px-1">
                  <p className="text-xs font-semibold text-gold-deep">Cyklos</p>
                  <p className="text-sm font-medium leading-relaxed text-ink text-pretty">
                    {turn.verdict}
                  </p>
                  <p className="text-sm leading-relaxed text-muted text-pretty">{turn.reason}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {turn.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border/70 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {asking && (
              <p className="px-1 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                Reading your chart…
              </p>
            )}

            {turns.length === 0 && !asking && (
              <p className="mt-1 px-1 text-xs text-muted text-pretty">
                Tap a suggestion or type below — answers stay in this drawer.
              </p>
            )}
          </div>

          <form
            onSubmit={onSubmit}
            className="mt-auto border-t border-border/70 bg-surface-sunken/25 p-3"
          >
            <div className="flex items-center gap-2 rounded-full border border-border/80 bg-surface px-3 py-1.5">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about this chart…"
                disabled={asking}
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={asking || !draft.trim()}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-navy text-ink transition enabled:hover:bg-navy/90 disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="size-3.5" />
              </button>
            </div>
            <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
              The drawer keeps the tab you are on as context
            </p>
          </form>
        </aside>
      </div>

      <div className="flex justify-center pt-1">
        <Button
          variant={detailUnlocked ? 'secondary' : 'primary'}
          size="md"
          className="w-full max-w-xs rounded-full sm:max-w-sm"
          onClick={onGetDetail}
        >
          {detailUnlocked ? 'Download / view detail' : 'Get detail'}
        </Button>
      </div>
    </div>
  )
}

function FactCard({
  title,
  rows,
}: {
  title: string
  rows: [string, string][]
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-border/80 bg-surface/90 shadow-card">
      <header className="border-b border-border/60 px-4 py-3 sm:px-5">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
      </header>
      <dl className="grid grid-cols-2 gap-px bg-border/50">
        {rows.map(([label, value]) => (
          <div key={label} className="bg-surface px-4 py-3 sm:px-5">
            <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              {label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink text-pretty">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}
