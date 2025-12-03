import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  WorkoutLog,
  CreateWorkoutDto,
  UpdateWorkoutDto,
  ExerciseLog,
  LogExerciseDto,
  UpdateExerciseLogDto,
} from '../models';
import { PaginatedResponse } from '../models/api-response.model';

export interface WorkoutsPaginationParams {
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class WorkoutsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'workouts';

  create(data: CreateWorkoutDto): Observable<WorkoutLog> {
    return this.api.post<WorkoutLog>(this.endpoint, data);
  }

  getMyHistory(params?: WorkoutsPaginationParams): Observable<PaginatedResponse<WorkoutLog>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const query = queryParams.toString();
    const url = query ? `${this.endpoint}/my-history?${query}` : `${this.endpoint}/my-history`;

    return this.api.get<PaginatedResponse<WorkoutLog>>(url);
  }

  getById(id: string): Observable<WorkoutLog> {
    return this.api.get<WorkoutLog>(`${this.endpoint}/${id}`);
  }

  update(id: string, data: UpdateWorkoutDto): Observable<WorkoutLog> {
    return this.api.patch<WorkoutLog>(`${this.endpoint}/${id}`, data);
  }

  start(id: string): Observable<WorkoutLog> {
    return this.api.patch<WorkoutLog>(`${this.endpoint}/${id}/start`, {});
  }

  complete(id: string, duration?: number): Observable<WorkoutLog> {
    return this.api.patch<WorkoutLog>(`${this.endpoint}/${id}/complete`, { duration });
  }

  // Logs de ejercicios
  logExercise(workoutId: string, data: LogExerciseDto): Observable<ExerciseLog> {
    return this.api.post<ExerciseLog>(`${this.endpoint}/${workoutId}/exercises`, data);
  }

  getExerciseLogs(workoutId: string): Observable<ExerciseLog[]> {
    return this.api.get<ExerciseLog[]>(`${this.endpoint}/${workoutId}/exercises`);
  }

  updateExerciseLog(
    workoutId: string,
    logId: string,
    data: UpdateExerciseLogDto
  ): Observable<ExerciseLog> {
    return this.api.patch<ExerciseLog>(`${this.endpoint}/${workoutId}/exercises/${logId}`, data);
  }
}
