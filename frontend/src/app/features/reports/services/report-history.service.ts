import { Injectable, signal } from '@angular/core';
import { ReportHistoryItem, ExportReportRequest, ReportFormat } from '../models';

const STORAGE_KEY = 'fitflow_report_history';
const MAX_HISTORY_ITEMS = 10;

@Injectable({
  providedIn: 'root',
})
export class ReportHistoryService {
  private readonly _history = signal<ReportHistoryItem[]>([]);
  readonly history = this._history.asReadonly();

  constructor() {
    this.loadFromStorage();
  }

  addToHistory(request: ExportReportRequest): void {
    const today = new Date().toISOString().split('T')[0];
    const extension = request.format === ReportFormat.PDF ? 'pdf' : 'xlsx';

    const item: ReportHistoryItem = {
      id: crypto.randomUUID(),
      type: request.type,
      format: request.format,
      startDate: request.startDate,
      endDate: request.endDate,
      generatedAt: new Date().toISOString(),
      filename: `reporte-${request.type}-${today}.${extension}`,
    };

    const current = this._history();
    const updated = [item, ...current].slice(0, MAX_HISTORY_ITEMS);
    this._history.set(updated);
    this.saveToStorage(updated);
  }

  clearHistory(): void {
    this._history.set([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as ReportHistoryItem[];
        this._history.set(items);
      }
    } catch {
      this._history.set([]);
    }
  }

  private saveToStorage(items: ReportHistoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or unavailable
    }
  }
}
