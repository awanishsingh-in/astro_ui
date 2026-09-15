import type { ProgressStep } from '@/components/common/ProgressIndicator'

/**
 * The three steps of signup, shown in the desktop panel and the mobile bar.
 * Sign-in shows only the first two — nothing is re-entered for a returning
 * account, so there is no third step to promise.
 */
export const SIGNUP_STEPS: ProgressStep[] = [
  { id: 'phone', label: 'Confirm your mobile number' },
  { id: 'code', label: 'Enter the 6-digit code' },
  { id: 'birth', label: 'Add your birth details' },
]

export const SIGNIN_STEPS: ProgressStep[] = [
  { id: 'phone', label: 'Confirm your mobile number' },
  { id: 'code', label: 'Enter the 6-digit code' },
]

export const SIGNUP_PANEL_TITLE = 'Three steps and your chart is calculated.'
export const SIGNIN_PANEL_TITLE = 'Welcome back. Two steps and you are in.'

/** Why we ask — shown under the steps on desktop. */
export const PANEL_BODY =
  'Your number identifies your account. Your birth date, time and place are used to calculate the chart and nothing else.'
