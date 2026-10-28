import { Moon, Sparkles, Star } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  GlowOrb,
  SectionHeader,
  Skeleton,
  SkeletonCard,
  StarfieldBackground,
  Tabs,
  useTabs,
} from '@/components'
import { Input } from '@/components/forms/Input'
import { Modal } from '@/components/modals/Modal'
import { PageContainer } from '@/layouts/PageContainer'
import { cn } from '@/utils/cn'

const COLOR_GROUPS = [
  {
    title: 'Backgrounds & surfaces',
    items: [
      { token: 'bg', hex: '#0F0B19', className: 'bg-bg' },
      { token: 'bg-secondary', hex: '#1B101D', className: 'bg-bg-secondary' },
      { token: 'surface-accent', hex: '#2E1623', className: 'bg-surface-accent' },
      { token: 'surface-mid', hex: '#44333C', className: 'bg-surface-mid' },
      { token: 'surface-high', hex: '#5C4750', className: 'bg-surface-high' },
      { token: 'card-tint', hex: '#5C4750', className: 'bg-card-tint' },
      { token: 'border', hex: '#7A6E74', className: 'bg-border' },
    ],
  },
  {
    title: 'Gold',
    items: [
      { token: 'primary', hex: '#BF8466', className: 'bg-primary' },
      { token: 'primary-hover', hex: '#E6BC9F', className: 'bg-primary-hover' },
      { token: 'primary-pressed', hex: '#6E4234', className: 'bg-primary-pressed' },
      { token: 'primary-soft', hex: '#F2D7C7', className: 'bg-primary-soft' },
      { token: 'brand-gold', hex: '#E6BC9F', className: 'bg-brand-gold' },
      { token: 'on-primary', hex: '#1B101D', className: 'bg-on-primary border border-border/40' },
    ],
  },
  {
    title: 'Blue',
    items: [
      { token: 'blue-deep', hex: '#2E1623', className: 'bg-blue-deep' },
      { token: 'blue', hex: '#BF8466', className: 'bg-blue' },
      { token: 'blue-glow', hex: '#BF8466', className: 'bg-blue-glow' },
      { token: 'blue-light', hex: '#E6BC9F', className: 'bg-blue-light' },
    ],
  },
  {
    title: 'Text',
    items: [
      { token: 'text-silver-300', hex: '#FBEFE6', className: 'bg-text-primary' },
      { token: 'text-highlight', hex: '#D2C1C4', className: 'bg-text-highlight' },
      { token: 'text-secondary', hex: '#A097A7', className: 'bg-text-secondary' },
      { token: 'text-muted', hex: '#7A6E74', className: 'bg-text-muted' },
      { token: 'text-disabled', hex: '#5C4750', className: 'bg-text-disabled' },
    ],
  },
  {
    title: 'States',
    items: [
      { token: 'success', hex: '#E6BC9F', className: 'bg-success' },
      { token: 'warning', hex: '#BF8466', className: 'bg-warning' },
      { token: 'error', hex: '#6E4234', className: 'bg-error' },
      { token: 'info', hex: '#BF8466', className: 'bg-info' },
    ],
  },
] as const

/**
 * Cosmos AI design system — colors, type, and every core component state.
 */
