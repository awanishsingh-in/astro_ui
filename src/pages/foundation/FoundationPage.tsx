import { Bell, Compass, Download, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  ChipGroup,
  DataTable,
  Divider,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  Input,
  LoadingState,
  Logo,
  ProgressIndicator,
  SectionHeader,
  Select,
  Skeleton,
  TabPanel,
  Tabs,
} from '@/components'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import { Modal } from '@/components/modals/Modal'
import { ChartDiamond } from '@/components/charts/ChartDiamond'
import { ChartWheel } from '@/components/charts/ChartWheel'
import { PremiumChartWheel } from '@/components/charts/PremiumChartWheel'
import { PlanetBadge } from '@/components/astrology/PlanetBadge'
import {
  AstroMetadata,
  CelestialCard,
  ZodiacBadge,
  ZodiacChip,
  ZodiacOrbit,
} from '@/components/celestial'
import { HouseCard } from '@/components/astrology/HouseCard'
import { PlanetRow } from '@/components/astrology/PlanetRow'
import { ChartSource } from '@/components/reading-parts/ChartSource'
import { KeyPoints } from '@/components/reading-parts/KeyPoints'
import { ReadingReason } from '@/components/reading-parts/ReadingReason'
import { ReadingVerdict } from '@/components/reading-parts/ReadingVerdict'
import { QuestionCard } from '@/components/readings/QuestionCard'
import { ReadingCard } from '@/components/readings/ReadingCard'
import { useTabs } from '@/components/common/Tabs'
import { Textarea } from '@/components/forms/Textarea'
import { SkeletonCard, SkeletonList, SkeletonTable } from '@/components/common/Skeleton'
import { AvatarMenu } from '@/components/navigation/AvatarMenu'
import { useToast } from '@/components/feedback/toast-context'
import { useAuth } from '@/auth/auth-context'
import { primaryNav, desktopNav } from '@/routes/navigation'
import { DataLayerDemo } from './DataLayerDemo'
import { useDisclosure } from '@/hooks/useDisclosure'
import { PageContainer } from '@/layouts/PageContainer'
import { rashiChart } from '@/data/chart'
import { readings, suggestedQuestions } from '@/data/readings'
import { mockUser } from '@/data/user'
import { primaryVargas } from '@/data/vargas'
import type { GrahaPosition } from '@/types/astrology'
import { dignityLabel, dignityToneClass } from '@/utils/astro'
import { cn } from '@/utils/cn'
import { DegreeValue } from '@/components/astrology/DegreeValue'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'

/**
 * The living design system.
 *
 * Every token and component renders here, so a change to the foundation is
 * visible in one place before it reaches a product screen. Development only —
 * it is not linked from the app chrome.
 */
