import type { User } from '@/types/user'

/**
 * Mock account. Matches the person in the flow reference so every screen reads
 * coherently during development. Replaced by `GET /me` later.
 */
export const mockUser: User = {
  id: 'usr_01',
  fullName: 'Pallavi Satish',
  phone: '+919876543210',
  initials: 'PS',
  birthDetails: {
    fullName: 'Pallavi Satish',
    date: '1994-09-02',
    time: '06:40',
    gender: 'female',
    place: {
      label: 'Bilaspur, Chhattisgarh',
      latitude: 22.0797,
      longitude: 82.1409,
      timeZone: 'Asia/Kolkata',
    },
  },
  language: 'en',
  notifications: { enabled: true, time: '08:00' },
}
