import { DayOfWeek } from '../models';

/**
 * Returns the current day of week as DayOfWeek enum value
 */
export function getCurrentDayOfWeek(): DayOfWeek {
  const dayIndex = new Date().getDay();
  const days: DayOfWeek[] = [
    DayOfWeek.SUNDAY,
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
  ];
  return days[dayIndex];
}

/**
 * Formats a date string to localized short format (e.g., "15 ene 2026")
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
