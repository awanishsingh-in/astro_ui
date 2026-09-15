import { useEffect, useState } from 'react'
import { PremiumChartWheel } from '@/components/charts/PremiumChartWheel'
import { CelestialCard } from '@/components/celestial/CelestialCard'
import type { Chart, GrahaCode } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { bhavaRef, BHAVA_SIGNIFIES, GRAHAS } from '@/utils/astro'

/** Named work, in the order the reading actually happens. */
export const CALCULATION_STAGES = [
  'Understanding your question',
  'Finding the relevant house',
  'Reading the planets',
  'Checking your current dasha',
  'Preparing your answer',
] as const

const STAGE_MS = 1100

export interface CalculationStateProps {
  question: string
  /** The chart being consulted — this is the point of the screen. */
  chart: Chart
  /** The bhava the answer will be read from. Lights up at stage 1. */
  bhava: number
  /** The grahas that will be cited. They ring at stage 2. */
  grahas: GrahaCode[]
  dashaPath: string
  onDone: () => void
  className?: string
}

/**
 * The wait, spent showing the user their own chart being consulted.
 *
 * Not a spinner and not typing dots: each stage lights the part of the wheel
 * it is about — the bhava, then the grahas, then the period — so by the time
 * the answer arrives you have already seen where it came from. The whole wait
 * happens on the night sky, and the answer arrives on paper.
 */
export function CalculationState({
  question,
  chart,
  bhava,
  grahas,
  dashaPath,
  onDone,
  className,
}: CalculationStateProps) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (stage >= CALCULATION_STAGES.length - 1) {
      const finish = window.setTimeout(onDone, STAGE_MS)
      return () => window.clearTimeout(finish)
    }
    const next = window.setTimeout(() => setStage((s) => s + 1), STAGE_MS)
    return () => window.clearTimeout(next)
  }, [stage, onDone])

  return (
    <CelestialCard
      motifs={['stars', 'orbits']}
      tone="midnight"
      seed="ask"
      padding="lg"
      className={cn('mx-auto w-full max-w-reading', className)}
    >
      <div className="flex flex-col items-center">
        {/* The question is the page's subject throughout the flow, so it carries
          the <h1> here too — the bar above is chrome. */}
        <h1 className="w-full text-center text-sub font-normal text-on-celestial-muted text-pretty">
          {question}
        </h1>

        <div className="mt-8 w-full max-w-[300px]">
          <PremiumChartWheel
            chart={chart}
            tone="dark"
            animationKey="ask"
            activeBhava={stage >= 1 ? bhava : undefined}
            activeGraha={stage >= 2 ? grahas[0] : null}
          />
        </div>

        {/* One live region; the visible label swaps beneath it. */}
        <p role="status" aria-live="polite" className="sr-only">
          {CALCULATION_STAGES[stage]}
        </p>

        <div className="relative mt-8 h-7 w-full">
          {CALCULATION_STAGES.map((label, index) => (
            <p
              key={label}
              aria-hidden
              className={cn(
                'absolute inset-x-0 text-center text-body text-on-celestial transition-all duration-500 ease-out-soft',
                index === stage
                  ? 'translate-y-0 opacity-100'
                  : index < stage
                    ? '-translate-y-2 opacity-0'
                    : 'translate-y-2 opacity-0',
              )}
            >
              {label}
              <span className="text-on-celestial-faint">…</span>
            </p>
          ))}
        </div>

        {/* What each stage has settled, revealed as it happens. */}
        <dl className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Fact show={stage >= 1} label="House">
            {bhavaRef(bhava)} · {BHAVA_SIGNIFIES[bhava]}
          </Fact>
          <Fact show={stage >= 2} label="Planets">
            {grahas.map((code) => GRAHAS[code].name).join(', ')}
          </Fact>
          <Fact show={stage >= 3} label="Dasha">
            {dashaPath}
          </Fact>
        </dl>

        <div className="mt-8 flex items-center gap-1.5" aria-hidden>
          {CALCULATION_STAGES.map((label, index) => (
            <span
              key={label}
              className={cn(
                'h-1 rounded-full transition-all duration-500 ease-out-soft',
                index <= stage ? 'w-6 bg-gold-soft-line' : 'w-3 bg-celestial-line',
              )}
            />
          ))}
        </div>
      </div>
    </CelestialCard>
  )
}

function Fact({
  show,
  label,
  children,
}: {
  show: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex items-baseline gap-2 transition-all duration-500 ease-out-soft',
        show ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
      )}
    >
      <dt className="font-mono text-label uppercase text-on-celestial-faint">{label}</dt>
      <dd className="font-mono text-data text-on-celestial">{children}</dd>
    </div>
  )
}
