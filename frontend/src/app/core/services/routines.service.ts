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
  RoutineType,
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

  replaceExercises(routineId: string, exercises: AddExerciseDto[]): Observable<RoutineExercise[]> {
    return this.api.patch<RoutineExercise[]>(`${this.endpoint}/${routineId}/exercises`, {
      exercises,
    });
  }
}
