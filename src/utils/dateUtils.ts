/**
 * Centralized date/time utilities
 * Used across booking, availability, and dashboard components
 */
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  parse,
  isWithinInterval,
} from "date-fns";

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string,
  formatStr: string = "MMM dd, yyyy"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format time for display
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Format time range
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

/**
 * Get week dates starting from a date
 */
export function getWeekDates(startDate: Date, count: number = 7): Date[] {
  return Array.from({ length: count }, (_, i) => addDays(startDate, i));
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Get day name
 */
export function getDayName(date: Date, short: boolean = false): string {
  return format(date, short ? "EEE" : "EEEE");
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

/**
 * Combine date and time strings
 */
export function combineDateAndTime(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}

/**
 * Check if a date/time is within a date range
 */
export function isWithinDateRange(
  date: string,
  time: string,
  range: "today" | "week" | "month" | "all"
): boolean {
  if (range === "all") return true;

  const sessionDate = combineDateAndTime(date, time);
  const now = new Date();

  let endDate: Date;
  switch (range) {
    case "today":
      endDate = addDays(now, 1);
      break;
    case "week":
      endDate = addDays(now, 7);
      break;
    case "month":
      endDate = addDays(now, 30);
      break;
    default:
      return true;
  }

  return isWithinInterval(sessionDate, { start: now, end: endDate });
}

/**
 * Get date range for statistics
 */
export function getDateRangeForPeriod(
  period: "all" | "week" | "month"
): { start: Date; end: Date } | null {
  if (period === "all") return null;

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (period === "week") {
    start.setDate(start.getDate() - 7);
  } else if (period === "month") {
    start.setDate(start.getDate() - 30);
  }

  return { start, end };
}

/**
 * Convert minutes to hours and minutes display
 */
export function minutesToDisplay(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Check if time slot is in the past
 */
export function isTimeSlotPast(date: Date, time: string): boolean {
  const slotDateTime = combineDateAndTime(format(date, "yyyy-MM-dd"), time);
  return slotDateTime < new Date();
}

/**
 * Generate time slots for a day
 */
export function generateTimeSlots(
  startHour: number = 9,
  endHour: number = 17,
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const timeStr = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      slots.push(timeStr);
    }
  }

  return slots;
}

/**
 * Get time until a date/time
 */
export function getTimeUntil(date: string, time: string): string {
  const targetDate = combineDateAndTime(date, time);
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff < 0) return "Past";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
}

/**
 * Check if a datetime is within N hours from now
 */
export function isWithinHours(
  date: string,
  time: string,
  hours: number
): boolean {
  const targetDate = combineDateAndTime(date, time);
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  const hoursDiff = diff / (1000 * 60 * 60);
  return hoursDiff > 0 && hoursDiff <= hours;
}
