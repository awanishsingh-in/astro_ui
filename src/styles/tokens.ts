/**
 * TypeScript mirror of the CSS design tokens.
 *
 * CSS is the source of truth (`src/styles/tokens.css`). This file exists only
 * because SVG attributes and Recharts props need literal JS values — they
 * cannot take a Tailwind class. Keep the two in step; nothing else should
 * reach for a raw hex.
 */

export const color = {
  navy: '#8E82D8',
  navyHover: '#A399E4',
  navySoft: '#1E1B38',

  gold: '#C9A96E',
  goldDeep: '#C9A96E',
  goldSoft: '#2A2414',
  goldBorder: '#5C4C2E',

  ink: '#F5F2FF',
  purple: '#B6B1CE',
  muted: '#77728F',
  faint: '#5C5774',

  canvas: '#080711',
  surface: '#14132A',
  surfaceSunken: '#111022',
  border: '#2E2A4A',
  borderStrong: '#3F3A5E',

  positive: '#7ECFA0',
  caution: '#C9A96E',
  critical: '#E89A9A',

  chartLine: '#B6B1CE',
  chartRim: '#C9A96E',
  chartHighlight: '#2A2414',
  chartField: '#181633',
} as const

export const font = {
  sans: "'Manrope', 'Noto Sans Devanagari', ui-sans-serif, system-ui, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
  serif: "'Cormorant Garamond', ui-serif, Georgia, 'Times New Roman', serif",
} as const

export const radius = {
  xs: 4,
  control: 6,
  card: 8,
  panel: 10,
  sheet: 16,
} as const

/** Breakpoints in px — must match `--breakpoint-*` in tokens.css. */
export const breakpoint = {
  xs: 360,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1440,
} as const

export type Breakpoint = keyof typeof breakpoint
