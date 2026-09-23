import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Lock, X } from 'lucide-react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { useToast } from '@/components/feedback/toast-context'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'
import { downloadPanchangPdf, panchangFilename } from '@/utils/panchang-download'

type FormatId = 'pdf' | 'ical'
type RangeId = 'day' | 'week' | 'month' | 'year'
type Phase = 'gate' | 'ready'

const RANGES: { id: RangeId; label: string; sub: string }[] = [
  { id: 'day', label: 'This day', sub: '19 Sep 2026' },
  { id: 'week', label: 'This week', sub: '14–20 Sep' },
  { id: 'month', label: 'This month', sub: 'September' },
  { id: 'year', label: 'Full year', sub: '2026' },
]

const ICAL_URL = 'https://cyklos.com/ical/panchang/delhi/2026'

function rangeMeta(range: RangeId): { label: string; pages: string; size: string } {
  switch (range) {
    case 'day':
      return { label: 'Day sheet', pages: '1 page', size: '180 KB' }
    case 'week':
      return { label: 'Week range', pages: '7 pages', size: '640 KB' }
    case 'month':
      return { label: 'Month range', pages: '30 pages', size: '2.4 MB' }
    case 'year':
      return { label: 'Year range', pages: '365 pages', size: '18 MB' }
  }
}

/**
 * P11 download gate + P12 ready — PDF / Cal lives with panchang.
 * Free: today’s sheet as sample. Standard: any range + Cal subscribe.
 */
export function PanchangDownloadsFlow({
  locationLabel,
  dateIso,
  isStandard,
}: {
  locationLabel: string
  dateIso: string
  isStandard: boolean
}) {
  const toast = useToast()
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('gate')
  const [format, setFormat] = useState<FormatId>('pdf')
  const [range, setRange] = useState<RangeId>('day')

  const citySlug = useMemo(
    () => locationLabel.split(',')[0]?.trim().toLowerCase().replace(/\s+/g, '-') || 'delhi',
    [locationLabel],
  )
  const filename = panchangFilename(citySlug, range, dateIso)
  const meta = rangeMeta(range)
  const needsStandard = !isStandard && range !== 'day'

  function goReady() {
    if (needsStandard) {
      toast.info('Downloads are part of Standard', {
        description: 'Take today’s sheet free, or unlock the full range.',
        action: { label: 'Account', onClick: () => navigate(paths.account) },
      })
      return
    }
    setPhase('ready')
    if (format === 'pdf' && range === 'day' && !isStandard) {
      toast.success('Free sample ready', { description: 'Today’s panchang sheet.' })
    }
  }

  function handleDownloadPdf() {
    const name = downloadPanchangPdf({
      place: locationLabel,
      dateIso,
      range,
    })
    toast.success('Downloaded', { description: name })
  }

  function copyIcal() {
    void navigator.clipboard.writeText(ICAL_URL).then(
      () => toast.success('Cal link copied'),
      () => toast.info(ICAL_URL),
    )
  }

  if (phase === 'ready') {
    return (
      <div className="mx-auto w-full max-w-xl">
        <Card
          padding="none"
          className="flex flex-col gap-6 border-border/80 p-6 sm:gap-7 sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-heading font-semibold text-ink">Your panchang is ready</h2>
            <button
              type="button"
              aria-label="Close"
              className="rounded-full p-1.5 text-muted hover:bg-navy-soft hover:text-ink"
              onClick={() => setPhase('gate')}
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/80 bg-surface-sunken/40 px-4 py-4 sm:px-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-copper/15 text-copper">
              <FileText className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                PDF
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-ink">{filename}</p>
              <p className="mt-1 text-xs text-muted">
                {meta.label} · {meta.pages} · {meta.size}
              </p>
            </div>
            <Button variant="primary" size="sm" className="rounded-full" onClick={handleDownloadPdf}>
              Download
            </Button>
          </div>

          <div className="space-y-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              Or subscribe instead (Cal)
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <input
                readOnly
                value={ICAL_URL}
                className="min-w-0 flex-1 truncate rounded-xl border border-border/80 bg-surface-sunken/50 px-3.5 py-3 font-mono text-xs text-muted"
              />
              <Button variant="secondary" size="sm" className="shrink-0 rounded-full" onClick={copyIcal}>
                Copy
              </Button>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-muted text-pretty">
            Added to Profiles → My downloads. Subscribed calendars refresh on their own — nothing to
            download again.
          </p>

          <div className="flex flex-wrap gap-2 border-t border-border/70 pt-5">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => setPhase('gate')}
            >
              Choose another range
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setPhase('gate')}>
              Back
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <Card
        padding="none"
        className="flex flex-col gap-8 border-border/80 p-6 sm:gap-9 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-heading font-semibold text-ink">Download panchang</h2>
          <button
            type="button"
            aria-label="Close"
            className="rounded-full p-1.5 text-muted hover:bg-navy-soft hover:text-ink"
            onClick={() => navigate(paths.panchang)}
          >
            <X className="size-4" />
          </button>
        </div>

        <section className="space-y-3.5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Format
          </p>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <ChoiceCard
              active={format === 'pdf'}
              title="PDF"
              sub="Printable A4 sheet"
              onClick={() => setFormat('pdf')}
            />
            <ChoiceCard
              active={format === 'ical'}
              title="Cal"
              sub="Subscribe — updates daily"
              onClick={() => setFormat('ical')}
            />
          </div>
        </section>

        <section className="space-y-3.5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Range
          </p>
          <div className="grid grid-cols-2 gap-3.5">
            {RANGES.map((r) => (
              <ChoiceCard
                key={r.id}
                active={range === r.id}
                title={r.label}
                sub={r.sub}
                onClick={() => setRange(r.id)}
              />
            ))}
          </div>
        </section>

        {!isStandard && (
          <div className="flex flex-col gap-4 rounded-2xl border border-copper/40 bg-gold-soft px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-6">
            <div className="min-w-0 space-y-3">
              <Badge tone="gold" mono className="w-fit">
                <Lock className="mr-1 size-3" aria-hidden />
                Standard
              </Badge>
              <p className="max-w-md text-sm leading-relaxed text-ink text-pretty">
                Downloads are part of Standard. Take today’s sheet free to see the format, or unlock
                the full range.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0 self-start rounded-full sm:self-center"
              to={paths.account}
            >
              See plans
            </Button>
          </div>
        )}

        <Button variant="primary" size="lg" className="w-full rounded-full" onClick={goReady}>
          {isStandard
            ? format === 'ical'
              ? 'Get subscription link'
              : `Prepare ${RANGES.find((r) => r.id === range)?.label.toLowerCase()} PDF`
            : range === 'day'
              ? 'Download today only — free sample'
              : 'Unlock full range'}
        </Button>
      </Card>
    </div>
  )
}

function ChoiceCard({
  active,
  title,
  sub,
  onClick,
}: {
  active: boolean
  title: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-2xl border px-4 py-4 text-left transition sm:px-5 sm:py-5',
        active
          ? 'border-copper bg-copper/15 text-ink'
          : 'border-border/80 bg-surface-sunken/40 text-muted hover:border-copper/40 hover:text-ink',
      )}
    >
      <p className="text-sm font-semibold leading-snug">{title}</p>
      <p className="mt-2 text-xs leading-relaxed opacity-80">{sub}</p>
    </button>
  )
}
