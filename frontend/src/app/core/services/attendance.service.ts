import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface AttendanceRecord {
  id: string;
  userId: string;
  granted: boolean;
  reason: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  scannedBy?: {
    id: string;
    name: string;
  } | null;
}

export interface AttendancePaginatedResponse {
  data: AttendanceRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DayOfWeekStats {
  dayOfWeek: number;
  dayName: string;
  count: number;
}

export interface MonthlyAverage {
  month: string;
  year: number;
  totalAttendances: number;
  averagePerDay: number;
}

export interface AttendanceStats {
  totalAttendances: number;
  byDayOfWeek: DayOfWeekStats[];
  monthlyAverages: MonthlyAverage[];
  periodStart?: string;
  periodEnd?: string;
}

export interface MonthlyCount {
  count: number;
  month: number;
  year: number;
}

export interface AttendanceQueryParams {
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly api = inject(ApiService);

  getMyAttendance(
    userId: string,
    params?: AttendanceQueryParams
  ): Observable<AttendancePaginatedResponse> {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params?.fromDate) queryParams['fromDate'] = params.fromDate;
    if (params?.toDate) queryParams['toDate'] = params.toDate;
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    return this.api.get<AttendancePaginatedResponse>(`attendance/user/${userId}`, queryParams);
  }

  getMyMonthlyCount(userId: string, month?: number, year?: number): Observable<MonthlyCount> {
    const params: Record<string, string> = {};
    if (month) params['month'] = month.toString();
    if (year) params['year'] = year.toString();
    return this.api.get<MonthlyCount>(`attendance/user/${userId}/count`, params);
  }

  getStats(params?: AttendanceQueryParams): Observable<AttendanceStats> {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params?.fromDate) queryParams['fromDate'] = params.fromDate;
    if (params?.toDate) queryParams['toDate'] = params.toDate;
    return this.api.get<AttendanceStats>('attendance/stats', queryParams);
  }
}
