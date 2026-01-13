export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName?: string;
  maxWeight: number | null;
  maxWeightReps: number | null;
  maxWeightAchievedAt: string | null;
  maxVolume: number | null;
  maxVolumeWeight: number | null;
  maxVolumeReps: number | null;
  maxVolumeAchievedAt: string | null;
  exercise?: {
    id: string;
    name: string;
    muscleGroup?: string;
  };
}

export interface PrCelebrationData {
  exerciseName: string;
  weight: number;
  reps: number;
  type: 'weight' | 'volume' | 'both';
}

export interface CheckPrResult {
  isNewPR: boolean;
  type: 'weight' | 'volume' | 'both' | null;
  exerciseName?: string;
  newWeight?: number;
  newVolume?: number;
}

export const PR_BADGE_THRESHOLDS = [5, 10, 25, 50, 100] as const;

export type PrBadgeLevel = (typeof PR_BADGE_THRESHOLDS)[number];

export interface PrBadge {
  level: PrBadgeLevel;
  label: string;
  icon: string;
  achieved: boolean;
}

export const PR_BADGES: Omit<PrBadge, 'achieved'>[] = [
  { level: 5, label: 'Novato', icon: 'medal' },
  { level: 10, label: 'Dedicado', icon: 'award' },
  { level: 25, label: 'Veterano', icon: 'trophy' },
  { level: 50, label: 'Élite', icon: 'crown' },
  { level: 100, label: 'Leyenda', icon: 'flame' },
];
