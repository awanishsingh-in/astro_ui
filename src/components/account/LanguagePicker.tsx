import { Check } from 'lucide-react'
import type { AppLanguage } from '@/types/user'
import { cn } from '@/utils/cn'

const OPTIONS: {
  id: AppLanguage
  label: string
  native: string
  hint: string
}[] = [
  { id: 'en', label: 'English', native: 'English', hint: 'Default' },
  { id: 'hi', label: 'Hindi', native: 'हिन्दी', hint: 'Coming soon' },
]

export interface LanguagePickerProps {
  value: AppLanguage
  onChange: (language: AppLanguage) => void
  className?: string
}

/**
 * Two large tap targets for interface language — English or Hindi.
 */
export function LanguagePicker({ value, onChange, className }: LanguagePickerProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <p className="font-mono text-label uppercase tracking-[0.12em] text-muted">
          Interface language
        </p>
        <p className="mt-1 text-sm text-muted text-pretty">
          Choose English or Hindi. Hindi preference is saved; full translation ships later.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Interface language">
        {OPTIONS.map((option) => {
          const active = value === option.id
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.id)}
              className={cn(
                'relative flex flex-col items-start gap-1 rounded-card border px-4 py-3.5 text-left',
                'transition-[border-color,background-color,transform] duration-150 ease-out-soft',
                'active:scale-[0.99]',
                active
                  ? 'border-copper/55 bg-copper/12 text-ink shadow-[0_0_24px_-12px_rgba(220,132,79,0.45)]'
                  : 'border-border bg-surface text-purple hover:border-border-strong hover:bg-navy-soft/60',
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute top-2.5 right-2.5 inline-flex size-5 items-center justify-center rounded-full bg-copper text-midnight"
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
              )}
              <span className="text-sub font-semibold text-ink">{option.label}</span>
              <span className="text-sm text-muted">{option.native}</span>
              <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
                {option.hint}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
