import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface AccountSectionProps {
  id: string
  title: string
  description?: string
  /** Right-aligned control in the header, usually an edit button. */
  action?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * One settings area.
 *
 * Deliberately a titled section on a card, not a row of toggles on grey — the
 * account is where the chart is edited, and it should read like part of the
 * product rather than a preferences pane bolted onto it.
 */
export function AccountSection({
  id,
  title,
  description,
  action,
  children,
  className,
}: AccountSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn('scroll-mt-24 space-y-4', className)}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="text-heading font-semibold text-ink lg:text-title">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-muted text-pretty">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>

      {children}
    </section>
  )
}

export interface DetailRowProps {
  label: string
  value: ReactNode
  /** Second line under the value, for coordinates or a caveat. */
  note?: ReactNode
  className?: string
}

/** One labelled fact. The shape every read-only value in Account uses. */
export function DetailRow({ label, value, note, className }: DetailRowProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 p-4 sm:flex-row sm:items-baseline sm:gap-6',
        className,
      )}
    >
      <dt className="shrink-0 font-mono text-label uppercase text-muted sm:w-36">{label}</dt>
      <dd className="min-w-0 flex-1">
        <span className="block text-sub text-ink text-pretty">{value}</span>
        {note && <span className="mt-0.5 block font-mono text-label uppercase text-muted">{note}</span>}
      </dd>
    </div>
  )
}

/** A group of `DetailRow`s, hairlined. */
export function DetailList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <dl className={cn('divide-y divide-border overflow-hidden rounded-card border border-border bg-surface', className)}>
      {children}
    </dl>
  )
}
