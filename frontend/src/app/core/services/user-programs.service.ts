import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  UserProgram,
  MyProgramResponse,
  MyRoutineResponse,
  AssignProgramDto,
  CreateProgramDto,
  Program,
} from '../models';

export type {
  UserProgram,
  MyProgramResponse,
  MyRoutineResponse,
  AssignProgramDto,
  CreateProgramDto,
  Program,
};

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

  getActiveByUser(userId: string): Observable<UserProgram | null> {
    return this.api.get<UserProgram | null>(`${this.endpoint}/user/${userId}/active`);
  }

  getUserProgramHistory(userId: string): Observable<UserProgram[]> {
    return this.api.get<UserProgram[]>(`${this.endpoint}/user/${userId}/history`);
  }
}
