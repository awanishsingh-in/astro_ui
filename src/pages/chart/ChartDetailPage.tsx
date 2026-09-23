import { ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/auth/auth-context'
import { buildChartBasicsBundle } from '@/data/chart-basics'
import { chartSeedFor } from '@/data/profiles'
import { buildChart } from '@/data/chart-mock'
import {
  formatChartDetailInr,
  hasChartDetailUnlocked,
} from '@/onboarding/chart-detail-unlock'
import { PageContainer } from '@/layouts/PageContainer'
import { useProfiles } from '@/profiles/profiles-context'
import { paths } from '@/routes/paths'
import { formatDateLong, formatTime12 } from '@/utils/format'
import { cn } from '@/utils/cn'

/**
 * Detail screen after Get detail — all chart facts, then Get detailed report / view book.
 */
export default function ChartDetailPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { selected: profile } = useProfiles()
  const birth = profile.birthDetails

  if (!user) return null

  const unlocked = hasChartDetailUnlocked(user.id, profile.id)
  const chart = buildChart(chartSeedFor(profile), 'D1')
  const { basics, birth: birthFacts, avakhada } = buildChartBasicsBundle(chart, birth)
  const moon = chart.grahas.find((g) => g.graha === 'Mo')

  return (
    <PageContainer width="content" className="pb-16 pt-4 sm:pt-6">
      <article className="mx-auto flex max-w-2xl flex-col gap-6 animate-rise">
        <button
          type="button"
          onClick={() => navigate(`${paths.chart}?section=charts`)}
          className="self-start text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
        >
          ← Charts
        </button>

        <header className="space-y-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            Chart details
          </p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Everything from this chart
          </h1>
          <p className="text-sm leading-relaxed text-muted text-pretty">
            {profile.name} · {formatDateLong(birth.date)} ·{' '}
            {birth.timeUnknown ? 'Time unknown' : formatTime12(birth.time)} · {birth.place.label}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Chip label="Lagna" value={chart.lagna.rashi} tone="copper" />
            {moon && (
              <Chip
                label="Chandra"
                value={`${moon.rashi} · ${moon.nakshatra.name}`}
                tone="muted"
              />
            )}
          </div>
        </header>

        <FactCard
          title="Your basics"
          rows={[
            ['Lagna', basics.lagna],
            ['Moon Sign', basics.moonSign],
            ['Sun Sign', basics.sunSign],
            ['Nakshatra', basics.nakshatra],
          ]}
        />
        <FactCard
          title="At your birth"
          rows={[
            ['Tithi', birthFacts.tithi],
            ['Yoga', birthFacts.yoga],
            ['Karana', birthFacts.karana],
            ['Weekday', birthFacts.weekday],
            ['Sunrise', birthFacts.sunrise],
            ['Ayanamsa', birthFacts.ayanamsa],
          ]}
        />
        <FactCard
          title="Avakhada"
          rows={[
            ['Varna', avakhada.varna],
            ['Vashya', avakhada.vashya],
            ['Yoni', avakhada.yoni],
            ['Gana', avakhada.gana],
            ['Nadi', avakhada.nadi],
            ['Tara', avakhada.tara],
          ]}
        />

        <div className="rounded-3xl border border-copper/35 bg-copper/10 px-5 py-5 sm:px-6">
          <p className="text-sm font-semibold text-gold-deep">
            {unlocked ? 'Your detailed report is unlocked' : 'Get the full book report'}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink text-pretty">
            {unlocked
              ? 'Open the book-style reading anytime, or download it to keep.'
              : `Unlock a long-form reading for ${formatChartDetailInr()} — houses, dasha opening, work, bond, and wealth, as a book you can download anytime.`}
          </p>
          <Button
            variant="primary"
            size="lg"
            className="mt-4 w-full rounded-full"
            iconLeft={<ShoppingBag className="size-4" />}
            onClick={() =>
              navigate(unlocked ? paths.chartDetailView : paths.chartDetailUnlock)
            }
          >
            {unlocked ? 'View detailed report' : 'Get detailed report'}
          </Button>
        </div>
      </article>
    </PageContainer>
  )
}

function Chip({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'copper' | 'muted'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5',
        tone === 'copper'
          ? 'border-copper/35 bg-copper/12'
          : 'border-border/80 bg-surface/70',
      )}
    >
      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      <span className="text-sm font-semibold text-ink">{value}</span>
    </span>
  )
}

function FactCard({
  title,
  rows,
}: {
  title: string
  rows: [string, string][]
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-border/80 bg-surface/90 shadow-card">
      <header className="border-b border-border/60 px-4 py-3 sm:px-5">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
      </header>
      <dl className="grid grid-cols-2 gap-px bg-border/50">
        {rows.map(([label, value]) => (
          <div key={label} className="bg-surface px-4 py-3 sm:px-5">
            <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              {label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink text-pretty">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}
