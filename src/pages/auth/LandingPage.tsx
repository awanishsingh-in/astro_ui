import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button } from '@/components/common/Button'
import { Logo } from '@/components/brand/Logo'
import { AstroMetadata } from '@/components/celestial/AstroMetadata'
import { CelestialBackground } from '@/components/celestial/CelestialBackground'
import { GlowCursor } from '@/components/celestial/GlowCursor'
import { ShootingStars } from '@/components/celestial/ShootingStars'
import { ZodiacOrbit } from '@/components/celestial/ZodiacOrbit'
import { useAuth } from '@/auth/auth-context'
import { paths } from '@/routes/paths'
import type { GrahaCode } from '@/types/astrology'
import { GRAHAS } from '@/utils/astro'
import { cn } from '@/utils/cn'

/** The instrument settings, stated on the first screen rather than buried. */
const BASIS = [
  { label: 'Zodiac', value: 'Sidereal' },
  { label: 'Ayanamsa', value: 'Lahiri' },
  { label: 'Houses', value: 'Whole sign' },
  { label: 'Dasha', value: 'Vimshottari' },
]

const CYCLE_GRAHAS: GrahaCode[] = ['Mo', 'Me', 'Ve', 'Su', 'Ma', 'Ju', 'Sa']

/**
 * A1 / B1 / C1 / D1 — one landing screen for all four flows.
 *
 * The hero is the product's one uninterrupted piece of night sky: the zodiac
 * turning against its planetary tracks, the copy set on midnight beside it.
 * Motion is celestial — ring drift, planet orbits, constellation draw, meteors,
 * and a gold/indigo glow cursor trail on fine pointers.
 */
export default function LandingPage() {
  const { isSignedIn, isLoading } = useAuth()
  const navigate = useNavigate()
  const [activeGraha, setActiveGraha] = useState<GrahaCode>('Ju')
  const [glowEnabled, setGlowEnabled] = useState(false)

  // Someone already signed in has no business on the landing screen.
  useEffect(() => {
    if (!isLoading && isSignedIn) navigate(paths.ask, { replace: true })
  }, [isLoading, isSignedIn, navigate])

  // Glow cursor is a desktop flourish — skip touch / reduced-motion devices.
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setGlowEnabled(fine.matches && !reduce.matches)
    sync()
    fine.addEventListener('change', sync)
    reduce.addEventListener('change', sync)
    return () => {
      fine.removeEventListener('change', sync)
      reduce.removeEventListener('change', sync)
    }
  }, [])

  // Walk the classical grahas so one planet stays marked as the figure turns.
  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const grahaTimer = window.setInterval(() => {
      setActiveGraha((code) => {
        const i = CYCLE_GRAHAS.indexOf(code)
        return CYCLE_GRAHAS[(i + 1) % CYCLE_GRAHAS.length]
      })
    }, 4200)
    return () => {
      window.clearInterval(grahaTimer)
    }
  }, [])

  return (
    <GlowCursor
      className="min-h-dvh"
      style={{ minHeight: '100dvh' }}
      enabled={glowEnabled}
      color="#E5C875"
      secondaryColor="#7B6FD6"
      trailLength={40}
      trailWidth={8}
      trailTaper={0.8}
      followSpeed={0.16}
      glowIntensity={1.9}
      glowSpread={1.2}
      hotspot={0.65}
      brightness={1.25}
      opacity={1}
      pulseSpeed={1.1}
      noiseStrength={0.035}
      idleFade
      idleTimeout={700}
      fadeDuration={900}
      blendMode="screen"
    >
      <CelestialBackground
        motifs={['stars', 'orbits', 'constellation']}
        tone="midnight"
        seed="landing"
        className="flex min-h-dvh flex-col"
      >
        <ShootingStars />

        <header className="relative z-10 flex h-mobilebar items-center justify-between px-5 animate-rise-slow lg:h-topnav lg:px-10">
          <Logo size="sm" tone="dark" className="lg:hidden" />
          <Logo size="md" tone="dark" className="hidden lg:flex" />
          <Button variant="celestialGhost" size="sm" to={paths.signIn}>
            Sign in
          </Button>
        </header>

        <main className="relative z-10 flex flex-1 flex-col justify-center px-5 pt-6 pb-14 lg:px-10 lg:pt-10 lg:pb-20">
          <div className="mx-auto w-full max-w-content">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-14">
              <div className="flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left">
                <Logo
                  layout="stacked"
                  size="lg"
                  tone="dark"
                  withTagline
                  className="animate-rise-slow lg:hidden"
                />

                <h1
                  className={cn(
                    'mt-10 max-w-2xl font-serif text-display font-normal text-on-celestial text-balance',
                    'animate-rise-slow lg:mt-0 lg:text-display-lg',
                  )}
                  style={{ animationDelay: '80ms' }}
                >
                  Ask a question. Get an answer calculated from your birth chart.
                </h1>

                <p
                  className="mt-5 max-w-xl animate-rise-slow text-body text-on-celestial-muted text-pretty"
                  style={{ animationDelay: '180ms' }}
                >
                  Enter your birth date, time and place once. Every answer names the house and the
                  planets it was read from, and gives a range of dates rather than a single promise.
                </p>

                <div
                  className="mt-8 flex w-full animate-rise-slow flex-col items-center gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4"
                  style={{ animationDelay: '280ms' }}
                >
                  <Button
                    variant="celestial"
                    to={paths.signUp}
                    fullWidth
                    className="sm:w-auto sm:min-w-[11.5rem] sm:px-10"
                  >
                    Create account
                  </Button>
                  <p className="max-w-[14rem] text-center text-xs leading-snug text-on-celestial-muted sm:text-left">
                    About a minute. No password — you sign in with a code.
                  </p>
                </div>

                <p
                  className="mt-6 animate-rise-slow text-sm text-on-celestial-muted lg:hidden"
                  style={{ animationDelay: '340ms' }}
                >
                  Already have an account?{' '}
                  <Link
                    to={paths.signIn}
                    className="font-semibold text-gold-soft-line underline-offset-4 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>

                <div
                  className="mt-10 w-full animate-rise-slow"
                  style={{ animationDelay: '420ms' }}
                >
                  <AstroMetadata
                    items={BASIS}
                    tone="dark"
                    className="justify-center lg:justify-start"
                  />
                </div>
              </div>

              {/*
                The figure is decoration in the accessibility tree — the four
                metadata values above already say what it depicts.
              */}
              <div
                className="relative mx-auto w-full max-w-[340px] animate-rise-slow lg:max-w-none"
                style={{ animationDelay: '220ms' }}
              >
                {/* Soft gold breath behind the wheel. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-[8%] rounded-full motion-safe:animate-pulse-soft"
                  style={{
                    background:
                      'radial-gradient(circle, color-mix(in srgb, var(--color-gold) 28%, transparent) 0%, transparent 70%)',
                  }}
                />
                <div className="relative motion-safe:animate-float">
                  <ZodiacOrbit
                    tone="dark"
                    pace="hero"
                    activeGraha={activeGraha}
                    className="opacity-95"
                    label="Animated sidereal zodiac with planetary orbits"
                  />
                </div>
                <p className="mt-4 text-center font-mono text-label uppercase tracking-wide text-on-celestial-faint">
                  <span className="text-gold-soft-line">{GRAHAS[activeGraha].name}</span>
                  {' · moving through the signs'}
                </p>
              </div>
            </div>
          </div>
        </main>
      </CelestialBackground>
    </GlowCursor>
  )
}
