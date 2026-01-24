import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent, AlertComponent } from '../../../../shared';
import { ReportExportService } from '../../services/report-export.service';
import {
  ReportType,
  ReportFormat,
  ExportReportRequest,
  REPORT_TYPE_LABELS,
  REPORT_FORMAT_LABELS,
  REPORT_TYPE_DESCRIPTIONS,
} from '../../models';

@Component({
  selector: 'fit-flow-export-report-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AlertComponent],
  templateUrl: './export-report-dialog.component.html',
  styleUrl: './export-report-dialog.component.scss',
})
export class ExportReportDialogComponent {
  private readonly exportService = inject(ReportExportService);

  isOpen = input(false);
  closed = output<void>();
  exported = output<void>();

  readonly selectedType = signal<ReportType>(ReportType.FINANCIAL);
  readonly selectedFormat = signal<ReportFormat>(ReportFormat.PDF);
  readonly startDate = signal<string>('');
  readonly endDate = signal<string>('');
  readonly isExporting = signal(false);
  readonly error = signal<string | null>(null);

  readonly reportTypes = Object.values(ReportType);
  readonly reportFormats = Object.values(ReportFormat);
  readonly typeLabels = REPORT_TYPE_LABELS;
  readonly formatLabels = REPORT_FORMAT_LABELS;
  readonly typeDescriptions = REPORT_TYPE_DESCRIPTIONS;

  get showDateRange(): boolean {
    return this.selectedType() !== ReportType.USERS;
  }

  onClose(): void {
    this.resetForm();
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.onClose();
    }
  }

  onTypeChange(type: ReportType): void {
    this.selectedType.set(type);
    this.error.set(null);
  }

  onFormatChange(format: ReportFormat): void {
    this.selectedFormat.set(format);
  }

  onStartDateChange(date: string): void {
    this.startDate.set(date);
  }

  onEndDateChange(date: string): void {
    this.endDate.set(date);
  }

  onExport(): void {
    this.isExporting.set(true);
    this.error.set(null);

    const request: ExportReportRequest = {
      type: this.selectedType(),
      format: this.selectedFormat(),
      startDate: this.startDate() || undefined,
      endDate: this.endDate() || undefined,
    };

    this.exportService.exportReport(request).subscribe({
      next: (blob) => {
        this.exportService.downloadBlob(blob, request);
        this.isExporting.set(false);
        this.exported.emit();
        this.onClose();
      },
      error: (err) => {
        this.error.set(err.friendlyMessage || 'Error al generar el reporte');
        this.isExporting.set(false);
      },
    });
  }

  private resetForm(): void {
    this.selectedType.set(ReportType.FINANCIAL);
    this.selectedFormat.set(ReportFormat.PDF);
    this.startDate.set('');
    this.endDate.set('');
    this.error.set(null);
  }
}
