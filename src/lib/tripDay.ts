import { differenceInCalendarDays, startOfDay } from "date-fns";

export function getTripTotalDays(startDate: Date, endDate: Date): number {
  return differenceInCalendarDays(startOfDay(endDate), startOfDay(startDate)) + 1;
}

/**
 * Day number relative to the trip start date.
 * - Trip start date => 1
 * - One day before start => 0 (D-1)
 * - Two days before start => -1 (D-2)
 */
export function getTripRelativeDayNumber(targetDate: Date, tripStartDate: Date): number {
  return differenceInCalendarDays(startOfDay(targetDate), startOfDay(tripStartDate)) + 1;
}

export function clampDayNumber(dayNumber: number, totalDays: number): number {
  if (totalDays <= 0) return Math.max(dayNumber, 1);
  return Math.min(Math.max(dayNumber, 1), totalDays);
}

