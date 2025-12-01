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
