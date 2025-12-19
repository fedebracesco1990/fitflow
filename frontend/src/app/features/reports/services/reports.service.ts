import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ReportsData } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getReportsData(startDate?: string, endDate?: string): Observable<ReportsData> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<ReportsData>(`${this.baseUrl}/dashboard/reports`, { params });
  }

  exportReports(startDate?: string, endDate?: string): Observable<Blob> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get(`${this.baseUrl}/dashboard/reports/export`, {
      params,
      responseType: 'blob',
    });
  }
}
