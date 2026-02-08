import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  UserRoutine,
  AssignRoutineDto,
  BulkAssignRoutineDto,
  BulkAssignResult,
  RoutineHistoryResponse,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class UserRoutinesService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'user-routines';

  assign(data: AssignRoutineDto): Observable<UserRoutine> {
    return this.api.post<UserRoutine>(this.endpoint, data);
  }

  assignBulk(data: BulkAssignRoutineDto): Observable<BulkAssignResult> {
    return this.api.post<BulkAssignResult>(`${this.endpoint}/bulk`, data);
  }

  getByUser(userId: string): Observable<UserRoutine[]> {
    return this.api.get<UserRoutine[]>(`${this.endpoint}/user/${userId}`);
  }

  getById(id: string): Observable<UserRoutine> {
    return this.api.get<UserRoutine>(`${this.endpoint}/${id}`);
  }

  deactivate(id: string): Observable<UserRoutine> {
    return this.api.patch<UserRoutine>(`${this.endpoint}/${id}/deactivate`, {});
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getMyHistory(): Observable<RoutineHistoryResponse> {
    return this.api.get<RoutineHistoryResponse>(`${this.endpoint}/my-history`);
  }
}
