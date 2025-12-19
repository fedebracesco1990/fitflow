import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../services/reports.service';
import { ReportsData } from '../../models';
import {
  CardComponent,
  LoadingSpinnerComponent,
  AlertComponent,
  ButtonComponent,
} from '../../../../shared';
import { ReportFiltersComponent } from '../../components/report-filters/report-filters.component';
import { RevenueChartComponent } from '../../components/revenue-chart/revenue-chart.component';
import { AttendanceChartComponent } from '../../components/attendance-chart/attendance-chart.component';
import { MembershipsChartComponent } from '../../components/memberships-chart/memberships-chart.component';

type TabType = 'revenue' | 'attendance' | 'memberships';

@Component({
  selector: 'fit-flow-reports',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    LoadingSpinnerComponent,
    AlertComponent,
    ButtonComponent,
    ReportFiltersComponent,
    RevenueChartComponent,
    AttendanceChartComponent,
    MembershipsChartComponent,
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit {
  private readonly reportsService = inject(ReportsService);

  readonly activeTab = signal<TabType>('revenue');
  readonly reportsData = signal<ReportsData | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly isExporting = signal(false);

  private startDate: string | undefined;
  private endDate: string | undefined;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.reportsService.getReportsData(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.reportsData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.friendlyMessage || 'Error al cargar los reportes');
        this.loading.set(false);
      },
    });
  }

  onFiltersApplied(filters: { startDate?: string; endDate?: string }): void {
    this.startDate = filters.startDate;
    this.endDate = filters.endDate;
    this.loadData();
  }

  onClearFilters(): void {
    this.startDate = undefined;
    this.endDate = undefined;
    this.loadData();
  }

  setActiveTab(tab: TabType): void {
    this.activeTab.set(tab);
  }

  exportToExcel(): void {
    this.isExporting.set(true);

    this.reportsService.exportReports(this.startDate, this.endDate).subscribe({
      next: (blob) => {
        const today = new Date().toISOString().split('T')[0];
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reportes-fitflow-${today}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isExporting.set(false);
      },
      error: (err) => {
        this.error.set(err.friendlyMessage || 'Error al exportar los reportes');
        this.isExporting.set(false);
      },
    });
  }
}
