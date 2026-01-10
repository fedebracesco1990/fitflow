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
