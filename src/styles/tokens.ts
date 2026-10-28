/**
 * TypeScript mirror of Astrovate premium finish CSS tokens.
 * CSS (`src/styles/tokens.css`) is the source of truth for Tailwind.
 */

import { bg, copper, nebula, rg, silver, surface, text } from '@/theme/colors'
import { appBg, cardGlass, chromeText, rgMetal } from '@/theme/gradients'

/** Canonical Astrovate palette. */
export const cosmos = {
  bg: bg.void,
  bgSecondary: bg.deep,
  surfaceAccent: bg.plum,
  surface: surface.s1,
  surfaceMid: surface.s2,
  surfaceRaised: surface.s3,
  surfaceHigh: surface.s3,
  cardTint: surface.s3,
  border: surface.s3,

  primary: rg[400],
  primaryHover: rg[300],
  primaryPressed: rg[500],
  primarySoft: rg[50],
  brandGold: rg[200],
  accent: rg[200],
  onPrimary: rg.ink,
  secondary: rg[600],
  secondaryHover: rg[400],
  onSecondary: text.primary,

  blueDeep: nebula.deep,
  blue: nebula.core,
  blueGlow: nebula.core,
  blueLight: silver.s300,

  text: text.primary,
  textPrimary: text.primary,
  textHighlight: silver.s200,
  textSecondary: text.secondary,
  textMuted: text.muted,
  textDisabled: silver.s500,

  focusRing: 'rgba(201, 145, 115, 0.35)',
  overlay: 'rgba(8, 6, 15, 0.78)',
  success: rg[200],
  warning: rg[400],
  error: rg[600],
  info: nebula.core,

  lightCopper: rg[100],
  paleCopper: rg[50],
  starryBlue: surface.s2,
  slate: surface.s3,

  elementFire: rg[400],
  elementWater: nebula.deep,
  elementAir: silver.s300,
  elementEarth: rg[600],

  glowNebula: nebula.core,
  glowEmber: nebula.mid,
} as const

/** Dawn light — CSS `[data-theme=light]` / design/cyklos-light-reference.html. */
export const cosmosLight = {
  ...cosmos,
  bg: '#FBF9F8',
  bgSecondary: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMid: '#F7F3F2',
  surfaceRaised: '#FBF3F1',
  text: '#1F1426',
  textPrimary: '#1F1426',
  textSecondary: '#574A5E',
  textMuted: '#8C8093',
  brandGold: '#8E5236',
  accent: '#8E5236',
  onPrimary: '#FFFFFF',
  overlay: 'rgba(31, 20, 38, 0.4)',
} as const

/** @deprecated Use `cosmos`. */
export const darkSunset = cosmos

/** @deprecated Use `cosmos`. */
export const celestialGold = cosmos

export const astrovate = {
  deepSpace: bg.void,
  darkPurple: bg.deep,
  deepBurgundy: bg.plum,
  nebulaPlum: surface.s1,
  darkMauve: surface.s2,
  mutedPlum: surface.s3,
  copperShadow: copper.dark,
  copper: copper.primary,
  lightCopper: copper.light,
  paleCopper: copper.hi,
  warmWhite: text.primary,
  paleRose: silver.s200,
  lavenderGray: text.secondary,
  grayPurple: text.muted,
  nebula: nebula.core,
  ember: nebula.mid,
  rg,
} as const

export const color = {
  bg: cosmos.bg,
  surface: cosmos.surface,
  primary: cosmos.primary,
  secondary: cosmos.secondary,
  accent: cosmos.accent,
  text: cosmos.text,
  surfaceRaised: cosmos.surfaceRaised,
  border: cosmos.border,
  borderStrong: silver.s400,
  textSecondary: cosmos.textSecondary,
  textMuted: cosmos.textMuted,
  textDisabled: cosmos.textDisabled,
  onPrimary: cosmos.onPrimary,
  onSecondary: cosmos.onSecondary,
  primaryHover: cosmos.primaryHover,
  primaryPressed: cosmos.primaryPressed,
  secondaryHover: cosmos.secondaryHover,
  focusRing: cosmos.focusRing,
  overlay: cosmos.overlay,
  success: cosmos.success,
  warning: cosmos.warning,
  error: cosmos.error,
  info: cosmos.info,
  navy: cosmos.primary,
  navyHover: cosmos.primaryHover,
  navySoft: cosmos.surfaceRaised,
  gold: cosmos.primary,
  goldDeep: cosmos.primaryPressed,
  goldSoft: cosmos.surfaceRaised,
  goldBorder: cosmos.primary,
  ink: cosmos.text,
  purple: cosmos.textHighlight,
  muted: cosmos.textSecondary,
  faint: cosmos.textMuted,
  canvas: cosmos.bg,
  surfaceSunken: cosmos.bg,
  positive: cosmos.success,
  caution: cosmos.warning,
  critical: cosmos.error,
  chartLine: cosmos.textHighlight,
  chartRim: cosmos.primary,
  chartHighlight: cosmos.surfaceAccent,
  chartField: cosmos.bgSecondary,
  midnight: cosmos.bg,
  indigoDeep: cosmos.bgSecondary,
  indigoRoyal: cosmos.surfaceAccent,
  blueDeep: cosmos.blueDeep,
  blue: cosmos.blue,
  blueGlow: cosmos.blueGlow,
  blueLight: cosmos.blueLight,
} as const

export const gradient = {
  gold: rgMetal,
  hero: appBg,
  card: cardGlass,
  text: chromeText,
} as const

export const font = {
  sans: "'Manrope', 'Noto Sans Devanagari', ui-sans-serif, system-ui, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
  serif: "'Cormorant Garamond', ui-serif, Georgia, 'Times New Roman', serif",
} as const

export const radius = {
  xs: 6,
  control: 10,
  card: 16,
  panel: 24,
  sheet: 24,
} as const

export const motion = {
  ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
  fast: 150,
  base: 250,
  slow: 450,
} as const

export const breakpoint = {
  xs: 360,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1440,
} as const

export type Breakpoint = keyof typeof breakpoint
