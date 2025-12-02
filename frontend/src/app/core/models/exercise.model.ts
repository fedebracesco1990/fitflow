export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  BICEPS = 'biceps',
  TRICEPS = 'triceps',
  LEGS = 'legs',
  GLUTES = 'glutes',
  CORE = 'core',
  CARDIO = 'cardio',
  FULL_BODY = 'full_body',
}

export const MuscleGroupLabels: Record<MuscleGroup, string> = {
  [MuscleGroup.CHEST]: 'Pecho',
  [MuscleGroup.BACK]: 'Espalda',
  [MuscleGroup.SHOULDERS]: 'Hombros',
  [MuscleGroup.BICEPS]: 'Bíceps',
  [MuscleGroup.TRICEPS]: 'Tríceps',
  [MuscleGroup.LEGS]: 'Piernas',
  [MuscleGroup.GLUTES]: 'Glúteos',
  [MuscleGroup.CORE]: 'Core',
  [MuscleGroup.CARDIO]: 'Cardio',
  [MuscleGroup.FULL_BODY]: 'Cuerpo Completo',
};

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
  muscleGroup: MuscleGroup;
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
  muscleGroup: MuscleGroup;
  difficulty?: Difficulty;
  videoUrl?: string;
  imageUrl?: string;
}

export type UpdateExerciseDto = Partial<CreateExerciseDto> & {
  isActive?: boolean;
};
