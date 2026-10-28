import { Badge, Button, Card, Input } from '@/components'
import { PageContainer } from '@/layouts/PageContainer'
import { cn } from '@/utils/cn'

const CORE_SWATCHES = [
  { token: 'bg', hex: '#0F0B19', className: 'bg-bg' },
  { token: 'surface', hex: '#1B101D', className: 'bg-surface' },
  { token: 'primary', hex: '#BF8466', className: 'bg-primary' },
  { token: 'secondary', hex: '#6E4234', className: 'bg-secondary' },
  { token: 'accent', hex: '#F2D7C7', className: 'bg-accent' },
  { token: 'text', hex: '#FBEFE6', className: 'bg-text' },
] as const

const DERIVED_SWATCHES = [
  { token: 'surface-raised', hex: '#2E1623', className: 'bg-surface-raised' },
  { token: 'border', hex: '#44333C', className: 'bg-border' },
  { token: 'border-strong', hex: '#5C4750', className: 'bg-border-strong' },
  { token: 'text-secondary', hex: '#D2C1C4', className: 'bg-text-secondary' },
  { token: 'text-muted', hex: '#A097A7', className: 'bg-text-muted' },
  { token: 'text-disabled', hex: '#7A6E74', className: 'bg-text-disabled' },
  { token: 'on-primary', hex: '#0F0B19', className: 'bg-on-primary' },
  { token: 'on-secondary', hex: '#FBEFE6', className: 'bg-on-secondary' },
  { token: 'primary-hover', hex: '#E6BC9F', className: 'bg-primary-hover' },
  { token: 'primary-pressed', hex: '#6E4234', className: 'bg-primary-pressed' },
  { token: 'secondary-hover', hex: '#BF8466', className: 'bg-secondary-hover' },
  { token: 'success', hex: '#E6BC9F', className: 'bg-success' },
  { token: 'warning', hex: '#BF8466', className: 'bg-warning' },
  { token: 'error', hex: '#6E4234', className: 'bg-error' },
  { token: 'info', hex: '#2E1623', className: 'bg-info' },
] as const

/**
 * Cosmos theme preview — swatches, buttons, inputs, card, badge, alerts.
 * Dev-facing route (linked from Foundation / Account is optional).
 */
export default function ThemePreviewPage() {
  return (
    <div className="min-h-dvh bg-bg text-text">
      <header className="sticky top-0 z-20 border-b border-border bg-surface">
        <PageContainer width="wide" flush className="flex h-topnav items-center justify-between">
          <div>
            <p className="font-mono text-label uppercase tracking-[0.14em] text-text-muted">
              Theme
            </p>
            <h1 className="font-serif text-title text-text">Cosmos</h1>
          </div>
          <Badge selected mono>
            Dark only · see /design-system
          </Badge>
        </PageContainer>
      </header>

      <PageContainer width="wide" className="space-y-12 py-10 pb-24">
        <section className="space-y-4">
          <h2 className="text-heading font-semibold text-text">Core tokens</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {CORE_SWATCHES.map((s) => (
              <Swatch key={s.token} {...s} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-heading font-semibold text-text">Derived tokens</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {DERIVED_SWATCHES.map((s) => (
              <Swatch key={s.token} {...s} />
            ))}
            <div className="space-y-2">
              <div
                className="h-16 rounded-card border border-border"
                style={{ background: 'var(--color-overlay)' }}
              />
              <p className="text-sm font-medium text-text">overlay</p>
              <p className="font-mono text-label uppercase text-text-muted"></p>
            </div>
            <div className="space-y-2">
              <div
                className="flex h-16 items-center justify-center rounded-card border border-border bg-surface"
                style={{ boxShadow: 'var(--shadow-focus)' }}
              >
                <span className="font-mono text-xs text-text-muted">focus-ring</span>
              </div>
              <p className="text-sm font-medium text-text">focus-ring</p>
              <p className="font-mono text-label uppercase text-text-muted">primary @ 60%</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-heading font-semibold text-text">Buttons</h2>
          <Card padding="lg" className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-heading font-semibold text-text">Inputs</h2>
          <Card padding="lg" className="space-y-4">
            <Input placeholder="Default state" />
            <Input placeholder="Focus me — primary border + focus ring" />
            <Input placeholder="Error state" invalid defaultValue="Invalid value" />
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-heading font-semibold text-text">Card & badge</h2>
          <Card padding="lg" className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="gold">Leo</Badge>
              <span className="inline-flex items-center rounded-control bg-surface-raised px-2.5 py-1 font-mono text-label uppercase tracking-[0.12em] text-silver-300">
                Zodiac chip
              </span>
              <span className="inline-flex items-center rounded-control bg-accent px-2.5 py-1 font-mono text-label uppercase tracking-[0.12em] text-on-primary">
                Accent fill
              </span>
            </div>
            <p className="text-body text-text">Today&apos;s horoscope</p>
            <p className="text-sub text-text-secondary">
              Supporting copy uses text-secondary — never secondary brick as text.
            </p>
            <p className="text-sm text-text-muted">Caption / timestamp · text-muted</p>
            <Button size="md">Get reading</Button>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-heading font-semibold text-text">Status alerts</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Alert tone="success" title="Success" body="Positive prediction confirmed." />
            <Alert tone="warning" title="Warning" body="Transit period needs attention." />
            <Alert tone="error" title="Error" body="Birth time could not be validated." />
            <Alert tone="info" title="Info" body="Dasha change begins next week." />
          </div>
        </section>
      </PageContainer>
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
      <div className={cn('h-16 rounded-card border border-border', className)} />
      <p className="text-sm font-medium text-text">{token}</p>
      <p className="font-mono text-label uppercase text-text-muted">{hex}</p>
    </div>
  )
}

function Alert({
  tone,
  title,
  body,
}: {
  tone: 'success' | 'warning' | 'error' | 'info'
  title: string
  body: string
}) {
  const styles = {
    success: 'border-success/40 bg-success-soft text-success',
    warning: 'border-warning/40 bg-warning-soft text-warning',
    error: 'border-error/40 bg-error-soft text-error',
    info: 'border-info/40 bg-info-soft text-info',
  } as const

  return (
    <div className={cn('rounded-card border px-4 py-3', styles[tone])}>
      <p className="text-sm font-semibold text-text">{title}</p>
      <p className="mt-1 text-sm text-text-secondary">{body}</p>
    </div>
  )
}
