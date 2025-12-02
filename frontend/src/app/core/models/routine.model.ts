import { Difficulty, Exercise } from './exercise.model';
import { User } from './user.model';

export interface RoutineExercise {
  id: string;
  routineId: string;
  exerciseId: string;
  exercise: Exercise;
  order: number;
  sets: number;
  reps: number;
  restSeconds: number;
  notes: string | null;
}

export interface Routine {
  id: string;
  createdById: string;
  createdBy: User | null;
  name: string;
  description: string | null;
  difficulty: Difficulty;
  estimatedDuration: number;
  isActive: boolean;
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoutineDto {
  name: string;
  description?: string;
  difficulty?: Difficulty;
  estimatedDuration?: number;
}

export type UpdateRoutineDto = Partial<CreateRoutineDto> & {
  isActive?: boolean;
};

export interface AddExerciseDto {
  exerciseId: string;
  order?: number;
  sets?: number;
  reps?: number;
  restSeconds?: number;
  notes?: string;
}

export interface UpdateRoutineExerciseDto {
  order?: number;
  sets?: number;
  reps?: number;
  restSeconds?: number;
  notes?: string;
}

// Días de la semana
export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

export const DayOfWeekLabels: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: 'Lunes',
  [DayOfWeek.TUESDAY]: 'Martes',
  [DayOfWeek.WEDNESDAY]: 'Miércoles',
  [DayOfWeek.THURSDAY]: 'Jueves',
  [DayOfWeek.FRIDAY]: 'Viernes',
  [DayOfWeek.SATURDAY]: 'Sábado',
  [DayOfWeek.SUNDAY]: 'Domingo',
};

export interface UserRoutine {
  id: string;
  userId: string;
  routineId: string;
  routine: Routine;
  dayOfWeek: DayOfWeek;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AssignRoutineDto {
  userId: string;
  routineId: string;
  dayOfWeek: DayOfWeek;
  startDate: string;
  endDate?: string;
}
