import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalculatingChart } from '@/components/charts/CalculatingChart'
import { GalaxyBackdrop } from '@/components/celestial/GalaxyBackdrop'
import { useAuth } from '@/auth/auth-context'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'

/**
 * What the app is doing, in the order it actually does it. Naming the work is
 * the point — a spinner would say only that something is happening.
 */
const STAGES = [
  'Reading your birth details',
  'Placing the planets',
  'Calculating your houses',
  'Mapping your nakshatra',
  'Preparing your chart',
] as const

const STAGE_MS = 1200

/**
 * A5 — the calculating screen.
 *
 * The one full-screen night sky in the signed-in flow: the chart draws itself
 * out of the dark, and the app arrives in daylight on the next screen.
 *
 * Four stages, each revealing one more layer of the wheel, then the Past
 * Insight onboarding (or Ask if that intro was already seen). The account
 * already exists by the time this renders: signup completed on the previous
 * screen, so nothing here can fail and there is no error state to show.
 */
export default function CalculatingPage() {
  const { user, finishSignup } = useAuth()
  const navigate = useNavigate()
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (stage >= STAGES.length - 1) {
      // Let the last stage finish drawing before leaving.
      const done = window.setTimeout(() => {
        finishSignup()
        // Always land on Know Your Past after calculating. That page redirects
        // to Ask only if this user already completed or skipped it.
        navigate(paths.onboardingPast, { replace: true })
      }, STAGE_MS + 400)
      return () => window.clearTimeout(done)
    }
    const next = window.setTimeout(() => setStage((s) => s + 1), STAGE_MS)
    return () => window.clearTimeout(next)
  }, [stage, navigate, finishSignup])

  const firstName = user?.fullName.split(' ')[0]

  return (
    <GalaxyBackdrop
      className="min-h-dvh"
      contentClassName="pointer-events-none flex min-h-dvh flex-col items-center justify-center px-6 py-12"
    >
      <div className="w-full max-w-[300px]">
        <CalculatingChart stage={stage} tone="dark" />
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 text-center">
        {/*
          One live region announces the current stage; the visible text swaps
          beneath it. Announcing each stage separately would talk over itself.
        */}
        <p role="status" aria-live="polite" className="sr-only">
          {STAGES[stage]}
        </p>

        <div className="relative h-7 w-full">
          {STAGES.map((label, index) => (
            <p
              key={label}
              aria-hidden
              className={cn(
                'absolute inset-x-0 text-body text-on-celestial transition-all duration-500 ease-out-soft',
                index === stage
                  ? 'translate-y-0 opacity-100'
                  : index < stage
                    ? '-translate-y-2 opacity-0'
                    : 'translate-y-2 opacity-0',
              )}
            >
              <span className="mr-2 font-mono text-label text-on-celestial-faint">
                {String(index + 1).padStart(2, '0')}
              </span>
              {label}
              <span className="text-on-celestial-faint">…</span>
            </p>
          ))}
        </div>

        <p className="font-mono text-label uppercase text-on-celestial-muted">
          Ephemeris · Lahiri ayanamsa
        </p>

        <div className="mt-3 flex items-center gap-1.5" aria-hidden>
          {STAGES.map((label, index) => (
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

      {firstName && (
        <p className="mt-12 text-sm text-on-celestial-muted">
          This takes a moment, {firstName}. It only happens once.
        </p>
      )}
    </GalaxyBackdrop>
  )
}
