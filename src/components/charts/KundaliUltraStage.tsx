import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  INTRO_TOTAL_MS,
  KundaliCinematicIntro,
} from '@/components/charts/KundaliCinematicIntro'
import { KundaliPortalCanvas } from '@/components/charts/KundaliPortalCanvas'
import { cn } from '@/utils/cn'
import './KundaliUltraStage.css'

/** Persists across tabs/refreshes — first chart cinematic plays only once. */
const INTRO_SEEN_KEY = 'cyklos-kundali-intro-seen'

export type UltraPhase = 'intro' | 'ambient' | 'soft'

export const ULTRA_DURATION_MS = INTRO_TOTAL_MS

/** In-memory guard so React Strict Mode remounts cannot restart a finished intro. */
let introFinishedThisRuntime = false

function shouldPlayIntro(reduceMotion: boolean | null): boolean {
  if (reduceMotion || introFinishedThisRuntime) return false
  try {
    return localStorage.getItem(INTRO_SEEN_KEY) !== '1'
  } catch {
    return !introFinishedThisRuntime
  }
}

function markIntroPlayed() {
  introFinishedThisRuntime = true
  try {
    localStorage.setItem(INTRO_SEEN_KEY, '1')
  } catch {
    /* ignore */
  }
}

export interface KundaliUltraStageProps {
  children?: ReactNode
  /** When true, force the cinematic intro (ignores session flag). */
  forceIntro?: boolean
  reduceMotion?: boolean | null
  chart: ReactNode
  header?: ReactNode
  footer?: ReactNode
  className?: string
  onIntroComplete?: () => void
  /** Soft remount pulse for D1/D2 switches. */
  softPulse?: boolean
}

/**
 * Chart stage: full-bleed cinematic intro overlay → real interactive kundli.
 * The opening animation plays once (localStorage), never again on D1/D2,
 * planet taps, or later visits. Skippable.
 */
export function KundaliUltraStage({
  children,
  forceIntro = false,
  reduceMotion = false,
  chart,
  header,
  footer,
  className,
  onIntroComplete,
  softPulse = false,
}: KundaliUltraStageProps) {
  const [introActive, setIntroActive] = useState(() =>
    forceIntro ? !reduceMotion : shouldPlayIntro(reduceMotion),
  )
  const [ambientGl, setAmbientGl] = useState(true)
  const completedRef = useRef(false)

  const finishIntro = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    setIntroActive(false)
    markIntroPlayed()
    onIntroComplete?.()
  }, [onIntroComplete])

  // Intro already consumed (session / reduced-motion) — unlock chart interactions.
  useEffect(() => {
    if (!introActive) finishIntro()
  }, [introActive, finishIntro])

  // If reduce-motion flips on after mount, cancel intro.
  useEffect(() => {
    if (reduceMotion && introActive) finishIntro()
  }, [reduceMotion, introActive, finishIntro])

  return (
    <div
      className={cn(
        'kundali-ultra',
        introActive && 'kundali-ultra--intro',
        !introActive && 'kundali-ultra--ambient',
        softPulse && 'kundali-ultra--soft',
        className,
      )}
    >
      {/* Ambient residual after intro — low cost */}
      {!introActive && ambientGl && !reduceMotion && (
        <KundaliPortalCanvas
          className="kundali-ultra__portal"
          progress={1}
          mode="ambient"
          onUnavailable={() => setAmbientGl(false)}
        />
      )}

      <div className="kundali-ultra__ambient-veil" aria-hidden />
      <div className="kundali-ultra__frame-flash" aria-hidden />

      <div className="kundali-ultra__content">
        {header}
        <div className="kundali-ultra__chart-rig px-4 pb-3 sm:px-6">
          <div
            className={cn(
              'kundali-ultra__chart-plane relative',
              introActive && 'kundali-ultra__chart-plane--waiting',
            )}
          >
            {chart}
            <KundaliCinematicIntro active={introActive} onComplete={finishIntro} />
          </div>
        </div>
        {footer}
        {children}
      </div>
    </div>
  )
}
