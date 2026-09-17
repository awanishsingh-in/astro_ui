import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { IconButton } from '@/components/common/IconButton'
import { SectionHeader } from '@/components/common/SectionHeader'
import { CelestialCard } from '@/components/celestial/CelestialCard'
import { FeatureCard } from '@/components/everything/FeatureCard'
import { FeatureSection } from '@/components/everything/FeatureSection'
import { Input } from '@/components/forms/Input'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { useAuth } from '@/auth/auth-context'
import { liveFeatureGroups, liveFeatures } from '@/data/features'
import { PageContainer } from '@/layouts/PageContainer'
import { EmptyState } from '@/components/common/EmptyState'

/**
 * All features — live capabilities only, grouped the way the product is organised.
 */
export default function EverythingPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()

  const matches = useMemo(() => {
    if (!q) return null
    return liveFeatures.filter((feature) =>
      `${feature.title} ${feature.description}`.toLowerCase().includes(q),
    )
  }, [q])

  if (!user) return null

  return (
    <>
      <MobileHeader title="All features" user={user} />

      <PageContainer width="wide">
        <CelestialCard motifs={['stars', 'orbits']} tone="midnight" seed="everything" padding="lg">
          <SectionHeader
            as="h1"
            size="lg"
            className="max-lg:[&>div>h1]:sr-only [&_h1]:text-on-celestial [&_p]:text-on-celestial-muted"
            title="All features"
            description="Everything you can open in Cyklos today — charts, matching, horoscopes, and more."
          />

          <div className="mt-6 max-w-md">
            <Input
              inputSize="md"
              tone="sunken"
              icon={<Search />}
              type="search"
              placeholder="Search features"
              aria-label="Search features"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              suffix={
                query ? (
                  <IconButton
                    label="Clear search"
                    icon={<X />}
                    size="sm"
                    onClick={() => setQuery('')}
                    className="-mr-2"
                  />
                ) : undefined
              }
            />
          </div>
        </CelestialCard>

        {matches ? (
          <div className="mt-8">
            {matches.length === 0 ? (
              <EmptyState
                variant="inline"
                icon={<Search />}
                title="Nothing matches that"
                description={`No live feature mentions “${query.trim()}”. Try another word, or browse the groups below.`}
              />
            ) : (
              <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {matches.map((feature) => (
                  <li key={feature.slug}>
                    <FeatureCard feature={feature} variant="tile" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            {liveFeatureGroups.map((group) => (
              <FeatureSection
                key={group.id}
                id={group.id}
                title={group.title}
                description={group.description}
                features={group.features}
              />
            ))}
          </div>
        )}
      </PageContainer>
    </>
  )
}
