/** Free accounts may save this many charts beyond the primary (self) profile. */
export const FREE_ADDITIONAL_PROFILES = 2

export function canAddAdditionalProfile(savedCount: number, hasPlan: boolean): boolean {
  return hasPlan || savedCount < FREE_ADDITIONAL_PROFILES
}
