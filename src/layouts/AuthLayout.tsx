import { ChevronLeft } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  AuthAdventureSky,
  AuthAdventureSkyMobile,
} from '@/components/auth/AuthAdventureSky'
import { Logo } from '@/components/brand/Logo'
import { AstroMetadata } from '@/components/celestial/AstroMetadata'
import { CelestialBackground } from '@/components/celestial/CelestialBackground'
import { ProgressIndicator, type ProgressStep } from '@/components/common/ProgressIndicator'
import { cn } from '@/utils/cn'

export interface AuthLayoutProps {
  children: ReactNode
  steps?: ProgressStep[]
  currentStep?: number
  panelTitle?: string
  panelBody?: ReactNode
  backTo?: string
  wide?: boolean
  fitViewport?: boolean
  /**
   * `split` — classic side panel.
   * `stacked` — top banner (~30%) + form (~70%), for birth details.
   * `adventure` — animated planet panel + purple/cyan form (phone / code).
   * `centered` — single centered sky (legacy).
   */
  variant?: 'split' | 'stacked' | 'adventure' | 'centered'
  /** Left-panel tagline for adventure. */
  adventureHeadline?: string
  adventureAccent?: string
  /** Color shell — `adventure` applies login purple/cyan without changing layout. */
  tone?: 'default' | 'adventure'
  className?: string
}

/**
 * Signed-out shell. Adventure is the phone/code entry; split remains for
 * birth details and other longer forms.
 */
