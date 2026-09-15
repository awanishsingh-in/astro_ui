import type { ButtonHTMLAttributes } from 'react'
import type { RashiName } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { RASHIS } from '@/utils/astro'

interface BaseProps {
  rashi: RashiName
  selected?: boolean
  size?: 'sm' | 'md'
}

export type ZodiacChipProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>

/**
 * A selectable rashi token — the Chip pattern with the sign's glyph leading.
 * Used for sign pickers in horoscopes and compatibility.
 */
export function ZodiacChip({
  rashi,
  selected = false,
  size = 'md',
  className,
  type = 'button',
  ...rest
}: ZodiacChipProps) {
  const meta = RASHIS.find((r) => r.name === rashi)

  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-control border whitespace-nowrap',
        'transition-[background-color,border-color,color,transform] duration-150 ease-out-soft',
        'active:scale-[0.97]',
        size === 'sm' ? 'h-9 px-3' : 'h-11 px-3.5',
        selected
          ? 'border-gold bg-gold-soft font-semibold text-gold-deep'
          : 'border-border bg-surface text-purple hover:border-border-strong hover:bg-navy-soft',
        className,
      )}
      {...rest}
    >
      <span aria-hidden className={cn('text-base', selected ? 'text-gold-deep' : 'text-gold')}>
        {meta?.glyph}
      </span>
      <span className={size === 'sm' ? 'text-xs font-medium' : 'text-sm font-medium'}>{rashi}</span>
      <span className="sr-only">{meta?.english}</span>
    </button>
  )
}
