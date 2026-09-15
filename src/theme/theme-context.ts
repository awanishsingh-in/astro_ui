import { createContext } from 'react'
import type { ResolvedTheme, ThemePreference } from './theme'

export interface ThemeContextValue {
  preference: ThemePreference
  resolved: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
}

/**
 * Lives in its own module so HMR can refresh ThemeProvider without minting a
 * new context identity (which would make useTheme throw mid-session).
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null)
