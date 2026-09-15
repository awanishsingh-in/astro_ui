import { cn } from '@/utils/cn'

export interface AstroMetadataItem {
  label: string
  value: string
}

export interface AstroMetadataProps {
  items: AstroMetadataItem[]
  tone?: 'light' | 'dark'
  /** Stacked reads better in a narrow column; inline in a wide strip. */
  layout?: 'inline' | 'stacked'
  className?: string
}

/**
 * The astronomical footnote: ayanamsa, coordinates, house system, sidereal
 * time — the values that make a chart checkable.
 *
 * Set in mono at label size, because these are instrument readings rather than
 * prose. Showing them is what separates an astronomy-grade product from a
 * fortune-teller: the working is on the page.
 */
export function AstroMetadata({
  items,
  tone = 'light',
  layout = 'inline',
  className,
}: AstroMetadataProps) {
  const label = tone === 'dark' ? 'text-on-celestial-faint' : 'text-muted'
  const value = tone === 'dark' ? 'text-on-celestial-muted' : 'text-purple'
  const rule = tone === 'dark' ? 'bg-celestial-line' : 'bg-border'

  return (
    <dl
      className={cn(
        'min-w-0',
        layout === 'inline' ? 'flex flex-wrap items-center gap-x-3 gap-y-1.5' : 'grid gap-1.5',
        className,
      )}
    >
      {items.map((item, i) => (
        <div
          key={item.label}
          className={cn(
            'flex min-w-0 items-baseline gap-1.5',
            layout === 'inline' ? 'gap-1.5' : 'justify-between gap-4',
          )}
        >
          <dt className={cn('font-mono text-label whitespace-nowrap uppercase', label)}>
            {item.label}
          </dt>
          <dd className={cn('min-w-0 truncate font-mono text-data', value)}>{item.value}</dd>
          {layout === 'inline' && i < items.length - 1 && (
            <span aria-hidden className={cn('ml-1.5 hidden h-3 w-px sm:block', rule)} />
          )}
        </div>
      ))}
    </dl>
  )
}
