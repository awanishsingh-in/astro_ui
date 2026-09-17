/**
 * TypeScript mirror of the CSS design tokens.
 *
 * CSS is the source of truth (`src/styles/tokens.css`). This file exists only
 * because SVG attributes and Recharts props need literal JS values — they
 * cannot take a Tailwind class. Keep the two in step; nothing else should
 * reach for a raw hex.
 *
 * Palette: Astrovate (deep space + copper + warm white).
 */

/** Raw Astrovate swatches — prefer semantic `color.*` aliases in UI code. */
export const astrovate = {
  deepSpace: '#0F0B19',
  darkPurple: '#1B101D',
  deepBurgundy: '#2E1623',
  nebulaPlum: '#36232E',
  darkMauve: '#44333C',
  mutedPlum: '#5C4750',

  copperShadow: '#7D4835',
  copper: '#DC844F',
  lightCopper: '#E3B08A',
  paleCopper: '#F2D7C7',

  warmWhite: '#FDF8F4',
  paleRose: '#D2C1C4',
  lavenderGray: '#A097A7',
  grayPurple: '#7A6E74',
} as const

export const color = {
  navy: astrovate.copper,
  navyHover: astrovate.lightCopper,
  navySoft: astrovate.deepBurgundy,

  gold: astrovate.copper,
  goldDeep: astrovate.copper,
  goldSoft: astrovate.deepBurgundy,
  goldBorder: astrovate.copperShadow,

  ink: astrovate.warmWhite,
  purple: astrovate.paleRose,
  muted: astrovate.lavenderGray,
  faint: astrovate.grayPurple,

  canvas: astrovate.deepSpace,
  surface: astrovate.darkPurple,
  surfaceRaised: astrovate.nebulaPlum,
  surfaceSunken: astrovate.deepSpace,
  border: astrovate.darkMauve,
  borderStrong: astrovate.mutedPlum,

  positive: '#8FBF9A',
  caution: astrovate.copper,
  critical: '#D4848A',

  chartLine: astrovate.paleRose,
  chartRim: astrovate.copper,
  chartHighlight: astrovate.deepBurgundy,
  chartField: astrovate.darkPurple,

  midnight: astrovate.deepSpace,
  indigoDeep: astrovate.darkPurple,
  indigoRoyal: astrovate.deepBurgundy,
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
