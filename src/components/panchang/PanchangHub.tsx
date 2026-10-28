import { ScrollText } from 'lucide-react'
import {
  PANCHANG_HUB_CARDS,
  type PanchangKindId,
} from '@/data/panchang-hub'
import { cn } from '@/utils/cn'

/**
 * First screen on the Panchang tab — regional / tradition cards.
 */
export function PanchangHub({
  onSelect,
}: {
  onSelect: (kind: PanchangKindId) => void
}) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {PANCHANG_HUB_CARDS.map((card) => (
          <li key={card.id}>
            <button
              type="button"
              onClick={() => onSelect(card.id)}
              className={cn(
                'panchang-lang-card group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface/90 text-left',
                'shadow-card transition hover:-translate-y-0.5 hover:border-copper/45 hover:bg-copper/5 hover:shadow-raised',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper',
              )}
            >
              <div
                className={cn(
                  'panchang-lang-wash relative flex min-h-[7.5rem] flex-1 items-center justify-center bg-gradient-to-br p-4 sm:min-h-[9rem]',
                  card.accent,
                )}
              >
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 30% 20%, , transparent 45%)',
                  }}
                />
                <div className="relative flex flex-col items-center gap-2">
                  <span className="panchang-lang-icon inline-flex size-12 items-center justify-center rounded-xl border border-white/15 bg-black/25 text-[#F2D7C7] shadow-lg transition group-hover:scale-105 sm:size-14">
                    <ScrollText className="size-6 sm:size-7" strokeWidth={1.5} />
                  </span>
                  <span className="panchang-lang-mark max-w-[9rem] text-center font-serif text-sm font-semibold leading-snug text-ink text-balance sm:text-base">
                    {card.mark}
                  </span>
                </div>
              </div>
              <div className="panchang-lang-foot border-t border-border/70 bg-surface-sunken/50 px-2.5 py-3 text-center sm:px-3">
                <p className="text-xs font-semibold text-ink sm:text-sm">{card.title}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
