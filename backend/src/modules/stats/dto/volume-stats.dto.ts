export class VolumeDataPointDto {
  date: string;
  volume: number;
  workoutCount: number;
}

export class VolumeStatsDto {
  totalVolume: number;
  avgVolumePerWorkout: number;
  avgVolumePerDay: number;
  dataPoints: VolumeDataPointDto[];
  byMuscleGroup: {
    muscleGroupId: string | null;
    muscleGroupName: string;
    volume: number;
    percentage: number;
  }[];
}
