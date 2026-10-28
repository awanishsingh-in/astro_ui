import { useEffect, useMemo, useState } from 'react'
import { KundaliPortalCanvas } from '@/components/charts/KundaliPortalCanvas'
import { cn } from '@/utils/cn'
import './KundaliCinematicIntro.css'

export type IntroPhase = 'portal' | 'assemble' | 'ignite' | 'exit'

/** Total intro length before the real chart is uncovered. */
export const INTRO_TOTAL_MS = 5200

const PHASE_MS: { phase: IntroPhase; at: number }[] = [
  { phase: 'portal', at: 0 },
  { phase: 'assemble', at: 1600 },
  { phase: 'ignite', at: 3200 },
  { phase: 'exit', at: 4500 },
]

/** North Indian cell paths — visual assembly only; real data stays on ChartDiamond. */
const CELL_PATH: Record<number, string> = {
  1: 'M150 0 L225 75 L150 150 L75 75 Z',
  2: 'M0 0 L150 0 L75 75 Z',
  3: 'M0 0 L75 75 L0 150 Z',
  4: 'M0 150 L75 75 L150 150 L75 225 Z',
  5: 'M0 150 L75 225 L0 300 Z',
  6: 'M0 300 L75 225 L150 300 Z',
  7: 'M150 300 L75 225 L150 150 L225 225 Z',
  8: 'M150 300 L225 225 L300 300 Z',
  9: 'M300 300 L225 225 L300 150 Z',
  10: 'M300 150 L225 225 L150 150 L225 75 Z',
  11: 'M300 0 L300 150 L225 75 Z',
  12: 'M150 0 L300 0 L225 75 Z',
}

const SPARKS = [
  { x: 150, y: 68, d: 0 },
  { x: 72, y: 262, d: 40 },
  { x: 150, y: 238, d: 80 },
  { x: 232, y: 150, d: 120 },
  { x: 228, y: 40, d: 160 },
  { x: 68, y: 150, d: 200 },
  { x: 38, y: 222, d: 240 },
  { x: 262, y: 78, d: 280 },
]

export interface KundaliCinematicIntroProps {
  active: boolean
  onComplete: () => void
  className?: string
}

/**
 * Full-bleed cinematic intro overlay.
 * Covers the chart while orbital rings + wireframe assemble in perspective,
 * then exits to reveal the real interactive ChartDiamond underneath.
 */
export function KundaliCinematicIntro({
  active,
  onComplete,
  className,
}: KundaliCinematicIntroProps) {
  const [phase, setPhase] = useState<IntroPhase>('portal')
  const [progress, setProgress] = useState(0)
  const [webgl, setWebgl] = useState(true)

  const caption = useMemo(() => {
    switch (phase) {
      case 'portal':
        return 'The cosmos aligns…'
      case 'assemble':
        return 'Your kundali takes form'
      case 'ignite':
        return 'Planets awaken'
      default:
        return ''
    }
  }, [phase])

  useEffect(() => {
    if (!active) return
    setPhase('portal')
    setProgress(0)
    const start = performance.now()
    let raf = 0
    let doneTimer = 0
    let finished = false

    function finish() {
      if (finished) return
      finished = true
      onComplete()
    }

    function tick(now: number) {
      const elapsed = now - start
      const p = Math.min(1, elapsed / INTRO_TOTAL_MS)
      setProgress(p)
      let next: IntroPhase = 'portal'
      for (const step of PHASE_MS) {
        if (elapsed >= step.at) next = step.phase
      }
      setPhase(next)
      if (elapsed < INTRO_TOTAL_MS) {
        raf = requestAnimationFrame(tick)
      } else {
        doneTimer = window.setTimeout(finish, 80)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(doneTimer)
    }
  }, [active, onComplete])

  if (!active) return null

  return (
    <div className={cn('kci', className)} data-phase={phase} role="presentation">
      {webgl ? (
        <KundaliPortalCanvas
          className="kci__webgl"
          progress={Math.min(1, progress * 1.15)}
          mode="cinematic"
          onUnavailable={() => setWebgl(false)}
        />
      ) : (
        <div
          aria-hidden
          className="kci__webgl"
          style={{
            background:
              'radial-gradient(ellipse at 50% 45%, , transparent 55%), #0F0B19',
          }}
        />
      )}

      <button type="button" className="kci__skip" onClick={onComplete}>
        Skip
      </button>

      <div className="kci__scene">
        <div className="kci__rig">
          <div className="kci__rings-fade">
            <div className="kci__ring kci__ring--a" />
            <div className="kci__ring kci__ring--b" />
            <div className="kci__ring kci__ring--c" />
            <div className="kci__core" />
          </div>

          <svg className="kci__wire" viewBox="0 0 300 300" aria-hidden>
            <rect className="kci__draw-rim" x="0" y="0" width="300" height="300" />
            <line className="kci__draw-d1" x1="0" y1="0" x2="300" y2="300" />
            <line className="kci__draw-d2" x1="300" y1="0" x2="0" y2="300" />
            <path className="kci__draw-dia" d="M150 0 L300 150 L150 300 L0 150 Z" />

            {Object.entries(CELL_PATH).map(([bhava, d], i) => (
              <path
                key={bhava}
                className="kci__house-flash"
                d={d}
                style={{ animationDelay: `${i * 45}ms` }}
              />
            ))}

            <path className="kci__lagna" d={CELL_PATH[1]} />

            {SPARKS.map((s, i) => (
              <circle
                key={i}
                className="kci__spark"
                cx={s.x}
                cy={s.y}
                r="3"
                style={{ animationDelay: `${s.d}ms` }}
              />
            ))}
          </svg>
        </div>
      </div>

      {caption && <p className="kci__caption">{caption}</p>}
    </div>
  )
}
