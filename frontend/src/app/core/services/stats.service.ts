import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  ExerciseProgress,
  VolumeStats,
  MonthlyComparison,
  StatsQuery,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'stats';

  getMyExerciseProgress(
    exerciseId: string,
    query?: StatsQuery
  ): Observable<ExerciseProgress> {
    const params: Record<string, string> = {};
    if (query?.startDate) params['startDate'] = query.startDate;
    if (query?.endDate) params['endDate'] = query.endDate;

    return this.api.get<ExerciseProgress>(
      `${this.endpoint}/me/progress/${exerciseId}`,
      params
    );
  }

  getMyVolumeStats(query?: StatsQuery): Observable<VolumeStats> {
    const params: Record<string, string> = {};
    if (query?.startDate) params['startDate'] = query.startDate;
    if (query?.endDate) params['endDate'] = query.endDate;

    return this.api.get<VolumeStats>(`${this.endpoint}/me/volume`, params);
  }

  getMyMonthlyComparison(): Observable<MonthlyComparison> {
    return this.api.get<MonthlyComparison>(`${this.endpoint}/me/monthly`);
  }

  getUserExerciseProgress(
    userId: string,
    exerciseId: string,
    query?: StatsQuery
  ): Observable<ExerciseProgress> {
    const params: Record<string, string> = {};
    if (query?.startDate) params['startDate'] = query.startDate;
    if (query?.endDate) params['endDate'] = query.endDate;

    return this.api.get<ExerciseProgress>(
      `${this.endpoint}/users/${userId}/progress/${exerciseId}`,
      params
    );
  }

  getUserVolumeStats(userId: string, query?: StatsQuery): Observable<VolumeStats> {
    const params: Record<string, string> = {};
    if (query?.startDate) params['startDate'] = query.startDate;
    if (query?.endDate) params['endDate'] = query.endDate;

    return this.api.get<VolumeStats>(
      `${this.endpoint}/users/${userId}/volume`,
      params
    );
  }

  getUserMonthlyComparison(userId: string): Observable<MonthlyComparison> {
    return this.api.get<MonthlyComparison>(
      `${this.endpoint}/users/${userId}/monthly`
    );
  }
}