export function AuthLayout({
  children,
  steps,
  currentStep = 0,
  panelTitle,
  panelBody,
  backTo,
  wide = false,
  fitViewport = false,
  variant = 'split',
  adventureHeadline,
  adventureAccent,
  tone = 'default',
  className,
}: AuthLayoutProps) {
  if (variant === 'adventure') {
    return (
      <div
        className={cn(
          fitViewport ? 'h-dvh max-h-dvh overflow-hidden' : 'min-h-dvh',
          'lg:grid lg:grid-cols-[1.15fr_0.85fr]',
          className,
        )}
        style={
          {
            '--adv-bg': '#07041a',
            '--adv-form': '#0b071c',
            '--adv-violet': '#7c4dff',
            '--adv-blue': '#3a7bd5',
            '--adv-accent': '#c4a0ff',
            '--adv-cyan': '#5ed7f2',
          } as CSSProperties
        }
      >
        <AuthAdventureSky
          headline={adventureHeadline}
          accent={adventureAccent}
        />

        <div
          className={cn(
            'relative flex flex-col',
            fitViewport ? 'h-full min-h-0 overflow-hidden' : 'min-h-dvh',
          )}
          style={{ background: 'var(--adv-form)' }}
          data-auth-form
        >
          <div className={cn('lg:hidden', fitViewport && 'shrink-0')}>
            {fitViewport ? (
              <div className="flex h-14 items-center gap-2 border-b border-white/10 px-3 pt-safe">
                {backTo && (
                  <Link
                    to={backTo}
                    aria-label="Go back"
                    className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white backdrop-blur-sm"
                  >
                    <ChevronLeft className="size-5" />
                  </Link>
                )}
                <Logo size="sm" tone="dark" />
              </div>
            ) : (
              <div className="relative">
                <AuthAdventureSkyMobile />
                <div className="absolute inset-x-0 top-0 flex h-14 items-center gap-2 px-3 pt-safe">
                  {backTo && (
                    <Link
                      to={backTo}
                      aria-label="Go back"
                      className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white backdrop-blur-sm"
                    >
                      <ChevronLeft className="size-5" />
                    </Link>
                  )}
                  <Logo size="sm" tone="dark" />
                </div>
              </div>
            )}
            {steps && (
              <div className="border-b border-white/10 px-5 py-4">
                <ProgressIndicator steps={steps} current={currentStep} variant="bar" tone="dark" />
              </div>
            )}
          </div>

          <div
            className={cn(
              'relative flex flex-1 flex-col justify-center',
              fitViewport
                ? 'min-h-0 overflow-hidden px-5 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-6'
                : 'px-6 py-10 sm:px-10 lg:px-12 xl:px-16',
            )}
          >
            {backTo && (
              <Link
                to={backTo}
                aria-label="Go back"
                className="absolute left-6 top-6 hidden size-10 items-center justify-center rounded-full border border-white/10 text-white/80 transition-colors hover:border-white/25 hover:text-white lg:inline-flex"
              >
                <ChevronLeft className="size-5" />
              </Link>
            )}

            {steps && (
              <div className="mb-8 hidden lg:block">
                <ProgressIndicator steps={steps} current={currentStep} variant="bar" tone="dark" />
              </div>
            )}

            <div
              className={cn(
                'auth-flow-enter mx-auto w-full',
                wide ? 'max-w-xl' : 'max-w-md',
                fitViewport && 'min-h-0',
              )}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'centered') {
    return (
      <CelestialBackground
        motifs={['stars', 'zodiac', 'constellation', 'orbits']}
        tone="midnight"
        seed="auth-centered"
        className={cn('min-h-dvh', className)}
        contentClassName="relative flex min-h-dvh flex-col"
      >
        {backTo && (
          <Link
            to={backTo}
            aria-label="Go back"
            className={cn(
              'absolute left-4 top-4 z-10 inline-flex size-10 items-center justify-center',
              'rounded-full border border-on-celestial/15 bg-on-celestial/5 text-on-celestial',
              'transition-colors hover:border-on-celestial/30 hover:bg-on-celestial/10',
              'pt-safe sm:left-6 sm:top-6',
            )}
          >
            <ChevronLeft className="size-5" />
          </Link>
        )}

        <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-8">
          <div className="auth-flow-enter flex w-full max-w-[22rem] flex-col items-center gap-10 sm:max-w-sm sm:gap-12">
            <div className="flex flex-col items-center gap-5">
              <Link to="/" aria-label="Cyklos home" className="rounded-xs">
                <Logo size="lg" tone="dark" className="justify-center" />
              </Link>
              {steps && (
                <ProgressIndicator
                  steps={steps}
                  current={currentStep}
                  variant="bar"
                  tone="dark"
                />
              )}
            </div>
            <div className="w-full">{children}</div>
          </div>
        </div>

        <div className="pb-safe flex justify-center px-5 pb-6">
          <AstroMetadata
            tone="dark"
            className="opacity-70"
            items={[
              { label: 'Zodiac', value: 'Sidereal' },
              { label: 'Ayanamsa', value: 'Lahiri' },
            ]}
          />
        </div>
      </CelestialBackground>
    )
  }

  if (variant === 'stacked') {
    const adventure = tone === 'adventure'

    return (
      <div
        className={cn(
          'flex min-h-dvh flex-col',
          adventure ? 'bg-[#0b071c]' : 'bg-canvas',
          fitViewport && 'h-dvh max-h-dvh overflow-hidden',
          className,
        )}
        style={
          adventure
            ? ({
                '--adv-bg': '#07041a',
                '--adv-form': '#0b071c',
                '--adv-violet': '#7c4dff',
                '--adv-blue': '#3a7bd5',
                '--adv-accent': '#c4a0ff',
                '--adv-cyan': '#5ed7f2',
              } as CSSProperties)
            : undefined
        }
      >
        <div
          className={cn(
            'shrink-0 border-b',
            adventure ? 'border-white/10 bg-[#07041a]' : 'border-transparent',
          )}
        >
          {adventure ? (
            <div className="relative px-5 py-4 sm:px-8 sm:py-5 lg:px-10">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden"
                style={{
                  background:
                    'radial-gradient(60% 120% at 0% 0%, rgba(124,77,255,0.28) 0%, transparent 55%), radial-gradient(50% 100% at 100% 100%, rgba(58,123,213,0.18) 0%, transparent 50%)',
                }}
              />
              <div className="relative mx-auto flex w-full max-w-5xl items-center">
                {backTo && (
                  <Link
                    to={backTo}
                    aria-label="Go back"
                    className="mr-2 inline-flex size-9 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-white/30 hover:bg-white/5"
                  >
                    <ChevronLeft className="size-5" />
                  </Link>
                )}
                <Link to="/" aria-label="Cyklos home" className="rounded-xs">
                  <Logo size="md" tone="dark" />
                </Link>
              </div>
            </div>
          ) : (
            <CelestialBackground
              motifs={['stars', 'zodiac', 'orbits']}
              tone="midnight"
              seed="auth-stacked"
              className="shrink-0"
              contentClassName="relative px-5 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-5"
            >
              <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {backTo && (
                      <Link
                        to={backTo}
                        aria-label="Go back"
                        className="inline-flex size-9 items-center justify-center rounded-full border border-on-celestial/15 text-on-celestial transition-colors hover:border-on-celestial/30 hover:bg-on-celestial/10"
                      >
                        <ChevronLeft className="size-5" />
                      </Link>
                    )}
                    <Link to="/" aria-label="Cyklos home" className="rounded-xs">
                      <Logo size="md" tone="dark" />
                    </Link>
                  </div>
                  <AstroMetadata
                    tone="dark"
                    className="hidden opacity-80 sm:flex"
                    items={[
                      { label: 'Zodiac', value: 'Sidereal' },
                      { label: 'Ayanamsa', value: 'Lahiri' },
                    ]}
                  />
                </div>

                {(panelTitle || panelBody || steps) && (
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end">
                    <div className="space-y-2">
                      {panelTitle && (
                        <h2 className="max-w-xl font-serif text-2xl font-semibold tracking-tight text-on-celestial text-balance sm:text-3xl">
                          {panelTitle}
                        </h2>
                      )}
                      {panelBody && (
                        <div className="max-w-xl text-sm text-on-celestial-muted text-pretty">
                          {panelBody}
                        </div>
                      )}
                    </div>
                    {steps && (
                      <div className="lg:justify-self-end lg:w-full lg:max-w-md">
                        <ProgressIndicator
                          steps={steps}
                          current={currentStep}
                          variant="bar"
                          tone="dark"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CelestialBackground>
          )}
        </div>

        <div
          className={cn(
            'relative flex min-h-0 flex-[7] flex-col',
            adventure ? 'bg-[#0b071c]' : 'bg-canvas',
            fitViewport && 'overflow-hidden',
          )}
          data-auth-form
        >
          {!adventure && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(70% 50% at 100% 0%, rgba(124, 77, 255, 0.08) 0%, transparent 55%), radial-gradient(50% 40% at 0% 100%, rgba(26, 15, 61, 0.1) 0%, transparent 50%)',
              }}
            />
          )}
          {adventure && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(70% 50% at 100% 0%, rgba(124,77,255,0.12) 0%, transparent 55%), radial-gradient(50% 40% at 0% 100%, rgba(58,123,213,0.1) 0%, transparent 50%)',
              }}
            />
          )}
          <div
            className={cn(
              'relative flex min-h-0 flex-1 flex-col justify-center px-5 py-5 sm:px-8 sm:py-6 lg:px-10',
              fitViewport && 'overflow-hidden',
            )}
          >
            <div
              className={cn(
                'auth-flow-enter mx-auto w-full',
                wide ? 'max-w-3xl' : 'max-w-2xl',
              )}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const showPanel = Boolean(steps || panelTitle)

  return (
    <div
      className={cn(
        fitViewport ? 'h-dvh max-h-dvh overflow-hidden' : 'min-h-dvh',
        'bg-canvas',
        showPanel && 'lg:grid lg:grid-cols-[2fr_3fr]',
        className,
      )}
    >
      {showPanel && (
        <CelestialBackground
          motifs={['stars', 'zodiac', 'constellation', 'orbits']}
          tone="midnight"
          seed="auth"
          className="hidden lg:block"
          contentClassName={cn(
            'auth-panel-enter flex h-full flex-col justify-between p-10 xl:p-12',
            fitViewport ? 'min-h-0' : 'min-h-dvh',
          )}
        >
          <Link to="/" aria-label="Cyklos home" className="w-fit rounded-xs">
            <Logo size="md" tone="dark" />
          </Link>

          <div className="max-w-md space-y-6">
            {panelTitle && (
              <h2 className="text-title-lg font-semibold text-on-celestial text-balance">
                {panelTitle}
              </h2>
            )}
            {steps && (
              <ProgressIndicator
                steps={steps}
                current={currentStep}
                variant="list"
                tone="dark"
                stagger
              />
            )}
            {panelBody && (
              <div className="text-sub text-on-celestial-muted text-pretty">{panelBody}</div>
            )}
          </div>

          <AstroMetadata
            tone="dark"
            items={[
              { label: 'Zodiac', value: 'Sidereal' },
              { label: 'Ayanamsa', value: 'Lahiri' },
            ]}
          />
        </CelestialBackground>
      )}

      <div
        className={cn(
          'relative flex flex-col',
          fitViewport ? 'h-full min-h-0 overflow-hidden' : 'min-h-dvh lg:min-h-0',
        )}
        data-auth-form
      >
        <div className="relative shrink-0 bg-surface/90 pt-safe backdrop-blur-md lg:hidden">
          <div className="flex h-mobilebar items-center gap-2 border-b border-border px-3">
            {backTo && (
              <Link
                to={backTo}
                aria-label="Go back"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-control text-ink transition-colors hover:bg-navy-soft"
              >
                <ChevronLeft className="size-5" />
              </Link>
            )}
            <Logo size="sm" className={backTo ? '' : 'pl-1'} />
          </div>

          {steps && (
            <div className="border-b border-border px-5 pb-5 pt-5">
              <ProgressIndicator steps={steps} current={currentStep} variant="bar" />
            </div>
          )}
        </div>

        <div
          className={cn(
            'relative flex min-h-0 flex-1 flex-col px-5 md:px-8 lg:justify-center lg:px-12 xl:px-16',
            fitViewport
              ? 'overflow-y-auto overscroll-contain no-scrollbar py-5 lg:py-6'
              : 'overflow-y-auto overscroll-contain py-8 lg:overflow-visible lg:py-12',
          )}
        >
          <div
            className={cn(
              'auth-flow-enter mx-auto w-full',
              wide ? 'max-w-4xl' : 'max-w-md',
              fitViewport && 'flex min-h-0 flex-1 flex-col lg:flex-none lg:justify-center',
              !fitViewport && 'my-auto',
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
