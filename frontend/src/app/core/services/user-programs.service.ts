import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { UserProgramRoutine, UserProgramExercise } from '../models/workout.model';
import { Difficulty } from '../models';

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

@Injectable({
  providedIn: 'root',
})
export class UserProgramsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'programs';

  // Program CRUD
  create(data: CreateProgramDto): Observable<Program> {
    return this.api.post<Program>(this.endpoint, data);
  }

  update(id: string, data: CreateProgramDto): Observable<Program> {
    return this.api.put<Program>(`${this.endpoint}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getAll(): Observable<Program[]> {
    return this.api.get<Program[]>(this.endpoint);
  }

  getById(id: string): Observable<Program> {
    return this.api.get<Program>(`${this.endpoint}/${id}`);
  }

  // User program methods
  getMyProgram(): Observable<MyProgramResponse | null> {
    return this.api.get<MyProgramResponse | null>(`${this.endpoint}/my-program`);
  }

  getMyRoutine(routineId: string): Observable<MyRoutineResponse> {
    return this.api.get<MyRoutineResponse>(`${this.endpoint}/my-program/routines/${routineId}`);
  }

  assign(data: AssignProgramDto): Observable<UserProgram> {
    return this.api.post<UserProgram>(`${this.endpoint}/assign`, data);
  }
}
