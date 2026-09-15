import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { AstroMetadata } from '@/components/celestial/AstroMetadata'
import { CelestialBackground } from '@/components/celestial/CelestialBackground'
import { ProgressIndicator, type ProgressStep } from '@/components/common/ProgressIndicator'
import { cn } from '@/utils/cn'

export interface AuthLayoutProps {
  children: ReactNode
  /** Flow steps. Omit where there is no progress to show. */
  steps?: ProgressStep[]
  currentStep?: number
  /** Fills the desktop left panel so auth is never a form on blank ground. */
  panelTitle?: string
  panelBody?: ReactNode
  /** Renders a back control in the mobile bar. */
  backTo?: string
  /** Widen the form column — birth details carries a preview beside it. */
  wide?: boolean
  /** Lock the shell to the viewport — no page scroll (birth details). */
  fitViewport?: boolean
  className?: string
}

/**
 * The signed-out shell. On desktop a celestial panel carries the progress and
 * the reason we are asking — the same night sky as the landing hero, so the
 * flow does not drop its identity the moment a form appears. On mobile that
 * collapses to a compact bar with a back control and one progress line above
 * the form.
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
  className,
}: AuthLayoutProps) {
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
          motifs={['stars', 'zodiac']}
          tone="midnight"
          seed="auth"
          className="hidden lg:block"
          contentClassName={cn(
            'flex h-full flex-col justify-between p-10 xl:p-12',
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
              <ProgressIndicator steps={steps} current={currentStep} variant="list" tone="dark" />
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
          'flex flex-col',
          fitViewport ? 'h-full min-h-0 overflow-hidden' : 'min-h-dvh lg:min-h-0',
        )}
      >
        {/* Mobile bar: back control on the left, progress underneath. */}
        <div className="shrink-0 bg-surface pt-safe lg:hidden">
          <div className="flex h-mobilebar items-center gap-2 border-b border-border px-3">
            {backTo && (
              <Link
                to={backTo}
                aria-label="Go back"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-control text-ink hover:bg-navy-soft"
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
            'flex min-h-0 flex-1 flex-col px-5 md:px-8 lg:justify-center lg:px-12 xl:px-16',
            fitViewport
              ? 'overflow-y-auto overscroll-contain no-scrollbar py-5 lg:py-6'
              : 'overflow-y-auto overscroll-contain py-8 lg:overflow-visible lg:py-12',
          )}
        >
          <div
            className={cn(
              'mx-auto w-full animate-fade-in',
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
