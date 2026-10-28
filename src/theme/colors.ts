/**
 * Cyklos — Astrovate premium finish
 * Deep space + magenta nebula + silver chrome + satin rose-gold (rare).
 */

export const bg = {
  void: '#08060F',
  deep: '#0F0B19',
  plum: '#1B101D',
} as const

export const surface = {
  s1: '#1A1220',
  s2: '#241827',
  s3: '#2E1F30',
} as const

export const nebula = {
  core: '#B8327A',
  mid: '#7A1F57',
  deep: '#3D1233',
  spark: '#FF8AC2',
} as const

export const silver = {
  s100: '#FFFFFF',
  s200: '#EDE6EF',
  s300: '#C9C0CF',
  s400: '#A097A7',
  s500: '#6E6577',
} as const

/** Satin rose-gold — muted, slightly pink, never orange plastic. */
export const rg = {
  50: '#FBEFE6',
  100: '#F3D9C4',
  200: '#E6BC9F',
  300: '#D4A081',
  400: '#BF8466',
  500: '#9E6650',
  600: '#6E4234',
  ink: '#2A1418',
} as const

/** @deprecated Use `rg` — kept as alias for existing imports. */
export const copper = {
  hi: rg[50],
  light: rg[100],
  primary: rg[400],
  mid: rg[500],
  dark: rg[600],
  pale: rg[50],
  shadow: rg[600],
} as const

export const text = {
  primary: '#FBF7F5',
  secondary: '#B8AEBF',
  muted: '#7D7385',
} as const

export const hairline = {
  default: 'rgba(237,230,239,0.10)',
  strong: 'rgba(237,230,239,0.22)',
} as const
