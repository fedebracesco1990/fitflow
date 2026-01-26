import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Routine,
  CreateRoutineDto,
  UpdateRoutineDto,
  AddExerciseDto,
  UpdateRoutineExerciseDto,
  RoutineExercise,
  SaveAsTemplateDto,
  CreateFromTemplateDto,
  FilterTemplatesParams,
  RoutineType,
  ProgramRoutine,
  AddRoutineToProgramDto,
} from '../models';
import { PaginatedResponse } from '../models/api-response.model';

export interface RoutinesPaginationParams {
  page?: number;
  limit?: number;
  includeInactive?: boolean;
  type?: RoutineType;
}

@Injectable({
  providedIn: 'root',
})
export class RoutinesService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'routines';

  getAll(params?: RoutinesPaginationParams): Observable<PaginatedResponse<Routine>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.includeInactive) queryParams.set('includeInactive', 'true');
    if (params?.type) queryParams.set('type', params.type);

    const query = queryParams.toString();
    const url = query ? `${this.endpoint}?${query}` : this.endpoint;

    return this.api.get<PaginatedResponse<Routine>>(url);
  }

  getById(id: string): Observable<Routine> {
    return this.api.get<Routine>(`${this.endpoint}/${id}`);
  }

  create(data: CreateRoutineDto): Observable<Routine> {
    return this.api.post<Routine>(this.endpoint, data);
  }

  update(id: string, data: UpdateRoutineDto): Observable<Routine> {
    return this.api.patch<Routine>(`${this.endpoint}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  // Ejercicios de rutina
  addExercise(routineId: string, data: AddExerciseDto): Observable<RoutineExercise> {
    return this.api.post<RoutineExercise>(`${this.endpoint}/${routineId}/exercises`, data);
  }

  updateExercise(
    routineId: string,
    exerciseId: string,
    data: UpdateRoutineExerciseDto
  ): Observable<RoutineExercise> {
    return this.api.patch<RoutineExercise>(
      `${this.endpoint}/${routineId}/exercises/${exerciseId}`,
      data
    );
  }

  removeExercise(routineId: string, exerciseId: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${routineId}/exercises/${exerciseId}`);
  }

  // Template methods
  getTemplates(params?: FilterTemplatesParams): Observable<PaginatedResponse<Routine>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.category) queryParams.set('category', params.category);

    const query = queryParams.toString();
    const url = query ? `${this.endpoint}/templates?${query}` : `${this.endpoint}/templates`;

    return this.api.get<PaginatedResponse<Routine>>(url);
  }

  saveAsTemplate(routineId: string, data: SaveAsTemplateDto): Observable<Routine> {
    return this.api.post<Routine>(`${this.endpoint}/${routineId}/save-as-template`, data);
  }

  createFromTemplate(templateId: string, data?: CreateFromTemplateDto): Observable<Routine> {
    return this.api.post<Routine>(`${this.endpoint}/from-template/${templateId}`, data || {});
  }

  getProgramRoutines(programId: string): Observable<ProgramRoutine[]> {
    return this.api.get<ProgramRoutine[]>(`${this.endpoint}/${programId}/daily-routines`);
  }

  addRoutineToProgram(programId: string, data: AddRoutineToProgramDto): Observable<ProgramRoutine> {
    return this.api.post<ProgramRoutine>(`${this.endpoint}/${programId}/daily-routines`, data);
  }

  removeRoutineFromProgram(
    programId: string,
    routineId: string,
    dayNumber: number
  ): Observable<void> {
    return this.api.delete<void>(
      `${this.endpoint}/${programId}/daily-routines/${routineId}?dayNumber=${dayNumber}`
    );
  }
}
