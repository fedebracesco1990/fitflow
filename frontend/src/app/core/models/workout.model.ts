import { Exercise } from './exercise.model';

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

export interface ExerciseLog {
  id: string;
  workoutLogId: string;
  exerciseId: string;
  exercise: Exercise;
  setNumber: number;
  reps: number;
  weight: number | null;
  completed: boolean;
  notes: string | null;
  rir: number | null;
  rpe: number | null;
}

export interface UserProgramRoutine {
  id: string;
  userProgramId: string;
  originalRoutineId: string;
  name: string;
  description: string | null;
  order: number;
  estimatedDuration: number;
  lastCompletedAt: string | null;
  exercises: UserProgramExercise[];
}

export interface UserProgramExercise {
  id: string;
  userProgramRoutineId: string;
  exerciseId: string;
  exercise: Exercise;
  order: number;
  sets: number;
  reps: number;
  restSeconds: number | null;
  weight: number | null;
}

export interface WorkoutLog {
  id: string;
  userProgramRoutineId: string;
  userProgramRoutine: UserProgramRoutine;
  startedAt: string;
  finishedAt: string | null;
  status: WorkoutStatus;
  duration: number | null;
  notes: string | null;
  exerciseLogs: ExerciseLog[];
  createdAt: string;
}

export interface UpdateWorkoutDto {
  status?: WorkoutStatus;
  duration?: number;
  notes?: string;
}

export interface UpdateExerciseLogDto {
  reps?: number;
  weight?: number;
  completed?: boolean;
  notes?: string;
  rir?: number;
  rpe?: number;
}
