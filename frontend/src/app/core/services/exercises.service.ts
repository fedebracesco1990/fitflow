import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Exercise, CreateExerciseDto, UpdateExerciseDto } from '../models';
import { PaginatedResponse } from '../models/api-response.model';

export interface ExercisesPaginationParams {
  page?: number;
  limit?: number;
  includeInactive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ExercisesService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'exercises';

  getAll(params?: ExercisesPaginationParams): Observable<PaginatedResponse<Exercise>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.includeInactive) queryParams.set('includeInactive', 'true');

    const query = queryParams.toString();
    const url = query ? `${this.endpoint}?${query}` : this.endpoint;

    return this.api.get<PaginatedResponse<Exercise>>(url);
  }

  getByMuscleGroup(muscleGroup: string): Observable<Exercise[]> {
    return this.api.get<Exercise[]>(`${this.endpoint}/muscle-group/${muscleGroup}`);
  }

  getById(id: string): Observable<Exercise> {
    return this.api.get<Exercise>(`${this.endpoint}/${id}`);
  }

  create(data: CreateExerciseDto): Observable<Exercise> {
    return this.api.post<Exercise>(this.endpoint, data);
  }

  update(id: string, data: UpdateExerciseDto): Observable<Exercise> {
    return this.api.patch<Exercise>(`${this.endpoint}/${id}`, data);
  }

  deactivate(id: string): Observable<Exercise> {
    return this.api.patch<Exercise>(`${this.endpoint}/${id}/deactivate`, {});
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
