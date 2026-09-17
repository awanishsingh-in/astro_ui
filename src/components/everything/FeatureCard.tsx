import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
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
 * One live capability — opens its detail page.
 */
export function FeatureCard({ feature, variant = 'row', className }: FeatureCardProps) {
  const { icon: Icon, glyph } = feature
  const tile = variant === 'tile'

  return (
    <Link
      to={paths.explore(feature.slug)}
      className={cn(
        'group flex w-full items-start gap-3 rounded-card border border-border bg-surface p-4 text-left shadow-card',
        'transition-[border-color,background-color,box-shadow] duration-150 ease-out-soft',
        'hover:border-border-strong hover:shadow-raised',
        tile && 'h-full',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'inline-flex shrink-0 items-center justify-center border border-gold-border bg-gold-soft text-gold-deep transition-colors duration-150 group-hover:border-gold',
          glyph ? 'rounded-full' : 'rounded-card',
          tile ? 'size-10' : 'size-9',
        )}
      >
        {glyph ? (
          <span className={tile ? 'text-lg leading-none' : 'text-base leading-none'}>{glyph}</span>
        ) : (
          <Icon className={tile ? 'size-5' : 'size-4'} />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sub font-medium text-ink">{feature.title}</span>
        <span className="mt-0.5 block text-sm text-muted text-pretty">{feature.description}</span>
      </span>

      <ArrowRight
        aria-hidden
        className="size-4 shrink-0 self-center text-faint transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </Link>
  )
}
