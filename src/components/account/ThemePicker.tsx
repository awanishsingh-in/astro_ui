import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/theme/ThemeProvider'
import type { ThemePreference } from '@/theme/theme'
import { cn } from '@/utils/cn'

const OPTIONS: { id: ThemePreference; label: string; hint: string; icon: typeof Moon }[] = [
  { id: 'dark', label: 'Dark', hint: 'Deep space · default', icon: Moon },
  { id: 'light', label: 'Light', hint: 'Pearl & rose-gold', icon: Sun },
]

/**
 * Account appearance control — Dark + Light.
 */
export function ThemePicker({ className }: { className?: string }) {
  const { preference, setPreference } = useTheme()

  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <p className="text-sub font-medium text-text-primary">Appearance</p>
        <p className="mt-0.5 text-sm text-text-secondary text-pretty">
          Choose dark space or warm pearl light. Preference is saved on this device.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Appearance">
        {OPTIONS.map((option) => {
          const selected = preference === option.id
          const Icon = option.icon
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setPreference(option.id)}
              className={cn(
                'flex items-center gap-3 rounded-card border px-3 py-3 text-left transition-colors',
                selected
                  ? 'border-[color-mix(in_srgb,var(--accent-eyebrow)_45%,transparent)] bg-[var(--surface-selected)]'
                  : 'border-[var(--hairline)] bg-[var(--surface)] hover:bg-[var(--surface-2)]',
              )}
            >
              <span
                className={cn(
                  'inline-flex size-10 items-center justify-center rounded-full',
                  selected
                    ? 'bg-[var(--accent-eyebrow)] text-[var(--text-on-accent)]'
                    : 'bg-[var(--surface-2)] text-[var(--text-secondary)]',
                )}
              >
                <Icon className="size-5" strokeWidth={1.5} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">{option.label}</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-muted">
                  {option.hint}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
