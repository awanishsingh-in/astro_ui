import type { GrahaPosition } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { dignityLabel, dignityToneClass } from '@/utils/astro'
import { DegreeValue } from './DegreeValue'
import { PlanetGlyph } from './PlanetGlyph'

export interface PlanetRowProps {
  position: GrahaPosition
  /** Desktop shows dignity and motion; mobile stops at the bhava. */
  detailed?: boolean
  active?: boolean
  onClick?: () => void
  className?: string
}

/**
 * One graha's placement as a standalone row — used where a table would be too
 * heavy: inside a reading's citation, a sheet, or a narrow card.
 *
 * The `DataTable` version of the same data lives on the chart dashboard.
 */
export function PlanetRow({ position, detailed = false, active, onClick, className }: PlanetRowProps) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 border-b border-border py-3 text-left last:border-b-0',
        onClick && 'transition-colors hover:bg-navy-soft',
        active && 'bg-gold-soft',
        className,
      )}
    >
      <PlanetGlyph code={position.graha} withCode size="md" className="w-16 shrink-0" />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-ink">{position.rashi}</span>
        <span className="block truncate font-mono text-label uppercase text-muted">
          {position.nakshatra.name} · {position.nakshatra.pada}
        </span>
      </span>

      <DegreeValue
        degree={position.degree}
        minute={position.minute}
        motion={position.motion}
        className="shrink-0"
      />

      <span className="w-10 shrink-0 text-right font-mono text-data text-muted">
        {position.bhava}
      </span>

      {detailed && (
        <span
          className={cn(
            'hidden w-24 shrink-0 text-right text-sm md:block',
            dignityToneClass(position.dignity),
          )}
        >
          {dignityLabel(position.dignity)}
        </span>
      )}
    </Tag>
  )
}
