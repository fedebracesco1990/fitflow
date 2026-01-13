export class ExerciseProgressPointDto {
  date: string;
  maxWeight: number;
  maxVolume: number;
  totalSets: number;
  avgReps: number;
}

export class ExerciseProgressDto {
  exerciseId: string;
  exerciseName: string;
  dataPoints: ExerciseProgressPointDto[];
  summary: {
    startWeight: number | null;
    currentWeight: number | null;
    weightChange: number;
    weightChangePercent: number;
    totalWorkouts: number;
    isStagnant: boolean;
    stagnantWeeks: number;
  };
}
