import { Difficulty, Exercise } from './exercise.model';
import { User } from './user.model';

export enum RoutineType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

export const RoutineTypeLabels: Record<RoutineType, string> = {
  [RoutineType.DAILY]: 'Rutina Diaria',
  [RoutineType.WEEKLY]: 'Programa Semanal',
};

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
  suggestedWeight: number | null;
  dayOfWeek: DayOfWeek | null;
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
  type: RoutineType;
  exercises: RoutineExercise[];
  programRoutines?: ProgramRoutine[];
  createdAt: string;
  updatedAt: string;
}

export interface ProgramRoutine {
  id: string;
  programId: string;
  routineId: string;
  routine: Routine;
  dayNumber: number;
  order: number;
  createdAt: string;
}

export interface CreateRoutineDto {
  name: string;
  description?: string;
  difficulty?: Difficulty;
  estimatedDuration?: number;
  type?: RoutineType;
}

export interface AddRoutineToProgramDto {
  routineId: string;
  dayNumber: number;
  order?: number;
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
  suggestedWeight?: number;
  dayOfWeek?: DayOfWeek;
}

export interface UpdateRoutineExerciseDto {
  order?: number;
  sets?: number;
  reps?: number;
  restSeconds?: number;
  notes?: string;
  suggestedWeight?: number;
  dayOfWeek?: DayOfWeek;
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

// Template Categories
export enum TemplateCategory {
  STRENGTH = 'strength',
  HYPERTROPHY = 'hypertrophy',
  ENDURANCE = 'endurance',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  FUNCTIONAL = 'functional',
  FULL_BODY = 'full_body',
}

export const TemplateCategoryLabels: Record<TemplateCategory, string> = {
  [TemplateCategory.STRENGTH]: 'Fuerza',
  [TemplateCategory.HYPERTROPHY]: 'Hipertrofia',
  [TemplateCategory.ENDURANCE]: 'Resistencia',
  [TemplateCategory.CARDIO]: 'Cardio',
  [TemplateCategory.FLEXIBILITY]: 'Flexibilidad',
  [TemplateCategory.FUNCTIONAL]: 'Funcional',
  [TemplateCategory.FULL_BODY]: 'Cuerpo Completo',
};

export interface SaveAsTemplateDto {
  category: TemplateCategory;
  name?: string;
}

export interface CreateFromTemplateDto {
  name?: string;
  description?: string;
}

export interface FilterTemplatesParams {
  page?: number;
  limit?: number;
  category?: TemplateCategory;
}

export interface UserDayAssignment {
  userId: string;
  dayOfWeek: DayOfWeek;
}

export interface BulkAssignRoutineDto {
  routineId: string;
  assignments: UserDayAssignment[];
  startDate: string;
}

export interface BulkAssignResult {
  success: boolean;
  totalAssigned: number;
  totalNotifications: number;
  errors: string[];
}

export interface ExerciseSetHistory {
  setNumber: number;
  weight: number | null;
  reps: number;
  completed: boolean;
}

export interface ExerciseWithHistory {
  id: string;
  routineId: string;
  exerciseId: string;
  exercise: {
    id: string;
    name: string;
    description: string | null;
    muscleGroupId: string | null;
    imageUrl: string | null;
    videoUrl: string | null;
  };
  order: number;
  sets: number;
  reps: number;
  restSeconds: number;
  notes: string | null;
  suggestedWeight: number | null;
  dayOfWeek: DayOfWeek | null;
  lastWorkout: {
    date: string;
    sets: ExerciseSetHistory[];
  } | null;
}

export interface TodayRoutineResponse {
  userRoutine: {
    id: string;
    dayOfWeek: DayOfWeek;
    startDate: string;
    isActive: boolean;
  };
  routine: {
    id: string;
    name: string;
    description: string | null;
    difficulty: string;
    estimatedDuration: number;
  };
  exercises: ExerciseWithHistory[];
  dayOfWeek: DayOfWeek;
  hasHistory: boolean;
}

export interface RoutineHistoryItem {
  id: string;
  routineId: string;
  routineName: string;
  routineDescription: string | null;
  dayOfWeek: DayOfWeek;
  startDate: string;
  endDate: string | null;
  durationDays: number | null;
  workoutsCompleted: number;
}

export interface RoutineHistoryResponse {
  userId: string;
  totalRoutines: number;
  history: RoutineHistoryItem[];
}
