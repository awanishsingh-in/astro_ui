import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/common/Badge'
import type { Feature } from '@/data/features'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'

export interface FeatureCardProps {
  feature: Feature
  /** `row` is the compact mobile list; `tile` is the desktop grid. */
  variant?: 'row' | 'tile'
  className?: string
}

/**
 * One capability.
 *
 * An undecided feature renders as a `div`, not a disabled link — there is
 * nowhere for it to go, and a control that looks pressable but is not is worse
 * than one that plainly is not.
 */
export function FeatureCard({ feature, variant = 'row', className }: FeatureCardProps) {
  const { icon: Icon, glyph, status } = feature
  const tile = variant === 'tile'
  const interactive = status !== 'undecided'

  const inner = (
    <>
      {/*
        A round mark for anything astronomical, a square one for the rest:
        the shape itself sorts the chart features from the platform ones
        before a single label is read.
      */}
      <span
        aria-hidden
        className={cn(
          'inline-flex shrink-0 items-center justify-center border transition-colors duration-150',
          glyph ? 'rounded-full' : 'rounded-card',
          tile ? 'size-10' : 'size-9',
          status === 'undecided'
            ? 'border-border bg-surface-sunken text-faint'
            : 'border-gold-border bg-gold-soft text-gold-deep group-hover:border-gold',
        )}
      >
        {glyph ? (
          <span className={tile ? 'text-lg leading-none' : 'text-base leading-none'}>{glyph}</span>
        ) : (
          <Icon className={tile ? 'size-5' : 'size-4'} />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'text-sub font-medium',
              status === 'undecided' ? 'text-muted' : 'text-ink',
            )}
          >
            {feature.title}
          </span>
          {status === 'planned' && (
            <Badge tone="neutral" mono>
              Coming later
            </Badge>
          )}
          {status === 'undecided' && (
            <Badge tone="neutral" mono>
              Not decided
            </Badge>
          )}
        </span>
        <span className="mt-0.5 block text-sm text-muted text-pretty">{feature.description}</span>
      </span>

      {interactive && (
        <ArrowRight
          aria-hidden
          className="size-4 shrink-0 self-center text-faint transition-transform duration-200 group-hover:translate-x-0.5"
        />
      )}
    </>
  )

  const classes = cn(
    'group flex w-full items-start gap-3 rounded-card border p-4 text-left',
    'transition-[border-color,background-color,box-shadow] duration-150 ease-out-soft',
    tile && 'h-full',
    interactive
      ? 'border-border bg-surface shadow-card hover:border-border-strong hover:shadow-raised'
      : 'cursor-default border-dashed border-border bg-transparent',
    className,
  )

  if (!interactive) {
    return <div className={classes}>{inner}</div>
  }

  return (
    <Link to={feature.to ?? paths.explore(feature.slug)} className={classes}>
      {inner}
    </Link>
  )
}
