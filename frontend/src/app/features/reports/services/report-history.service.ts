import { Injectable } from '@angular/core';
import { LocalHistoryStore } from '../../../shared/utils/local-history-store';
import { ReportHistoryItem, ExportReportRequest, ReportFormat } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ReportHistoryService extends LocalHistoryStore<ReportHistoryItem> {
  constructor() {
    super('fitflow_report_history');
  }

  addToHistory(request: ExportReportRequest): void {
    const today = new Date().toISOString().split('T')[0];
    const extension = request.format === ReportFormat.PDF ? 'pdf' : 'xlsx';

    this.push({
      id: crypto.randomUUID(),
      type: request.type,
      format: request.format,
      startDate: request.startDate,
      endDate: request.endDate,
      generatedAt: new Date().toISOString(),
      filename: `reporte-${request.type}-${today}.${extension}`,
    });
  }
}
