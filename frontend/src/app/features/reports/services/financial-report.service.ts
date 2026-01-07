import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FinancialReport } from '../models';

@Injectable({
  providedIn: 'root',
})
export class FinancialReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getFinancialReport(month?: number, year?: number): Observable<FinancialReport> {
    let params = new HttpParams();
    if (month) {
      params = params.set('month', month.toString());
    }
    if (year) {
      params = params.set('year', year.toString());
    }
    return this.http.get<FinancialReport>(`${this.baseUrl}/dashboard/reports/financial`, {
      params,
    });
  }

  exportFinancialCsv(month?: number, year?: number): Observable<Blob> {
    let params = new HttpParams().set('type', 'financial');
    if (month) {
      params = params.set('month', month.toString());
    }
    if (year) {
      params = params.set('year', year.toString());
    }
    return this.http.get(`${this.baseUrl}/dashboard/reports/export-csv`, {
      params,
      responseType: 'blob',
    });
  }
}
