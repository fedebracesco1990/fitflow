import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Exercise, CreateExerciseDto, UpdateExerciseDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ExercisesService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'exercises';

  getAll(includeInactive = false): Observable<Exercise[]> {
    return this.api.get<Exercise[]>(
      this.endpoint,
      includeInactive ? { includeInactive: 'true' } : undefined
    );
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
