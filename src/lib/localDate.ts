import { format } from "date-fns";

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Convert a Date to a local calendar date string (yyyy-MM-dd).
 * Avoids UTC-based truncation like `toISOString().split("T")[0]`.
 */
export function formatLocalDateYYYYMMDD(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Parse an ISO string into a Date in a timezone-safe way for "date-only" values.
 *
 * - For "YYYY-MM-DD": returns a Date at local midnight (new Date(y, m-1, d)).
 *   This avoids the common "previous day" bug in negative timezones.
 * - For other ISO strings: falls back to the built-in Date parsing.
 */
export function parseIsoToLocalDate(value: string): Date {
  if (DATE_ONLY_REGEX.test(value)) {
    const [y, m, d] = value.split("-").map((v) => Number(v));
    return new Date(y, m - 1, d);
  }
  return new Date(value);
}

export function todayLocalDateYYYYMMDD(): string {
  return formatLocalDateYYYYMMDD(new Date());
}

/**
 * Parse a stored date value into a local-midnight Date safely, regardless of
 * whether it was stored as "YYYY-MM-DD" (preferred) or as a legacy datetime
 * ISO string (e.g. "2026-05-21T04:00:00.000Z").
 *
 * Strategy:
 * - "YYYY-MM-DD"           => local midnight of that calendar date
 * - datetime ISO string    => use the UTC calendar date (treated as the user's
 *                             intended day), then map to local midnight.
 *
 * This way, both new data and legacy data display the user's intended day
 * regardless of the device timezone.
 */
export function parseStoredDateToLocal(value: string | Date): Date {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  if (DATE_ONLY_REGEX.test(value)) {
    const [y, m, d] = value.split("-").map((v) => Number(v));
    return new Date(y, m - 1, d);
  }
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return dt;
  return new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
}

