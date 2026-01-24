import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ReportFormat, ExportReportRequest } from '../models';
import { ReportHistoryService } from './report-history.service';

@Injectable({
  providedIn: 'root',
})
export class ReportExportService {
  private readonly http = inject(HttpClient);
  private readonly historyService = inject(ReportHistoryService);
  private readonly baseUrl = environment.apiUrl;

  exportReport(request: ExportReportRequest): Observable<Blob> {
    const { type, format, startDate, endDate } = request;
    const body = { format, startDate, endDate };

    return this.http
      .post(`${this.baseUrl}/reports/${type}`, body, {
        responseType: 'blob',
      })
      .pipe(
        tap(() => {
          this.historyService.addToHistory(request);
        })
      );
  }

  downloadBlob(blob: Blob, request: ExportReportRequest): void {
    const today = new Date().toISOString().split('T')[0];
    const extension = request.format === ReportFormat.PDF ? 'pdf' : 'xlsx';
    const filename = `reporte-${request.type}-${today}.${extension}`;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
