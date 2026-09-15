import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/theme/ThemeProvider'
import { cn } from '@/utils/cn'

/**
 * Compact sun/moon control — cycles Light → Dark → System.
 */
export function ThemeQuickToggle({ className }: { className?: string }) {
  const { preference, resolved, setPreference } = useTheme()

  const cycle = () => {
    const order = ['light', 'dark', 'system'] as const
    const index = order.indexOf(preference)
    setPreference(order[(index + 1) % order.length])
  }

  const label =
    preference === 'system'
      ? `System (${resolved})`
      : preference === 'light'
        ? 'Light mode'
        : 'Dark mode'

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Appearance: ${label}. Tap to change.`}
      title={label}
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-full',
        'text-purple transition-colors hover:bg-navy-soft hover:text-ink',
        className,
      )}
    >
      {resolved === 'dark' ? (
        <Moon className="size-5 text-gold-deep" aria-hidden />
      ) : (
        <Sun className="size-5 text-gold-deep" aria-hidden />
      )}
    </button>
  )
}
