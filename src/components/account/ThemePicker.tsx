import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/theme/ThemeProvider'
import type { ThemePreference } from '@/theme/theme'
import { cn } from '@/utils/cn'

const OPTIONS: {
  id: ThemePreference
  label: string
  icon: typeof Sun
  hint: string
}[] = [
  { id: 'light', label: 'Light', icon: Sun, hint: 'Bright canvas' },
  { id: 'dark', label: 'Dark', icon: Moon, hint: 'Night sky' },
  { id: 'system', label: 'System', icon: Monitor, hint: 'Match device' },
]

/**
 * Mobile-first appearance control — three large tap targets.
 */
export function ThemePicker({ className }: { className?: string }) {
  const { preference, setPreference } = useTheme()

  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <p className="text-sub font-medium text-ink">Appearance</p>
        <p className="mt-0.5 text-sm text-muted text-pretty">
          Light or dark for the whole app. Celestial screens stay night-sky.
        </p>
      </div>

      <div
        className="grid grid-cols-3 gap-2"
        role="radiogroup"
        aria-label="Appearance"
      >
        {OPTIONS.map((option) => {
          const active = preference === option.id
          const Icon = option.icon
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setPreference(option.id)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-card border px-2 py-3.5 text-center',
                'transition-colors duration-150 active:scale-[0.98]',
                active
                  ? 'border-gold bg-gold-soft/60 text-ink'
                  : 'border-border bg-surface text-purple hover:border-border-strong hover:bg-navy-soft/50',
              )}
            >
              <span
                className={cn(
                  'inline-flex size-10 items-center justify-center rounded-full',
                  active ? 'bg-navy text-on-celestial' : 'bg-surface-sunken text-gold-deep',
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
              </span>
              <span className="text-sm font-semibold">{option.label}</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                {option.hint}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
