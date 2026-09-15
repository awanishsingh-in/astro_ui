import { findAccount } from '@/auth/storage'
import type { BirthDetails, User } from '@/types/user'
import { initialsOf } from '@/utils/format'
import { ApiError, mockRequest } from './client'

/**
 * Mock authentication. No backend, no password — a code, exactly as the
 * product specifies.
 *
 * Each function maps to the endpoint named above it, so swapping `mockRequest`
 * for `request` is the whole migration.
 */

/** Indian mobile numbers: ten digits starting 6–9. */
export function normalisePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits
  if (!/^[6-9]\d{9}$/.test(local)) return null
  return `+91${local}`
}

export function validatePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  if (digits.length === 0) return 'Enter your mobile number.'
  if (digits.length < 10) return 'That is too short — an Indian number has 10 digits.'
  if (digits.length > 10) return 'That is too long — an Indian number has 10 digits.'
  if (!/^[6-9]/.test(digits)) return 'Indian mobile numbers start with 6, 7, 8 or 9.'
  return null
}

/** POST /auth/code */
export function sendCode(
  phone: string,
  signal?: AbortSignal,
): Promise<{ code: string; isReturning: boolean }> {
  return mockRequest(
    () => ({
      // A real backend never returns the code. The demo does, so the flow is
      // testable without an SMS gateway.
      code: String(Math.floor(100000 + Math.random() * 900000)),
      isReturning: findAccount(phone) !== null,
    }),
    { delay: 750, signal },
  )
}

/** POST /auth/verify */
export function verifyCode(
  phone: string,
  code: string,
  expected: string,
  signal?: AbortSignal,
): Promise<{ user: User | null }> {
  return mockRequest(
    () => {
      if (code !== expected) {
        throw new ApiError('That code is not right. Check it and try again.', 'INVALID_CODE', false)
      }
      return { user: findAccount(phone) }
    },
    { delay: 850, signal },
  )
}

/** POST /accounts — signup's last step, where the chart is first calculated. */
export function createAccount(
  phone: string,
  details: BirthDetails,
  signal?: AbortSignal,
): Promise<User> {
  return mockRequest<User>(
    () => ({
      id: `usr_${phone.slice(-4)}`,
      fullName: details.fullName,
      phone,
      initials: initialsOf(details.fullName),
      birthDetails: details,
      language: 'en',
      notifications: { enabled: true, time: '08:00' },
    }),
    { delay: 900, signal },
  )
}

/**
 * PATCH /me/birth-details
 *
 * The chart is recalculated from the new details; the account keeps its id, so
 * every reading already stored against it stays attached and readable.
 */
export function recalculate(
  user: User,
  details: BirthDetails,
  signal?: AbortSignal,
): Promise<User> {
  return mockRequest<User>(
    () => ({
      ...user,
      fullName: details.fullName,
      initials: initialsOf(details.fullName),
      birthDetails: details,
    }),
    { delay: 900, signal },
  )
}
