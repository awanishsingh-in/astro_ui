/** Free accounts may save this many charts beyond the primary (self) profile. */
export const FREE_ADDITIONAL_PROFILES = 2

/**
 * Whether the user can add another saved chart.
 * Profile caps / Plus unlock are paused for now — anyone can add multiple profiles.
 */
export function canAddAdditionalProfile(_savedCount: number, _hasPlan: boolean): boolean {
  return true
}
