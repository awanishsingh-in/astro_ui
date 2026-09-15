import { DataTable, type DataColumn } from '@/components/common/DataTable'
import { DegreeValue } from '@/components/astrology/DegreeValue'
import { PlanetGlyph } from '@/components/astrology/PlanetGlyph'
import { StrengthBar } from '@/components/astrology/StrengthBar'
import type { GrahaCode, GrahaPosition } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { dignityLabel, dignityToneClass, motionLabel, rashiGlyph } from '@/utils/astro'

export interface GrahaTableProps {
  grahas: GrahaPosition[]
  activeGraha?: GrahaCode | null
  onSelect?: (graha: GrahaCode) => void
  className?: string
}

/**
 * Every graha's placement: sign, degree, nakshatra and pada, the bhava it
 * falls in, its dignity there and whether it is moving backwards.
 *
 * Rows are selectable and drive the wheel's highlight, so the table and the
 * graphic are two views of one selection rather than two separate widgets.
 */
export function GrahaTable({ grahas, activeGraha, onSelect, className }: GrahaTableProps) {
  const columns: DataColumn<GrahaPosition>[] = [
    {
      id: 'graha',
      header: 'Gr',
      render: (row) => <PlanetGlyph code={row.graha} withCode size="sm" />,
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
      id: 'degree',
      header: 'Degree',
      align: 'right',
      render: (row) => <DegreeValue degree={row.degree} minute={row.minute} motion={row.motion} />,
    },
    {
      id: 'nakshatra',
      header: 'Nakshatra · pada',
      hideBelow: 'md',
      render: (row) => (
        <span className="font-mono text-data text-purple">
          {row.nakshatra.name} · {row.nakshatra.pada}
        </span>
      ),
    },
    {
      id: 'bhava',
      header: 'Bh',
      align: 'right',
      render: (row) => <span className="font-mono text-data">{row.bhava}</span>,
    },
    {
      id: 'dignity',
      header: 'Dignity',
      hideBelow: 'md',
      render: (row) => (
        <span className={cn('whitespace-nowrap', dignityToneClass(row.dignity))}>
          {dignityLabel(row.dignity)}
        </span>
      ),
    },
    {
      id: 'motion',
      header: 'Motion',
      hideBelow: 'lg',
      render: (row) => (
        <span className={cn(row.motion === 'retrograde' ? 'text-retrograde' : 'text-muted')}>
          {motionLabel(row.motion)}
        </span>
      ),
    },
    {
      id: 'strength',
      header: 'Strength',
      hideBelow: 'lg',
      align: 'right',
      render: (row) => (row.strength === undefined ? '—' : <StrengthBar value={row.strength} />),
    },
  ]

  return (
    <div className={className}>
      <p className="mb-3 text-sm text-muted text-pretty">
        Sidereal positions at birth, with the bhava each graha falls in and its dignity in that
        sign. Tap a row to find it on the wheel.
      </p>

      <DataTable
        caption="Graha positions"
        columns={columns}
        rows={grahas}
        rowKey={(row) => row.graha}
        onRowClick={onSelect ? (row) => onSelect(row.graha) : undefined}
        isRowActive={(row) => row.graha === activeGraha}
      />

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-label uppercase text-muted">
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-dignity-exalted" /> exalted or own
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-dignity-debilitated" /> debilitated
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="text-retrograde">℞</span> retrograde
        </li>
      </ul>
    </div>
  )
}
