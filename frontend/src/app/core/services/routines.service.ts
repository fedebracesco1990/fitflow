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
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class RoutinesService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'routines';

  getAll(includeInactive = false): Observable<Routine[]> {
    return this.api.get<Routine[]>(
      this.endpoint,
      includeInactive ? { includeInactive: 'true' } : undefined
    );
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
}
