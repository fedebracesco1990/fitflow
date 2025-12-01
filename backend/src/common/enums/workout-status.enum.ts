export enum WorkoutStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

export const WorkoutStatusLabels: Record<WorkoutStatus, string> = {
  [WorkoutStatus.PENDING]: 'Pendiente',
  [WorkoutStatus.IN_PROGRESS]: 'En Progreso',
  [WorkoutStatus.COMPLETED]: 'Completado',
  [WorkoutStatus.SKIPPED]: 'Omitido',
};
