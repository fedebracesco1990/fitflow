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

export enum Equipment {
  BARBELL = 'barbell',
  DUMBBELL = 'dumbbell',
  MACHINE = 'machine',
  CABLE = 'cable',
  BODYWEIGHT = 'bodyweight',
  KETTLEBELL = 'kettlebell',
  BANDS = 'bands',
  NONE = 'none',
}

export const EquipmentLabels: Record<Equipment, string> = {
  [Equipment.BARBELL]: 'Barra',
  [Equipment.DUMBBELL]: 'Mancuernas',
  [Equipment.MACHINE]: 'Máquina',
  [Equipment.CABLE]: 'Polea/Cable',
  [Equipment.BODYWEIGHT]: 'Peso Corporal',
  [Equipment.KETTLEBELL]: 'Kettlebell',
  [Equipment.BANDS]: 'Bandas Elásticas',
  [Equipment.NONE]: 'Sin Equipamiento',
};

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscleGroupId: string | null;
  muscleGroup: MuscleGroup | null;
  difficulty: Difficulty;
  equipment: Equipment;
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
  equipment?: Equipment;
  videoUrl?: string;
  imageUrl?: string;
}

export type UpdateExerciseDto = Partial<CreateExerciseDto> & {
  isActive?: boolean;
};
