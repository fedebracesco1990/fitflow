export class DayOfWeekStatsDto {
  dayOfWeek: number;
  dayName: string;
  count: number;
}

export class MonthlyAverageDto {
  month: string;
  year: number;
  totalAttendances: number;
  averagePerDay: number;
}

export class UserMonthlyCountDto {
  userId: string;
  userName: string;
  month: string;
  year: number;
  count: number;
}

export class AttendanceStatsDto {
  totalAttendances: number;
  byDayOfWeek: DayOfWeekStatsDto[];
  monthlyAverages: MonthlyAverageDto[];
  periodStart?: string;
  periodEnd?: string;
}
