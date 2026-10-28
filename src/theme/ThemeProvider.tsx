import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ThemeContext } from './theme-context'
import {
  applyResolvedTheme,
  persistThemePreference,
  readThemePreference,
  resolveTheme,
  toggleThemePreference,
  type ThemePreference,
} from './theme'

/**
 * Dark (default) + Light appearance.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => readThemePreference())
  const resolved = resolveTheme(preference)

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    persistThemePreference(next)
    applyResolvedTheme(resolveTheme(next))
  }, [])

  const toggleTheme = useCallback(() => {
    setPreferenceState((prev) => {
      const next = toggleThemePreference(prev)
      persistThemePreference(next)
      applyResolvedTheme(resolveTheme(next))
      return next
    })
  }, [])

  useEffect(() => {
    applyResolvedTheme(resolved)
  }, [resolved])

  const value = useMemo(
    () => ({
      theme: resolved,
      preference,
      resolved,
      setTheme: setPreference,
      setPreference,
      toggleTheme,
    }),
    [preference, resolved, setPreference, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
