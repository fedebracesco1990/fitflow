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