export default function DesignSystemPage() {
  const tabs = useTabs('underline')
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="relative min-h-dvh bg-bg text-text-primary">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <StarfieldBackground count={48} seed="design-system" />
        <GlowOrb className="-right-20 top-0" size="lg" />
      </div>

      <header className="sticky top-0 z-20 border-b border-border/30 bg-bg-secondary/80 backdrop-blur-xl">
        <PageContainer width="wide" flush className="flex h-topnav items-center justify-between">
          <div>
            <p className="eyebrow">Design system</p>
            <h1 className="font-serif text-title text-text-primary">Cosmos AI</h1>
          </div>
          <Badge selected mono>
            Dark only
          </Badge>
        </PageContainer>
      </header>

      <PageContainer width="wide" className="relative space-y-16 py-10 pb-28">
        {COLOR_GROUPS.map((group) => (
          <section key={group.title} className="space-y-4">
            <SectionHeader eyebrow="Colour" title={group.title} size="sm" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {group.items.map((s) => (
                <Swatch key={s.token} {...s} />
              ))}
            </div>
          </section>
        ))}

        <section className="space-y-4">
          <SectionHeader eyebrow="Gradients" title="Brand gradients" size="sm" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <GradientSwatch label="gold" className="bg-gold-gradient" />
            <GradientSwatch label="hero" className="bg-hero-gradient" />
            <GradientSwatch label="card" className="bg-card-gradient border border-border/30" />
            <div className="space-y-2">
              <div className="flex h-16 items-center justify-center rounded-card border border-border/30 bg-bg-secondary">
                <span className="font-serif text-heading text-gradient-gold">birth chart</span>
              </div>
              <p className="text-sm font-medium">text</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader eyebrow="Typography" title="Type scale" size="sm" />
          <Card padding="lg" className="space-y-4">
            <p className="eyebrow">Eyebrow · 12px · 0.15em</p>
            <p className="font-serif text-display-lg">H1 Display 56/64</p>
            <p className="font-serif text-display lg:hidden">H1 mobile 36/44</p>
            <p className="font-serif text-title-lg">H2 40/48</p>
            <p className="font-serif text-heading">H3 24/32</p>
            <p className="font-sans text-body text-text-secondary">
              Body 16/26 — Manrope. Secondary text uses text-secondary.
            </p>
            <p className="font-sans text-sm text-text-secondary">Small 14/22</p>
            <p className="font-mono text-data text-text-muted">Mono data · IBM Plex Mono</p>
          </Card>
        </section>

        <section className="space-y-4">
          <SectionHeader eyebrow="Components" title="Buttons" size="sm" />
          <Card padding="lg" className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button pulse>Pulse CTA</Button>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
            <Button variant="danger">Danger</Button>
          </Card>
        </section>

        <section className="space-y-4">
          <SectionHeader eyebrow="Components" title="Cards" size="sm" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Card padding="lg">
              <p className="font-serif text-heading">Default glass</p>
              <p className="mt-2 text-sm text-text-secondary">Card gradient + blur + 30% border.</p>
            </Card>
            <Card padding="lg" interactive>
              <p className="font-serif text-heading">Interactive</p>
              <p className="mt-2 text-sm text-text-secondary">Hover for lift + blue glow.</p>
            </Card>
            <Card tone="gold" padding="lg">
              <p className="font-serif text-heading">Gold tone</p>
              <p className="mt-2 text-sm text-text-secondary">Premium emphasis surface.</p>
            </Card>
            <Card tone="elevated" padding="lg">
              <p className="font-serif text-heading">Elevated</p>
              <p className="mt-2 text-sm text-text-secondary">Raised shadow stack.</p>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader eyebrow="Components" title="Inputs" size="sm" />
          <Card padding="lg" className="space-y-4">
            <Input placeholder="Default — surface mid @ 50%" />
            <Input placeholder="Focus for blue-glow ring" />
            <Input placeholder="Error state" invalid defaultValue="Misaligned value" />
          </Card>
        </section>

        <section className="space-y-4">
          <SectionHeader eyebrow="Components" title="Badges & tabs" size="sm" />
          <Card padding="lg" className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge tone="gold" mono>
                Zodiac
              </Badge>
              <Badge selected>Selected</Badge>
              <Badge tone="positive">Success</Badge>
              <Badge tone="caution">Warning</Badge>
              <Badge tone="critical">Error</Badge>
            </div>
            <Tabs
              label="Demo tabs"
              controller={tabs}
              items={[
                { id: 'underline', label: 'Underline' },
                { id: 'two', label: 'Second' },
                { id: 'three', label: 'Third' },
              ]}
            />
            <Tabs
              label="Segmented"
              variant="segmented"
              controller={tabs}
              items={[
                { id: 'underline', label: 'Love' },
                { id: 'two', label: 'Career' },
                { id: 'three', label: 'Health' },
              ]}
            />
          </Card>
        </section>

        <section className="space-y-4">
          <SectionHeader eyebrow="Components" title="Modal, toast, skeleton" size="sm" />
          <Card padding="lg" className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => setModalOpen(true)}>
              Open modal
            </Button>
            <p className="text-sm text-text-secondary">
              Toasts use the glass card language via ToastProvider.
            </p>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <SkeletonCard withAvatar lines={3} />
            <div className="space-y-3 rounded-card border border-border/30 bg-card-gradient p-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader eyebrow="Components" title="Empty & error" size="sm" />
          <div className="grid gap-4 lg:grid-cols-2">
            <Card padding="none">
              <EmptyState
                icon={<Star strokeWidth={1.5} />}
                title="No readings yet"
                description="Ask your first question to light up this sky."
                action={<Button size="md">Ask now</Button>}
                variant="inline"
              />
            </Card>
            <Card padding="none">
              <ErrorState variant="inline" onRetry={() => undefined} />
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader eyebrow="Cosmic layer" title="Starfield & glow orbs" size="sm" />
          <Card padding="none" className="relative h-48 overflow-hidden">
            <StarfieldBackground count={64} seed="kit-demo" shootingStars />
            <GlowOrb tone="blue" size="md" className="left-8 top-6" />
            <GlowOrb tone="gold" size="md" className="right-4 bottom-0" drift={false} />
            <div className="relative z-10 flex h-full items-end p-5">
              <p className="text-sm text-text-secondary">
                Global starfield + blurred orbs. Pauses when the tab is hidden.
              </p>
            </div>
          </Card>
        </section>

        <div className="cosmos-divider py-2" aria-hidden>
          <Sparkles className="size-4 text-silver-300" strokeWidth={1.5} />
        </div>

        <Card padding="lg" className="flex items-center gap-3">
          <Moon className="size-5 text-silver-300" strokeWidth={1.5} aria-hidden />
          <p className="text-sm text-text-secondary">
            Cosmos AI is dark-only. Tokens live in <code className="text-silver-300">src/styles/tokens.css</code>.
          </p>
        </Card>
      </PageContainer>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Glass modal"
        description="Scale-in from 0.96 · blurred overlay."
        footer={
          <Button size="md" onClick={() => setModalOpen(false)}>
            Close
          </Button>
        }
      >
        <p className="text-body text-text-secondary">
          Modals use the card gradient, panel radius (24px), and focus-trapped dialog semantics.
        </p>
      </Modal>
    </div>
  )
}

function Swatch({
  token,
  hex,
  className,
}: {
  token: string
  hex: string
  className: string
}) {
  return (
    <div className="space-y-2">
      <div className={cn('h-16 rounded-card border border-border/30', className)} />
      <p className="text-sm font-medium text-text-primary">{token}</p>
      <p className="font-mono text-label uppercase tracking-[0.15em] text-text-muted">{hex}</p>
    </div>
  )
}

function GradientSwatch({ label, className }: { label: string; className: string }) {
  return (
    <div className="space-y-2">
      <div className={cn('h-16 rounded-card', className)} />
      <p className="text-sm font-medium">{label}</p>
    </div>
  )
}
