import { buildCalendarDay, buildMonthGrid } from '@/data/calendar-mock'
import type { CalendarDay } from '@/types/astrology'
import { mockRequest } from './client'

/** GET /calendar?year=&month= */
export function getMonthCalendar(
  year: number,
  month: number,
  signal?: AbortSignal,
): Promise<CalendarDay[]> {
  return mockRequest(() => buildMonthGrid(year, month), { delay: 180, signal })
}

/** GET /calendar/day?date=YYYY-MM-DD */
export function getCalendarDay(
  year: number,
  month: number,
  day: number,
  signal?: AbortSignal,
): Promise<CalendarDay> {
  return mockRequest(() => buildCalendarDay(year, month, day), { delay: 120, signal })
}
