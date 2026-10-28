import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

/**
 * Matching pages — stronger glossy magenta / plum nebula wash over the global void.
 */
export function MatchThemeShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('match-theme-shell relative min-h-full', className)}>
      <div
        aria-hidden
        className="match-theme-wash pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 70% 55% at 85% 8%, rgba(232,90,173,0.58) 0%, rgba(155,45,110,0.3) 38%, transparent 68%),
              radial-gradient(ellipse 50% 45% at 12% 18%, rgba(217,74,154,0.38) 0%, transparent 62%),
              radial-gradient(ellipse 80% 50% at 50% 100%, rgba(74,21,64,0.75) 0%, transparent 70%),
              radial-gradient(ellipse 45% 40% at 70% 55%, rgba(155,45,110,0.28) 0%, transparent 65%),
              linear-gradient(180deg, rgba(36,18,48,0.6) 0%, transparent 45%, rgba(15,11,25,0.35) 100%)
            `,
          }}
        />
        <div
          className="absolute -right-24 top-[-8%] h-[55vmin] w-[55vmin] rounded-full opacity-95 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(232,90,173,0.55) 0%, rgba(155,45,110,0.28) 45%, transparent 70%)',
          }}
        />
        <div
          className="absolute -left-20 bottom-[5%] h-[42vmin] w-[42vmin] rounded-full opacity-85 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(155,45,110,0.5) 0%, rgba(74,21,64,0.3) 50%, transparent 72%)',
          }}
        />
      </div>
      {children}
    </div>
  )
}
