import { createContext } from 'react'
import type { ResolvedTheme, ThemePreference } from './theme'

export interface ThemeContextValue {
  /** Active theme (`dark` | `light`) — same as `resolved`. */
  theme: ResolvedTheme
  preference: ThemePreference
  resolved: ResolvedTheme
  setTheme: (preference: ThemePreference) => void
  setPreference: (preference: ThemePreference) => void
  toggleTheme: () => void
}

/**
 * Lives in its own module so HMR can refresh ThemeProvider without minting a
 * new context identity (which would make useTheme throw mid-session).
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null)
