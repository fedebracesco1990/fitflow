import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancialReportService } from '../../services/financial-report.service';
import { BehaviorReportService } from '../../services/behavior-report.service';
import { CardComponent, ButtonComponent, AlertComponent } from '../../../../shared';
import { FinancialTabComponent } from '../../components/financial-tab/financial-tab.component';
import { BehaviorTabComponent } from '../../components/behavior-tab/behavior-tab.component';

type TabType = 'financial' | 'behavior';

@Component({
  selector: 'fit-flow-reports',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    AlertComponent,
    ButtonComponent,
    FinancialTabComponent,
    BehaviorTabComponent,
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent {
  private readonly financialReportService = inject(FinancialReportService);
  private readonly behaviorReportService = inject(BehaviorReportService);

  @ViewChild(FinancialTabComponent) financialTab?: FinancialTabComponent;
  @ViewChild(BehaviorTabComponent) behaviorTab?: BehaviorTabComponent;

  readonly activeTab = signal<TabType>('financial');
  readonly isExporting = signal(false);
  readonly exportError = signal<string | null>(null);

  setActiveTab(tab: TabType): void {
    this.activeTab.set(tab);
  }

  exportToCsv(): void {
    this.isExporting.set(true);
    this.exportError.set(null);

    const activeTabType = this.activeTab();

    if (activeTabType === 'financial') {
      const month = this.financialTab?.['currentMonth'];
      const year = this.financialTab?.['currentYear'];

      this.financialReportService.exportFinancialCsv(month, year).subscribe({
        next: (blob) => {
          this.downloadCsv(blob, 'reporte-financiero');
          this.isExporting.set(false);
        },
        error: (err) => {
          this.exportError.set(err.friendlyMessage || 'Error al exportar el reporte');
          this.isExporting.set(false);
        },
      });
    } else {
      const startDate = this.behaviorTab?.startDate;
      const endDate = this.behaviorTab?.endDate;
      const filterStatus = this.behaviorTab?.currentFilterStatus;
      const status = filterStatus && filterStatus !== 'ALL' ? filterStatus : undefined;

      this.behaviorReportService.exportBehaviorCsv(startDate, endDate, status).subscribe({
        next: (blob) => {
          this.downloadCsv(blob, 'reporte-comportamiento');
          this.isExporting.set(false);
        },
        error: (err) => {
          this.exportError.set(err.friendlyMessage || 'Error al exportar el reporte');
          this.isExporting.set(false);
        },
      });
    }
  }

  private downloadCsv(blob: Blob, filename: string): void {
    const today = new Date().toISOString().split('T')[0];
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${today}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
