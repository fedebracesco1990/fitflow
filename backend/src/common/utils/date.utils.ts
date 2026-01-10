import { DayOfWeek } from '../enums/day-of-week.enum';

const DAY_INDEX_MAP: Record<number, DayOfWeek> = {
  0: DayOfWeek.SUNDAY,
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
};

export function getCurrentDayOfWeek(): DayOfWeek {
  const dayIndex = new Date().getDay();
  return DAY_INDEX_MAP[dayIndex];
}

export function getDayOfWeekFromDate(date: Date): DayOfWeek {
  return DAY_INDEX_MAP[date.getDay()];
}
