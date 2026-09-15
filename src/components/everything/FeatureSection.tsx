import { SectionHeader } from '@/components/common/SectionHeader'
import { FeatureCard } from '@/components/everything/FeatureCard'
import type { Feature } from '@/data/features'
import { cn } from '@/utils/cn'

export interface FeatureSectionProps {
  id: string
  title: string
  description: string
  features: Feature[]
  className?: string
}

/**
 * One group of capabilities.
 *
 * A grouped list on mobile and a grid from `md` up — the same cards, laid out
 * for the space rather than two different components.
 */
export function FeatureSection({
  id,
  title,
  description,
  features,
  className,
}: FeatureSectionProps) {
  return (
    <section aria-labelledby={`${id}-title`} className={cn('space-y-4', className)}>
      <SectionHeader
        as="h2"
        size="md"
        title={<span id={`${id}-title`}>{title}</span>}
        description={description}
      />

      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <li key={feature.slug}>
            <FeatureCard feature={feature} variant="tile" />
          </li>
        ))}
      </ul>
    </section>
  )
}