export default function FoundationPage() {
  const toast = useToast()
  const { user, resetDemo } = useAuth()
  const sheet = useDisclosure()
  const modal = useDisclosure()
  const tabs = useTabs('grahas')
  const [varga, setVarga] = useState('D1')
  const [activeBhava, setActiveBhava] = useState<number | undefined>(10)

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-20 border-b border-border bg-surface">
        <PageContainer width="wide" flush className="flex h-topnav items-center justify-between">
          <Logo size="md" />
          <Badge tone="gold" mono>
            Foundation
          </Badge>
        </PageContainer>
      </header>

      <PageContainer width="wide" className="space-y-16 pb-24">
        <SectionHeader
          eyebrow="Cyklos design system"
          title="Foundation"
          description="Tokens, primitives and product components. Everything a screen is assembled from."
          as="h1"
          size="lg"
        />

        {/* ── Demo state ─────────────────────────────────────────── */}
        <Section
          title="Demo state"
          note="Accounts live in localStorage. Clearing them replays the signup flow from the landing screen."
        >
          <Card padding="lg" className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-label uppercase text-muted">Signed in as</p>
              <p className="mt-1 text-sub text-ink">
                {user ? `${user.fullName} · ${user.phone}` : 'Nobody — signed out'}
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                resetDemo()
                toast.success('Demo reset', {
                  description: 'Stored accounts cleared. Signup starts fresh.',
                })
              }}
            >
              Clear stored accounts
            </Button>
          </Card>
        </Section>

        {/* ── Data layer ─────────────────────────────────────────── */}
        <Section
          title="Data layer"
          note="Every screen reads through a service. Swap the mock for fetch and nothing above it changes."
        >
          <DataLayerDemo />
        </Section>

        {/* ── Colour ─────────────────────────────────────────────── */}
        <Section
          title="Colour"
          note="Midnight through royal indigo carry the celestial surfaces; ivory and warm white carry everything read at length. Gold marks selection, chart geometry and small emphases — it is never the dominant colour on a screen."
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {SWATCHES.map((swatch) => (
              <Swatch key={swatch.token} {...swatch} />
            ))}
          </div>
        </Section>

        {/* ── Typography ─────────────────────────────────────────── */}
        <Section
          title="Typography"
          note="Manrope for UI, IBM Plex Mono for chart data, Cormorant Garamond for the wordmark and display headings."
        >
          <Card padding="lg" className="gap-5">
            <p className="text-display-lg font-semibold text-ink">Display · 48 / 34</p>
            <p className="text-title-lg font-semibold text-ink">Title large · 28</p>
            <p className="text-title font-semibold text-ink">Title · 22</p>
            <p className="text-heading font-semibold text-ink">Heading · 17</p>
            <p className="text-body text-purple">
              Body · 15.5. Ask a question. Get an answer calculated from your birth chart.
            </p>
            <p className="text-sub text-muted">Sub · 14.5. Secondary prose and helper copy.</p>
            <p className="text-sm text-muted">Small · 13. Timestamps and metadata.</p>
            <p className="font-mono text-label uppercase text-muted">Label · 10.5 mono, tracked</p>
            <p className="font-mono text-data text-purple">
              Data · 12.5 mono — 20°41′ · 02 Sep 1994 · bh 10
            </p>
          </Card>
        </Section>

        {/* ── Buttons ────────────────────────────────────────────── */}
        <Section title="Buttons" note="Five variants, three sizes, loading and disabled states.">
          <Card padding="lg" className="gap-5">
            <Row label="Variants">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="gold">Gold</Button>
              <Button variant="danger">Danger</Button>
            </Row>
            <Row label="Sizes">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </Row>
            <Row label="States">
              <Button loading>Calculating</Button>
              <Button disabled>Disabled</Button>
              <Button iconLeft={<Plus className="size-4" />}>With icon</Button>
            </Row>
            <Row label="Icon buttons">
              <IconButton label="Search" icon={<Search />} />
              <IconButton label="Notifications" icon={<Bell />} variant="outline" />
              <IconButton label="Export" icon={<Download />} variant="filled" />
            </Row>
          </Card>
        </Section>

        {/* ── Forms ──────────────────────────────────────────────── */}
        <Section
          title="Forms"
          note="56px controls, labels above, helper text below, one field per row."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Card padding="lg" className="gap-5">
              <Field label="Mobile number" help="No password — you sign in with a code each time.">
                <Input prefix="+91" mono placeholder="98765 43210" inputMode="tel" />
              </Field>
              <Field label="Time of birth" help="As written on your birth record">
                <Input mono defaultValue="06:40 AM" />
              </Field>
            </Card>
            <Card padding="lg" className="gap-5">
              <Field label="Language">
                <Select
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'hi', label: 'हिन्दी' },
                  ]}
                  defaultValue="en"
                />
              </Field>
              <Field label="Birth place" error="Pick the nearest listed town.">
                <Input defaultValue="Bilaspur" />
              </Field>
            </Card>
            <Card padding="lg" className="gap-5">
              <Field label="Sizes" help="lg is the form default; md and sm suit toolbars.">
                <div className="space-y-2.5">
                  <Input inputSize="lg" placeholder="Large · 56px" />
                  <Input inputSize="md" placeholder="Medium · 48px" />
                  <Input
                    inputSize="sm"
                    tone="sunken"
                    icon={<Search />}
                    placeholder="Small · search your readings"
                  />
                </div>
              </Field>
            </Card>
            <Card padding="lg" className="gap-5">
              <Field label="Textarea" help="Shares the border and focus ring of Input.">
                <Textarea placeholder="Ask a question in your own words…" />
              </Field>
            </Card>
          </div>
        </Section>

        {/* ── Selection ──────────────────────────────────────────── */}
        <Section
          title="Chips and tabs"
          note="Chips switch the varga; tabs switch the chart section."
        >
          <Card padding="lg" className="gap-6" style={{ ['--rail-bleed' as string]: '20px' }}>
            <ChipGroup label="Divisional chart">
              {primaryVargas.map((v) => (
                <Chip
                  key={v.code}
                  mono
                  selected={varga === v.code}
                  onClick={() => setVarga(v.code)}
                >
                  {v.code.replace('D', 'D-')} {v.name}
                </Chip>
              ))}
              <Chip onClick={sheet.open}>All 16 ⌄</Chip>
            </ChipGroup>

            <Tabs
              label="Chart sections"
              controller={tabs}
              items={[
                { id: 'grahas', label: 'Grahas', count: 9 },
                { id: 'bhavas', label: 'Bhavas', count: 12 },
                { id: 'drishti', label: 'Drishti' },
                { id: 'dasha', label: 'Dasha' },
                { id: 'sav', label: 'Ashtakavarga' },
              ]}
            />

            <TabPanel controller={tabs} id="grahas">
              <DataTable
                caption="Graha positions"
                rows={rashiChart.grahas}
                rowKey={(row) => row.graha}
                isRowActive={(row) => row.bhava === activeBhava}
                columns={GRAHA_COLUMNS}
              />
            </TabPanel>
            <TabPanel controller={tabs} id="bhavas">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {rashiChart.bhavas.slice(0, 3).map((b) => (
                  <HouseCard
                    key={b.bhava}
                    placement={b}
                    active={b.bhava === activeBhava}
                    onClick={() => setActiveBhava(b.bhava)}
                  />
                ))}
              </div>
            </TabPanel>
            <TabPanel controller={tabs} id="drishti">
              <p className="py-6 text-sub text-muted">Drishti table renders here.</p>
            </TabPanel>
            <TabPanel controller={tabs} id="dasha">
              <p className="py-6 text-sub text-muted">Dasha table renders here.</p>
            </TabPanel>
            <TabPanel controller={tabs} id="sav">
              <p className="py-6 text-sub text-muted">Ashtakavarga renders here.</p>
            </TabPanel>
          </Card>
        </Section>

        {/* ── Charts ─────────────────────────────────────────────── */}
        <Section
          title="Chart visualisations"
          note="Wheel, North Indian diamond, and the diamond as a Readings index."
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Card padding="lg" className="gap-4">
              <p className="font-mono text-label uppercase text-muted">ChartWheel</p>
              <ChartWheel
                chart={rashiChart}
                activeBhava={activeBhava}
                onBhavaClick={setActiveBhava}
              />
            </Card>
            <CelestialCard motifs={['stars']} tone="midnight" seed="fdn-wheel" padding="lg">
              <p className="font-mono text-label uppercase text-gold-soft-line">
                PremiumChartWheel · dark
              </p>
              <PremiumChartWheel
                chart={rashiChart}
                tone="dark"
                activeBhava={activeBhava}
                onBhavaClick={setActiveBhava}
                className="mt-3"
              />
            </CelestialCard>
            <Card padding="lg" className="gap-4">
              <p className="font-mono text-label uppercase text-muted">ChartDiamond</p>
              <ChartDiamond
                chart={rashiChart}
                activeBhava={activeBhava}
                onBhavaClick={setActiveBhava}
              />
            </Card>
            <Card padding="lg" className="gap-4">
              <p className="font-mono text-label uppercase text-muted">Diamond as index</p>
              <ChartDiamond
                chart={rashiChart}
                activeBhava={activeBhava}
                onBhavaClick={setActiveBhava}
                countsByBhava={{ 10: 4, 2: 1, 3: 1, 7: 1 }}
                centerLabel="TAP A BHAVA"
                centerSubLabel="7 READINGS"
              />
            </Card>
          </div>
        </Section>

        {/* ── The celestial layer ────────────────────────────────── */}
        <Section
          title="Celestial layer"
          note="The dark surfaces and the geometry that carries the brand. Backgrounds stay between 5% and 15% — atmosphere, never a space scene."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <CelestialCard motifs={['stars', 'orbits']} tone="midnight" seed="fdn-a" padding="lg">
              <p className="font-mono text-label uppercase text-gold-soft-line">
                CelestialCard · stars + orbits
              </p>
              <p className="mt-2 text-sub text-on-celestial text-pretty">
                Used where a screen is genuinely about the sky: the hero, the calculating screen,
                the chart panel, the source of a reading.
              </p>
              <AstroMetadata
                tone="dark"
                className="mt-4"
                items={[
                  { label: 'Zodiac', value: 'Sidereal' },
                  { label: 'Ayanamsa', value: 'Lahiri' },
                ]}
              />
            </CelestialCard>

            <CelestialCard motifs={['stars']} tone="indigo" seed="fdn-b" padding="lg">
              <p className="font-mono text-label uppercase text-gold-soft-line">
                PlanetBadge · dark
              </p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
                <PlanetBadge code="Ju" detail="bh 10" tone="dark" active />
                <PlanetBadge code="Sa" detail="bh 3" tone="dark" />
                <PlanetBadge code="Ra" detail="bh 12" tone="dark" />
              </div>
            </CelestialCard>

            <Card padding="lg" className="gap-4">
              <p className="font-mono text-label uppercase text-muted">ZodiacBadge · ZodiacChip</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <ZodiacBadge rashi="Tula" withEnglish />
                <ZodiacBadge rashi="Makara" size="sm" />
              </div>
              <div className="flex flex-wrap gap-2">
                <ZodiacChip rashi="Mesha" selected />
                <ZodiacChip rashi="Simha" />
                <ZodiacChip rashi="Meena" size="sm" />
              </div>
            </Card>

            <CelestialCard motifs={[]} tone="indigo" seed="fdn-c" padding="lg">
              <p className="font-mono text-label uppercase text-gold-soft-line">ZodiacOrbit</p>
              <ZodiacOrbit tone="dark" className="mx-auto mt-3 max-w-[260px]" />
            </CelestialCard>
          </div>
        </Section>

        {/* ── Astrology primitives ───────────────────────────────── */}
        <Section
          title="Astrology primitives"
          note="A graha is named and coloured identically everywhere it appears."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <Card padding="lg" className="gap-4">
              <p className="font-mono text-label uppercase text-muted">PlanetRow</p>
              <div>
                {rashiChart.grahas.slice(0, 4).map((p) => (
                  <PlanetRow key={p.graha} position={p} detailed />
                ))}
              </div>
            </Card>
            <Card padding="lg" className="gap-4">
              <p className="font-mono text-label uppercase text-muted">HouseCard</p>
              <HouseCard placement={rashiChart.bhavas[9]} readingCount={4} active />
            </Card>
          </div>
        </Section>

        {/* ── Readings ───────────────────────────────────────────── */}
        <Section
          title="Readings"
          note="An answer always has the same five parts, and always names its source."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="font-mono text-label uppercase text-muted">
                ReadingCard · QuestionCard
              </p>
              {readings.slice(0, 2).map((r) => (
                <ReadingCard key={r.id} reading={r} />
              ))}
              {suggestedQuestions.slice(0, 2).map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  onSelect={(picked) =>
                    toast.info('Question selected', { description: picked.text })
                  }
                />
              ))}
            </div>
            <Card padding="lg" className="gap-4">
              <p className="font-mono text-label uppercase text-muted">Reading parts</p>
              {/* The same parts the Ask answer and a saved reading render. */}
              <ReadingVerdict
                verdict={readings[0].answer.verdict}
                window={readings[0].answer.window}
              />
              <ReadingReason reason={readings[0].answer.reason} />
              <KeyPoints points={readings[0].answer.points} variant="list" />
              <ChartSource answer={readings[0].answer} withChartLink={false} />
            </Card>
          </div>
        </Section>

        {/* ── States ─────────────────────────────────────────────── */}
        <Section
          title="States"
          note="Every async surface renders loading, empty and error — not just the happy path."
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Card padding="lg">
              <LoadingState label="Reading your tenth house…" variant="skeleton" />
            </Card>
            <Card padding="lg" className="items-center justify-center">
              <LoadingState
                label="Calculating your chart…"
                variant="calculating"
                className="py-4"
              />
            </Card>
            <Card padding="none">
              <EmptyState
                variant="inline"
                icon={<Compass />}
                title="No readings yet"
                description="Ask a question and it will sit under the bhava it was read from."
              />
            </Card>
            <Card padding="none">
              <ErrorState
                variant="inline"
                error={{ message: 'Could not reach the server.', code: 'NETWORK', retryable: true }}
                onRetry={() =>
                  toast.success('Retried', { description: 'The request was sent again.' })
                }
              />
            </Card>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <Card padding="lg" className="gap-3">
              <p className="font-mono text-label uppercase text-muted">Skeleton · block</p>
              <Skeleton className="h-20 w-full" shape="block" />
              <SkeletonCard withAvatar />
            </Card>
            <Card padding="lg" className="gap-3">
              <p className="font-mono text-label uppercase text-muted">SkeletonList</p>
              <SkeletonList count={2} />
            </Card>
            <Card padding="lg" className="gap-3">
              <p className="font-mono text-label uppercase text-muted">SkeletonTable</p>
              <SkeletonTable rows={4} columns={4} />
            </Card>
          </div>
        </Section>

        {/* ── Navigation ─────────────────────────────────────────── */}
        <Section
          title="Navigation"
          note="One list of destinations, two chromes. The bottom bar is mobile-only; the top nav is desktop-only."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <Card padding="lg" className="flex flex-col gap-4">
              <p className="font-mono text-label uppercase text-muted">Bottom nav · below 1024px</p>
              <ul className="flex overflow-hidden rounded-card border border-border bg-surface">
                {primaryNav.map((item, index) => (
                  <li key={item.id} className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'relative flex h-bottomnav flex-col items-center justify-center gap-1 px-0.5',
                        '[&_svg]:size-5',
                        index === 0 ? 'text-navy' : 'text-muted',
                      )}
                    >
                      {index === 0 && (
                        <span
                          aria-hidden
                          className="absolute inset-x-[30%] top-0 h-0.5 rounded-full bg-gold"
                        />
                      )}
                      {item.icon}
                      <span
                        className={cn(
                          'w-full truncate text-center text-[10.5px] leading-none',
                          index === 0 ? 'font-semibold' : 'font-medium',
                        )}
                      >
                        {item.label}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted">
                Five destinations: {primaryNav.map((i) => i.label).join(' · ')}.
              </p>
            </Card>

            <Card padding="lg" className="flex flex-col gap-4">
              <p className="font-mono text-label uppercase text-muted">Top nav · 1024px and up</p>
              {/*
                A preview of desktop chrome. Below ~420px it cannot fit
                literally, so it scrolls inside its card rather than pushing
                the page sideways.
              */}
              <div className="no-scrollbar min-w-0 overflow-x-auto rounded-card border border-border bg-surface">
                <div className="flex min-w-max items-center justify-between gap-6 px-4 py-3">
                  <div className="flex items-center gap-6">
                    <Logo size="sm" />
                    <ul className="flex items-center gap-5">
                      {desktopNav.map((item, index) => (
                        <li key={item.id}>
                          <span
                            className={cn(
                              'inline-block border-b-2 pb-1 text-sm',
                              index === 0
                                ? 'border-gold font-semibold text-ink'
                                : 'border-transparent font-medium text-purple',
                            )}
                          >
                            {item.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <AvatarMenu user={mockUser} />
                </div>
              </div>
              <p className="text-sm text-muted">
                Profile leaves the bar and moves under the avatar — open it, it works.
              </p>
            </Card>
          </div>
        </Section>

        {/* ── Toast ──────────────────────────────────────────────── */}
        <Section
          title="Toast"
          note="Transient feedback. Four tones, auto-dismiss, pause on hover, and an optional single action."
        >
          <Card padding="lg" className="flex flex-col gap-5">
            <Row label="Tones">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  toast.info('Chart recalculated', {
                    description: 'Lahiri ayanamsa · equal bhava.',
                  })
                }
              >
                Info
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toast.success('Birth details saved')}
              >
                Success
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  toast.caution('Birth time is approximate', {
                    description: 'Houses may shift. Add an exact time for a firmer reading.',
                  })
                }
              >
                Caution
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  toast.error('Could not reach the server', {
                    description: 'Check your connection.',
                  })
                }
              >
                Error
              </Button>
            </Row>
            <Row label="With action">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  toast.toast({
                    tone: 'caution',
                    message: 'Reading removed',
                    duration: 8000,
                    action: { label: 'Undo', onClick: () => toast.success('Reading restored') },
                  })
                }
              >
                Undoable
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toast.toast({ message: 'Pinned until dismissed', duration: 0 })}
              >
                Persistent
              </Button>
              <Button variant="ghost" size="sm" onClick={toast.dismissAll}>
                Dismiss all
              </Button>
            </Row>
          </Card>
        </Section>

        {/* ── Surfaces and overlays ──────────────────────────────── */}
        <Section
          title="Surfaces, badges and overlays"
          note="Sheets on mobile, modals on desktop. One scrim, one focus trap."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <Card padding="lg" className="gap-5">
              <Row label="Badges">
                <Badge>Neutral</Badge>
                <Badge tone="navy">Navy</Badge>
                <Badge tone="gold" mono>
                  Now
                </Badge>
                <Badge tone="positive">Own sign</Badge>
                <Badge tone="critical">Debilitated</Badge>
              </Row>
              <Row label="Avatars">
                <Avatar name={mockUser.fullName} size="sm" />
                <Avatar name={mockUser.fullName} size="md" />
                <Avatar name={mockUser.fullName} size="lg" />
              </Row>
              <Row label="Overlays">
                <Button variant="secondary" size="sm" onClick={sheet.open}>
                  Open sheet
                </Button>
                <Button variant="secondary" size="sm" onClick={modal.open}>
                  Open modal
                </Button>
              </Row>
              <Divider label="Earlier" />
              <Row label="Progress">
                <ProgressIndicator
                  className="w-full"
                  steps={[
                    { id: '1', label: 'Number' },
                    { id: '2', label: 'Code' },
                    { id: '3', label: 'Birth details' },
                  ]}
                  current={1}
                />
              </Row>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2">
              <Card tone="gold" padding="lg" className="gap-2">
                <p className="font-mono text-label uppercase text-gold-deep">gold</p>
                <p className="text-sm text-purple">Citations and the selected state.</p>
              </Card>
              <Card tone="default" padding="lg" className="gap-2">
                <p className="font-mono text-label uppercase text-muted">default</p>
                <p className="text-sm text-purple">Border plus the one subtle shadow.</p>
              </Card>
              <Card tone="outline" padding="lg" className="gap-2">
                <p className="font-mono text-label uppercase text-muted">outline</p>
                <p className="text-sm text-purple">No shadow — nested inside another surface.</p>
              </Card>
              <Card tone="sunken" padding="lg" className="gap-2">
                <p className="font-mono text-label uppercase text-muted">sunken</p>
                <p className="text-sm text-purple">Inset fills and tracks.</p>
              </Card>
              <Card tone="elevated" padding="lg" className="gap-2 sm:col-span-2">
                <p className="font-mono text-label uppercase text-muted">elevated</p>
                <p className="text-sm text-purple">The one lifted surface, for a floating panel.</p>
              </Card>
            </div>
          </div>
        </Section>
      </PageContainer>

      <BottomSheet
        isOpen={sheet.isOpen}
        onClose={sheet.close}
        title="Choose a chart"
        description="Used most, then all sixteen divisional charts."
      >
        <div className="space-y-2">
          {primaryVargas.map((v) => (
            <button
              key={v.code}
              type="button"
              onClick={() => {
                setVarga(v.code)
                sheet.close()
              }}
              className="flex w-full items-center justify-between gap-3 rounded-card border border-border p-4 text-left hover:bg-navy-soft"
            >
              <span>
                <span className="block font-mono text-data text-ink">
                  {v.code.replace('D', 'D-')} {v.name}
                </span>
                <span className="block text-sm text-muted">{v.signifies}</span>
              </span>
              {varga === v.code && (
                <Badge tone="gold" mono>
                  On
                </Badge>
              )}
            </button>
          ))}
        </div>
      </BottomSheet>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="How this chart was calculated"
        description="Nothing here is estimated — if a value cannot be established, the app says so."
        footer={
          <Button size="md" onClick={modal.close}>
            Done
          </Button>
        }
      >
        <dl className="space-y-3">
          {[
            ['Ephemeris', 'Swiss Ephemeris · DE431'],
            ['Zodiac', 'Sidereal — nirayana'],
            ['Ayanamsa', 'Lahiri (Chitrapaksha) — 23°46′09″'],
            ['House system', 'Equal bhava, from the lagna degree'],
          ].map(([term, value]) => (
            <div
              key={term}
              className="flex justify-between gap-6 border-b border-border pb-3 last:border-b-0"
            >
              <dt className="font-mono text-label uppercase text-muted">{term}</dt>
              <dd className="text-right text-sm text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </Modal>
    </div>
  )
}

const GRAHA_COLUMNS = [
  {
    id: 'graha',
    header: 'Gr',
    render: (row: GrahaPosition) => <PlanetGlyph code={row.graha} withCode size="sm" />,
  },
  { id: 'rashi', header: 'Rashi', render: (row: GrahaPosition) => row.rashi },
  {
    id: 'degree',
    header: 'Degree',
    align: 'right' as const,
    render: (row: GrahaPosition) => (
      <DegreeValue degree={row.degree} minute={row.minute} motion={row.motion} />
    ),
  },
  {
    id: 'nakshatra',
    header: 'Nakshatra · pada',
    hideBelow: 'md' as const,
    render: (row: GrahaPosition) => (
      <span className="font-mono text-data text-purple">
        {row.nakshatra.name} · {row.nakshatra.pada}
      </span>
    ),
  },
  {
    id: 'bhava',
    header: 'Bh',
    align: 'right' as const,
    render: (row: GrahaPosition) => <span className="font-mono text-data">{row.bhava}</span>,
  },
  {
    id: 'dignity',
    header: 'Dignity',
    hideBelow: 'lg' as const,
    render: (row: GrahaPosition) => (
      <span className={dignityToneClass(row.dignity)}>{dignityLabel(row.dignity)}</span>
    ),
  },
]

const SWATCHES = [
  // Celestial — whole sections, not accents.
  { token: 'midnight', label: 'Midnight', className: 'bg-midnight', hex: '#080711' },
  { token: 'indigo-deep', label: 'Indigo deep', className: 'bg-indigo-deep', hex: '#111022' },
  { token: 'navy', label: 'Soft lavender', className: 'bg-navy', hex: '#8E82D8' },
  { token: 'indigo-royal', label: 'Royal indigo', className: 'bg-indigo-royal', hex: '#181633' },
  // Gold — highlights, active states, chart geometry. Never dominant.
  { token: 'gold', label: 'Astro gold', className: 'bg-gold', hex: '#C9A96E' },
  { token: 'gold-soft-line', label: 'Soft gold', className: 'bg-gold-soft-line', hex: '#D4B87A' },
  { token: 'gold-deep', label: 'Gold deep', className: 'bg-gold-deep', hex: '#C9A96E' },
  {
    token: 'gold-soft',
    label: 'Gold soft',
    className: 'bg-gold-soft border border-gold-border',
    hex: '#2A2414',
  },
  // Text, on midnight.
  { token: 'ink', label: 'Ink', className: 'bg-ink', hex: '#F5F2FF' },
  { token: 'purple', label: 'Lavender', className: 'bg-purple', hex: '#B6B1CE' },
  { token: 'muted', label: 'Muted', className: 'bg-muted', hex: '#77728F' },
  { token: 'faint', label: 'Faint', className: 'bg-faint', hex: '#5C5774' },
  // Night paper.
  { token: 'canvas', label: 'Canvas', className: 'bg-canvas border border-border', hex: '#080711' },
  {
    token: 'surface',
    label: 'Surface',
    className: 'bg-surface border border-border',
    hex: '#14132A',
  },
  {
    token: 'navy-soft',
    label: 'Navy soft',
    className: 'bg-navy-soft border border-border',
    hex: '#1E1B38',
  },
  { token: 'border', label: 'Border', className: 'bg-border', hex: '#2E2A4A' },
]

function Swatch({ label, className, hex }: { label: string; className: string; hex: string }) {
  return (
    <div className="space-y-2">
      <div className={`h-16 rounded-card ${className}`} />
      <p className="text-sm font-medium text-ink">{label}</p>
      <p className="font-mono text-label uppercase text-muted">{hex}</p>
    </div>
  )
}

function Section({
  title,
  note,
  children,
}: {
  title: string
  note: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-5">
      <SectionHeader title={title} description={note} />
      {children}
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="w-full font-mono text-label uppercase text-muted sm:w-28">{label}</span>
      {children}
    </div>
  )
}
