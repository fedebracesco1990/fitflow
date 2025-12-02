export interface MuscleGroup {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
}

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export const DifficultyLabels: Record<Difficulty, string> = {
  [Difficulty.BEGINNER]: 'Principiante',
  [Difficulty.INTERMEDIATE]: 'Intermedio',
  [Difficulty.ADVANCED]: 'Avanzado',
};

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscleGroupId: string | null;
  muscleGroup: MuscleGroup | null;
  difficulty: Difficulty;
  videoUrl: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseDto {
  name: string;
  description?: string;
  muscleGroupId: string;
  difficulty?: Difficulty;
  videoUrl?: string;
  imageUrl?: string;
}

export type UpdateExerciseDto = Partial<CreateExerciseDto> & {
  isActive?: boolean;
};
