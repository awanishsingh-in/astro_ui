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
  type ResolvedTheme,
  type ThemePreference,
} from './theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    typeof window === 'undefined' ? 'system' : readThemePreference(),
  )
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    typeof window === 'undefined' ? 'dark' : resolveTheme(readThemePreference()),
  )

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    persistThemePreference(next)
    const value = resolveTheme(next)
    setResolved(value)
    applyResolvedTheme(value)
  }, [])

  useEffect(() => {
    applyResolvedTheme(resolveTheme(preference))
  }, [preference])

  useEffect(() => {
    if (preference !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const value = resolveTheme('system')
      setResolved(value)
      applyResolvedTheme(value)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [preference])

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
