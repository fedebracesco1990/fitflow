import { DayOfWeek } from '../../../common/enums/day-of-week.enum';

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
    startDate: Date;
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
