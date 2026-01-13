export interface ExerciseProgressPoint {
  date: string;
  maxWeight: number;
  maxVolume: number;
  totalSets: number;
  avgReps: number;
}

export interface ExerciseProgressSummary {
  startWeight: number | null;
  currentWeight: number | null;
  weightChange: number;
  weightChangePercent: number;
  totalWorkouts: number;
  isStagnant: boolean;
  stagnantWeeks: number;
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  dataPoints: ExerciseProgressPoint[];
  summary: ExerciseProgressSummary;
}

export interface VolumeDataPoint {
  date: string;
  volume: number;
  workoutCount: number;
}

export interface MuscleGroupVolume {
  muscleGroupId: string | null;
  muscleGroupName: string;
  volume: number;
  percentage: number;
}

export interface VolumeStats {
  totalVolume: number;
  avgVolumePerWorkout: number;
  avgVolumePerDay: number;
  dataPoints: VolumeDataPoint[];
  byMuscleGroup: MuscleGroupVolume[];
}

export interface MonthStats {
  totalWorkouts: number;
  totalVolume: number;
  totalSets: number;
  avgWorkoutDuration: number;
  personalRecords: number;
  uniqueExercises: number;
}

export interface MonthlyChanges {
  workoutsChange: number;
  workoutsChangePercent: number;
  volumeChange: number;
  volumeChangePercent: number;
  setsChange: number;
  setsChangePercent: number;
}

export interface MonthlyComparison {
  currentMonth: MonthStats;
  previousMonth: MonthStats;
  changes: MonthlyChanges;
}

export interface StatsQuery {
  startDate?: string;
  endDate?: string;
}
