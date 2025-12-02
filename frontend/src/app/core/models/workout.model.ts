import { UserRoutine, RoutineExercise } from './routine.model';

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
  routineExerciseId: string;
  routineExercise: RoutineExercise;
  setNumber: number;
  reps: number;
  weight: number | null;
  completed: boolean;
  notes: string | null;
}

export interface WorkoutLog {
  id: string;
  userRoutineId: string;
  userRoutine: UserRoutine;
  date: string;
  status: WorkoutStatus;
  duration: number | null;
  notes: string | null;
  exerciseLogs: ExerciseLog[];
  createdAt: string;
}

export interface CreateWorkoutDto {
  userRoutineId: string;
  date: string;
  notes?: string;
}

export interface UpdateWorkoutDto {
  status?: WorkoutStatus;
  duration?: number;
  notes?: string;
}

export interface LogExerciseDto {
  routineExerciseId: string;
  setNumber: number;
  reps: number;
  weight?: number;
  completed?: boolean;
  notes?: string;
}

export interface UpdateExerciseLogDto {
  reps?: number;
  weight?: number;
  completed?: boolean;
  notes?: string;
}
