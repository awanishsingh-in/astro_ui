/**
 * Birth details are the whole account. They are entered once, and every
 * answer in the product is calculated from them.
 */
export type Gender = 'male' | 'female' | 'undisclosed'

export interface BirthDetails {
  fullName: string
  /** ISO date, e.g. "1994-09-02". */
  date: string
  /** 24h local time at the place of birth, e.g. "06:40". */
  time: string
  /** True when the user did not know their birth time. */
  timeUnknown?: boolean
  place: BirthPlace
  /** Collected at signup; optional on older saved accounts. */
  gender?: Gender
}

export const GENDER_LABEL: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
  undisclosed: 'Prefer not to disclose',
}

export interface BirthPlace {
  /** e.g. "Bilaspur, Chhattisgarh". */
  label: string
  latitude: number
  longitude: number
  /** IANA zone, e.g. "Asia/Kolkata". */
  timeZone: string
}

export type AppLanguage = 'en' | 'hi'

export interface NotificationPreference {
  enabled: boolean
  /** 24h local time, e.g. "08:00". */
  time: string
}

export interface User {
  id: string
  fullName: string
  /** E.164, e.g. "+919876543210". */
  phone: string
  /** Derived two-letter monogram for the avatar. */
  initials: string
  /** Data URL or remote URL for the profile photo. */
  photoUrl?: string | null
  birthDetails: BirthDetails
  language: AppLanguage
  notifications: NotificationPreference
}
