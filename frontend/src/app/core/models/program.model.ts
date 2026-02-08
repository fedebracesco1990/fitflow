import { UserProgramRoutine, UserProgramExercise } from './workout.model';
import { Difficulty } from './exercise.model';

export interface UserProgram {
  id: string;
  userId: string;
  programId: string;
  programName: string;
  assignedAt: string;
  endDate: string | null;
  isActive: boolean;
  routines: UserProgramRoutine[];
}

export interface MyProgramResponse {
  id: string;
  userId: string;
  programId: string;
  programName: string;
  assignedAt: string;
  endDate: string | null;
  isActive: boolean;
  routines: UserProgramRoutine[];
}

export interface MyRoutineResponse {
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

export interface AssignProgramDto {
  userId: string;
  programId: string;
  assignedAt?: string;
}

export interface CreateProgramRoutineDto {
  routineId: string;
  order: number;
}

export interface CreateProgramDto {
  name: string;
  description?: string;
  difficulty?: Difficulty;
  routines: CreateProgramRoutineDto[];
}

export interface ProgramRoutine {
  id: string;
  programId: string;
  routineId: string;
  order: number;
  routine: {
    id: string;
    name: string;
    description: string | null;
    difficulty: Difficulty;
    estimatedDuration: number;
    exercises?: { id: string }[];
  };
}

export interface Program {
  id: string;
  name: string;
  description: string | null;
  difficulty: Difficulty;
  createdById: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  routines?: ProgramRoutine[];
}
