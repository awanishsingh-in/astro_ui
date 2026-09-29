import type { ButtonHTMLAttributes } from 'react'
import type { RashiName } from '@/types/astrology'
import { cn } from '@/utils/cn'
import { RASHIS } from '@/utils/astro'

interface BaseProps {
  rashi: RashiName
  selected?: boolean
  size?: 'sm' | 'md' | 'lg'
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
        'inline-flex shrink-0 items-center whitespace-nowrap border',
        'transition-[background-color,border-color,color,transform] duration-150 ease-out-soft',
        'active:scale-[0.97]',
        size === 'sm' && 'h-9 gap-2 rounded-control px-3',
        size === 'md' && 'h-11 gap-2 rounded-control px-3.5',
        size === 'lg' && 'h-14 gap-2.5 rounded-xl px-5 sm:h-16 sm:gap-3 sm:px-6',
        selected
          ? 'border-copper bg-copper/15 font-semibold text-copper shadow-[0_0_0_1px_rgba(124, 77, 255,0.35)]'
          : 'border-border bg-surface text-ink hover:border-border-strong hover:bg-navy-soft',
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden
        className={cn(
          selected ? 'text-copper' : 'text-gold',
          size === 'sm' && 'text-base',
          size === 'md' && 'text-lg',
          size === 'lg' && 'text-2xl sm:text-3xl',
        )}
      >
        {meta?.glyph}
      </span>
      <span
        className={cn(
          'font-medium',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base sm:text-lg',
        )}
      >
        {rashi}
      </span>
      <span className="sr-only">{meta?.english}</span>
    </button>
  )
}
