import { DataTable, type DataColumn } from '@/components/common/DataTable'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { HouseWheel } from '@/components/astrology/HouseWheel'
import { CelestialCard } from '@/components/celestial/CelestialCard'
import type { BhavaPlacement, GrahaCode, Lagna } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { bhavaRef, rashiGlyph } from '@/utils/astro'
import { formatDegree } from '@/utils/format'

export interface BhavaTableProps {
  bhavas: BhavaPlacement[]
  lagna: Lagna
  /** Occupants per bhava, drawn inside the wheel's segments. */
  occupants?: Record<number, GrahaCode[]>
  activeBhava?: number
  onSelect?: (bhava: number) => void
  className?: string
}

/**
 * The twelve bhavas: each cusp, the sign on it, that sign's lord, and — the
 * part that actually decides a reading — where the lord itself stands.
 *
 * The wheel above the table is the same twelve, arranged the way the chart
 * arranges them, because "the fourth house" is a position before it is a row.
 */
export function BhavaTable({
  bhavas,
  lagna,
  occupants,
  activeBhava,
  onSelect,
  className,
}: BhavaTableProps) {
  /** Equal bhava: every cusp sits at the lagna's degree in its own sign. */
  const cusp = formatDegree(lagna.degree, lagna.minute)

  const columns: DataColumn<BhavaPlacement>[] = [
    {
      id: 'bhava',
      header: 'Bh',
      render: (row) => (
        <span className="font-mono text-data font-medium text-ink">{row.bhava}</span>
      ),
    },
    {
      id: 'cusp',
      header: 'Cusp',
      hideBelow: 'md',
      align: 'right',
      render: () => <span className="font-mono text-data text-muted">{cusp}</span>,
    },
    {
      id: 'rashi',
      header: 'Rashi',
      render: (row) => (
        <span className="whitespace-nowrap">
          <span aria-hidden className="mr-1.5 text-muted">
            {rashiGlyph(row.rashi)}
          </span>
          {row.rashi}
        </span>
      ),
    },
    {
      id: 'lord',
      header: 'Lord',
      render: (row) => <span className="whitespace-nowrap">{row.lord}</span>,
    },
    {
      id: 'sits',
      header: 'Sits',
      render: (row) => (
        <span
          className={cn(
            'font-mono text-data',
            row.lordSitsIn === row.bhava ? 'text-gold-deep' : 'text-purple',
          )}
        >
          {bhavaRef(row.lordSitsIn)}
        </span>
      ),
    },
    {
      id: 'occupants',
      header: 'Grahas',
      hideBelow: 'md',
      render: (row) =>
        row.occupants.length === 0 ? (
          <span className="text-muted">—</span>
        ) : (
          <span className="flex gap-2">
            {row.occupants.map((code) => (
              <PlanetGlyph key={code} code={code} withCode size="sm" />
            ))}
          </span>
        ),
    },
    {
      id: 'signifies',
      header: 'Reads for',
      hideBelow: 'lg',
      render: (row) => <span className="text-muted">{row.signifies}</span>,
    },
  ]

  /** Lords that fall back into the lagna are worth calling out. */
  const inLagna = bhavas.filter((b) => b.lordSitsIn === 1).map((b) => b.bhava)

  return (
    <div className={className}>
      <CelestialCard motifs={['stars']} tone="midnight" seed="bhavas" padding="lg" className="mb-5">
        {/*
          Container-relative, not viewport-relative: this card sits in a column
          whose width does not track the breakpoints, so the figure splits when
          the card itself is wide enough rather than when the window is.
        */}
        <div className="@container/figure">
          <div className="grid items-center gap-6 @lg/figure:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
            <HouseWheel
              bhavas={bhavas}
              occupants={occupants}
              activeBhava={activeBhava}
              onSelect={onSelect}
              tone="dark"
              className="mx-auto w-full max-w-[300px]"
            />

            <div className="min-w-0">
              <p className="font-mono text-label uppercase text-gold-soft-line">
                Lagna {lagna.rashi} {cusp}
              </p>
              {/* The selected house answers in the centre of the wheel; this
                  column carries what stays true whichever one is open. */}
              <p className="mt-2 text-sub text-on-celestial text-pretty">
                Twelve bhavas counted from the lagna, each with its lord and where that lord sits.
              </p>
              <p className="mt-3 text-sm text-on-celestial-muted text-pretty">
                Equal bhava, so every cusp carries the lagna&apos;s degree. Bhava 1 sits at nine
                o&apos;clock and the ring runs anticlockwise — the same arrangement as the wheel.
              </p>
              <p className="mt-4 font-mono text-label uppercase text-on-celestial-faint">
                Tap a segment to open that bhava in the table
              </p>
            </div>
          </div>
        </div>
      </CelestialCard>

      <DataTable
        caption="Bhava cusps and lords"
        columns={columns}
        rows={bhavas}
        rowKey={(row) => String(row.bhava)}
        onRowClick={onSelect ? (row) => onSelect(row.bhava) : undefined}
        isRowActive={(row) => row.bhava === activeBhava}
      />

      {inLagna.length >= 2 && (
        <p className="mt-4 rounded-card border border-gold-border bg-gold-soft p-3 text-sm text-purple text-pretty">
          <span className="font-mono text-label uppercase text-gold-deep">Note · </span>
          Lords of {inLagna.slice(0, -1).map(bhavaRef).join(', ')} and{' '}
          {bhavaRef(inLagna[inLagna.length - 1])} all stand in the lagna.
        </p>
      )}
    </div>
  )
}
