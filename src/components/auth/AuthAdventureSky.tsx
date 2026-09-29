import './AuthAdventureSky.css'

import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { cn } from '@/utils/cn'

/**
 * Animated left panel for phone / code auth — cyan planet, purple moons,
 * shooting stars. Logo sits on a clear plate so it stays readable.
 */
export function AuthAdventureSky({
  headline = 'Your journey',
  accent = 'begins here',
  className,
}: {
  headline?: string
  accent?: string
  className?: string
}) {
  return (
    <aside
      className={cn('auth-adventure-sky relative hidden min-h-dvh overflow-hidden lg:block', className)}
    >
      <div className="auth-adventure-sky__wash" aria-hidden />
      <div className="auth-adventure-sky__stars" aria-hidden />
      <div className="auth-adventure-sky__stars auth-adventure-sky__stars--drift" aria-hidden />
      <div className="auth-adventure-sky__nebula" aria-hidden />
      <div className="auth-adventure-sky__nebula auth-adventure-sky__nebula--alt" aria-hidden />

      <span className="auth-adventure-sky__streak auth-adventure-sky__streak--1" aria-hidden />
      <span className="auth-adventure-sky__streak auth-adventure-sky__streak--2" aria-hidden />
      <span className="auth-adventure-sky__streak auth-adventure-sky__streak--3" aria-hidden />
      <span className="auth-adventure-sky__streak auth-adventure-sky__streak--4" aria-hidden />
      <span className="auth-adventure-sky__streak auth-adventure-sky__streak--5" aria-hidden />
      <span className="auth-adventure-sky__streak auth-adventure-sky__streak--6" aria-hidden />

      <div className="auth-adventure-sky__orbit" aria-hidden>
        <span className="auth-adventure-sky__satellite auth-adventure-sky__satellite--1" />
        <span className="auth-adventure-sky__satellite auth-adventure-sky__satellite--2" />
        <span className="auth-adventure-sky__satellite auth-adventure-sky__satellite--3" />
      </div>

      <div className="auth-adventure-sky__planet auth-adventure-sky__planet--cyan" aria-hidden>
        <span className="auth-adventure-sky__glow" />
        <span className="auth-adventure-sky__ring auth-adventure-sky__ring--a" />
        <span className="auth-adventure-sky__ring auth-adventure-sky__ring--b" />
        <span className="auth-adventure-sky__band" />
      </div>

      <div className="auth-adventure-sky__planet auth-adventure-sky__planet--lavender" aria-hidden>
        <span className="auth-adventure-sky__crater auth-adventure-sky__crater--1" />
        <span className="auth-adventure-sky__crater auth-adventure-sky__crater--2" />
        <span className="auth-adventure-sky__crater auth-adventure-sky__crater--3" />
      </div>

      <div className="auth-adventure-sky__planet auth-adventure-sky__planet--violet" aria-hidden />

      <div className="relative z-20 flex h-full min-h-dvh flex-col justify-between p-10 xl:p-12">
        <div className="auth-adventure-sky__logo-zone">
          <Link to="/" aria-label="Cyklos home" className="auth-adventure-sky__logo w-fit">
            <Logo size="md" tone="dark" />
          </Link>
        </div>

        <h2 className="auth-adventure-sky__title max-w-sm font-sans text-4xl font-bold uppercase leading-[1.05] tracking-tight xl:text-5xl">
          <span className="auth-adventure-sky__headline block">{headline}</span>
          <span className="auth-adventure-sky__accent block">{accent}</span>
        </h2>
      </div>
    </aside>
  )
}

/** Compact animated strip for mobile auth headers. */
export function AuthAdventureSkyMobile({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'auth-adventure-sky auth-adventure-sky--mobile relative h-36 overflow-hidden sm:h-44',
        className,
      )}
      aria-hidden
    >
      <div className="auth-adventure-sky__wash" />
      <div className="auth-adventure-sky__stars" />
      <span className="auth-adventure-sky__streak auth-adventure-sky__streak--1" />
      <span className="auth-adventure-sky__streak auth-adventure-sky__streak--2" />
      <span className="auth-adventure-sky__streak auth-adventure-sky__streak--3" />
      <div className="auth-adventure-sky__planet auth-adventure-sky__planet--cyan auth-adventure-sky__planet--mobile" />
      <div className="auth-adventure-sky__planet auth-adventure-sky__planet--lavender auth-adventure-sky__planet--mobile-sm" />
    </div>
  )
}
