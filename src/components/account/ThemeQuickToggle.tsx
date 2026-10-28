import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/theme/ThemeProvider'
import { cn } from '@/utils/cn'

/**
 * Sidebar / chrome theme toggle — moon in dark, sun in light.
 */
export function ThemeQuickToggle({ className }: { className?: string }) {
  const { resolved, toggleTheme } = useTheme()
  const isDark = resolved === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-full',
        'text-[color:var(--text-secondary)] transition-colors',
        'hover:bg-[color-mix(in_srgb,var(--text-primary)_6%,transparent)] hover:text-[color:var(--text-primary)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
        className,
      )}
    >
      {isDark ? (
        <Moon className="size-5" strokeWidth={1.5} aria-hidden />
      ) : (
        <Sun className="size-5" strokeWidth={1.5} aria-hidden />
      )}
    </button>
  )
}
