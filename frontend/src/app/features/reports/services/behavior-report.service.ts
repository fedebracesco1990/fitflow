import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BehaviorReport } from '../models';

@Injectable({
  providedIn: 'root',
})
export class BehaviorReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getBehaviorReport(startDate?: string, endDate?: string): Observable<BehaviorReport> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<BehaviorReport>(`${this.baseUrl}/dashboard/reports/behavior`, { params });
  }

  exportBehaviorCsv(startDate?: string, endDate?: string): Observable<Blob> {
    let params = new HttpParams().set('type', 'behavior');
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get(`${this.baseUrl}/dashboard/reports/export-csv`, {
      params,
      responseType: 'blob',
    });
  }
}
