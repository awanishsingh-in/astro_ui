import type { GrahaCode } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { GRAHAS, grahaToneClass, grahaToneClassDark } from '@/utils/astro'

export interface PlanetGlyphProps {
  code: GrahaCode
  /** Show the two-letter code beside the glyph, as the tables do. */
  withCode?: boolean
  /** Show the Sanskrit name, as the dasha rows do. */
  withName?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** Which surface it sits on. Dark switches to the celestial text roles. */
  tone?: 'light' | 'dark'
  className?: string
}

const SIZES = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' } as const

/** A graha, named and coloured the same way everywhere it appears. */
export function PlanetGlyph({
  code,
  withCode = false,
  withName = false,
  size = 'md',
  tone = 'light',
  className,
}: PlanetGlyphProps) {
  const meta = GRAHAS[code]
  const dark = tone === 'dark'
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap', className)}>
      <span
        className={cn(SIZES[size], dark ? grahaToneClassDark(code) : grahaToneClass(code))}
        aria-hidden
      >
        {meta.glyph}
      </span>
      {withCode && (
        <span className={cn('font-mono text-data', dark ? 'text-on-celestial' : 'text-ink')}>
          {meta.code}
        </span>
      )}
      {withName && (
        <span className={cn('text-sm', dark ? 'text-on-celestial' : 'text-ink')}>{meta.name}</span>
      )}
      <span className="sr-only">{meta.english}</span>
    </span>
  )
}
