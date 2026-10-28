import { bg, nebula, rg, silver, surface } from './colors'

/** Satin rose-gold brushed metal (diagonal, low contrast — no white blob). */
export const rgMetal = `linear-gradient(135deg,
  ${rg[100]} 0%, #E2B596 22%, #C99173 48%, #E2B596 72%, #F1D4BE 100%)`

/** Rose-gold line for text / borders. */
export const rgLine = `linear-gradient(90deg, ${rg[100]}, #C99173 50%, #F1D4BE)`

/** @deprecated Alias — primary CTA fill. */
export const glossyCopper = rgMetal

/** Silver chrome headline */
export const chromeText = `linear-gradient(180deg, ${silver.s100} 0%, #F3EEF4 35%, #BDB3C4 70%, #8E8597 100%)`

/** Rose-gold jewellery text */
export const copperText = rgLine

/** Card / panel fill */
export const cardSurface = `linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0) 35%),
  linear-gradient(160deg, #1E1524 0%, #140E1B 100%)`

/** App / hero nebula stack (no brown) */
export const appBg = `
  radial-gradient(ellipse 55% 45% at 78% 22%, rgba(184,50,122,0.38) 0%, rgba(122,31,87,0.18) 40%, transparent 70%),
  radial-gradient(ellipse 40% 35% at 90% 10%, rgba(255,138,194,0.10) 0%, transparent 60%),
  radial-gradient(ellipse 60% 40% at 15% 100%, rgba(61,18,51,0.55) 0%, transparent 70%),
  radial-gradient(ellipse 100% 80% at 50% 50%, #120C1C 0%, ${bg.void} 100%)`

export const copperSphere = `radial-gradient(circle at 32% 28%, ${rg[50]} 0%, ${rg[200]} 22%, ${rg[400]} 52%, ${rg[600]} 82%, #2A1418 100%)`

export const pearlSphere = `radial-gradient(circle at 35% 30%, #fff 0%, ${silver.s300} 45%, #4A3F55 100%)`

export const heroBase = bg.void
export const cardGlass = cardSurface
export const headlineText = chromeText
export const brandMark = rgMetal
export const metallicPlum = `linear-gradient(90deg, ${surface.s2} 0%, ${surface.s3} 35%, ${silver.s400} 50%, ${surface.s3} 65%, ${bg.plum} 100%)`
export const glossyPlum = `linear-gradient(160deg, ${surface.s3} 0%, ${surface.s2} 45%, ${bg.plum} 100%)`
export const glossyCopperPressed = `linear-gradient(135deg, ${rg[200]} 0%, ${rg[400]} 45%, ${rg[600]} 100%)`
export const copperSpecular =
  'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.02) 100%)'
export const heroNebula = appBg
export const heroFloor = `radial-gradient(ellipse 60% 40% at 15% 100%, ${nebula.deep} 0%, transparent 70%)`
export const heroEmber = `radial-gradient(ellipse 40% 30% at 90% 10%, rgba(255,138,194,0.12) 0%, transparent 60%)`
