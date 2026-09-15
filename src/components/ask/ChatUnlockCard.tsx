import { Lock } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface ChatUnlockCardProps {
  onUnlock: () => void
  /** `dark` matches Know Your Past; `light` sits on the Ask canvas. */
  tone?: 'dark' | 'light'
  className?: string
}

/**
 * Bottom CTA when chat is locked — tap opens the plan paywall.
 */
export function ChatUnlockCard({
  onUnlock,
  tone = 'dark',
  className,
}: ChatUnlockCardProps) {
  const dark = tone === 'dark'

  return (
    <button
      type="button"
      onClick={onUnlock}
      className={cn(
        'flex w-full items-center gap-3 rounded-card border px-4 py-3.5 text-left',
        'transition-[border-color,background-color,transform] duration-200 ease-out-soft',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60',
        'active:scale-[0.99]',
        dark
          ? 'border-celestial-line/80 bg-indigo-royal/40 hover:border-gold-soft-line/45 hover:bg-indigo-royal/55'
          : 'border-border-strong/70 bg-indigo-deep text-on-celestial hover:border-gold/50',
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex size-10 shrink-0 items-center justify-center rounded-full',
          dark ? 'bg-midnight/60 text-gold-soft-line' : 'bg-midnight/50 text-gold',
        )}
      >
        <Lock className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-serif text-lg text-on-celestial">
          Chat about your past
        </span>
        <span
          className={cn(
            'mt-0.5 block text-sm',
            dark ? 'text-on-celestial-muted' : 'text-on-celestial/75',
          )}
        >
          Paid feature · unlock to ask about these patterns
        </span>
      </span>
      <span
        className={cn(
          'shrink-0 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]',
          dark
            ? 'border-gold-soft-line/40 text-gold-soft-line'
            : 'border-gold/50 text-gold',
        )}
      >
        Paid
      </span>
    </button>
  )
}
