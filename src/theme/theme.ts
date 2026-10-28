/**
 * Cyklos appearance — Dark (default) + Light.
 * Source of truth: <html data-theme="dark|light">.
 */

export type ThemePreference = 'dark' | 'light'
export type ResolvedTheme = 'dark' | 'light'

export const THEME_STORAGE_KEY = 'cyklos-theme'
/** Legacy key from dark-only era — still read for migration. */
const THEME_STORAGE_KEY_LEGACY = 'cyklos_theme'

export const THEME_COLOR_DARK = '#0F0B19'
export const THEME_COLOR_LIGHT = '#FBF9F8'
/** @deprecated Prefer THEME_COLOR_DARK / THEME_COLOR_LIGHT. */
export const THEME_COLOR = THEME_COLOR_DARK

function isTheme(value: string | null | undefined): value is ThemePreference {
  return value === 'dark' || value === 'light'
}

export function readThemePreference(): ThemePreference {
  try {
    const next = localStorage.getItem(THEME_STORAGE_KEY)
    if (isTheme(next)) return next
    const legacy = localStorage.getItem(THEME_STORAGE_KEY_LEGACY)
    if (isTheme(legacy)) return legacy
  } catch {
    /* private mode */
  }
  return 'dark'
}

export function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return true
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function resolveTheme(preference: ThemePreference = readThemePreference()): ResolvedTheme {
  return preference
}

export function applyResolvedTheme(resolved: ResolvedTheme = 'dark') {
  document.documentElement.setAttribute('data-theme', resolved)
  document.documentElement.style.colorScheme = resolved

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', resolved === 'light' ? THEME_COLOR_LIGHT : THEME_COLOR_DARK)
  }
}

export function persistThemePreference(preference: ThemePreference) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference)
    localStorage.removeItem(THEME_STORAGE_KEY_LEGACY)
  } catch {
    /* private mode */
  }
}

export function cycleThemePreference(current: ThemePreference): ThemePreference {
  return current === 'dark' ? 'light' : 'dark'
}

export function toggleThemePreference(current: ThemePreference): ThemePreference {
  return cycleThemePreference(current)
}
