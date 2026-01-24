import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportHistoryService } from '../../services/report-history.service';
import { ReportExportService } from '../../services/report-export.service';
import { ReportHistoryItem, REPORT_TYPE_LABELS, REPORT_FORMAT_LABELS } from '../../models';

@Component({
  selector: 'fit-flow-report-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-history.component.html',
  styleUrl: './report-history.component.scss',
})
export class ReportHistoryComponent {
  private readonly historyService = inject(ReportHistoryService);
  private readonly exportService = inject(ReportExportService);

  readonly history = this.historyService.history;
  readonly typeLabels = REPORT_TYPE_LABELS;
  readonly formatLabels = REPORT_FORMAT_LABELS;

  regenerateReport(item: ReportHistoryItem): void {
    const request = {
      type: item.type,
      format: item.format,
      startDate: item.startDate,
      endDate: item.endDate,
    };

    this.exportService.exportReport(request).subscribe({
      next: (blob) => {
        this.exportService.downloadBlob(blob, request);
      },
    });
  }

  clearHistory(): void {
    this.historyService.clearHistory();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatDateRange(item: ReportHistoryItem): string {
    if (!item.startDate && !item.endDate) {
      return 'Todos los registros';
    }
    const start = item.startDate ? new Date(item.startDate).toLocaleDateString('es-AR') : 'Inicio';
    const end = item.endDate ? new Date(item.endDate).toLocaleDateString('es-AR') : 'Hoy';
    return `${start} - ${end}`;
  }
}
