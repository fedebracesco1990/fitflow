export class MonthlyComparisonDto {
  currentMonth: {
    totalWorkouts: number;
    totalVolume: number;
    totalSets: number;
    avgWorkoutDuration: number;
    personalRecords: number;
    uniqueExercises: number;
  };
  previousMonth: {
    totalWorkouts: number;
    totalVolume: number;
    totalSets: number;
    avgWorkoutDuration: number;
    personalRecords: number;
    uniqueExercises: number;
  };
  changes: {
    workoutsChange: number;
    workoutsChangePercent: number;
    volumeChange: number;
    volumeChangePercent: number;
    setsChange: number;
    setsChangePercent: number;
  };
}
