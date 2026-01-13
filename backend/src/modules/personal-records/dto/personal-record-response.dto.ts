export class PersonalRecordResponseDto {
  id: string;
  exerciseId: string;
  exerciseName: string;
  maxWeight: number | null;
  maxWeightReps: number | null;
  maxWeightAchievedAt: Date | null;
  maxVolume: number | null;
  maxVolumeWeight: number | null;
  maxVolumeReps: number | null;
  maxVolumeAchievedAt: Date | null;
}

export class CheckPRResultDto {
  isNewPR: boolean;
  type: 'weight' | 'volume' | 'both' | null;
  exerciseName?: string;
  newWeight?: number;
  newVolume?: number;
}
