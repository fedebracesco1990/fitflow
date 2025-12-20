import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorReportService } from '../../services/behavior-report.service';
import { BehaviorReport } from '../../models';
import {
  CardComponent,
  LoadingSpinnerComponent,
  AlertComponent,
} from '../../../../shared';
import { BehaviorMetricsComponent } from '../behavior-metrics/behavior-metrics.component';
import { MemberAnalysisTableComponent } from '../member-analysis-table/member-analysis-table.component';

@Component({
  selector: 'fit-flow-behavior-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    LoadingSpinnerComponent,
    AlertComponent,
    BehaviorMetricsComponent,
    MemberAnalysisTableComponent,
  ],
  templateUrl: './behavior-tab.component.html',
  styleUrl: './behavior-tab.component.scss',
})
export class BehaviorTabComponent implements OnInit {
  private readonly behaviorReportService = inject(BehaviorReportService);

  readonly report = signal<BehaviorReport | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  startDate = '';
  endDate = '';

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadReport();
  }

  setDefaultDates(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.startDate = firstDay.toISOString().split('T')[0];
    this.endDate = lastDay.toISOString().split('T')[0];
  }

  loadReport(): void {
    this.loading.set(true);
    this.error.set(null);

    const start = this.startDate || undefined;
    const end = this.endDate || undefined;

    this.behaviorReportService.getBehaviorReport(start, end).subscribe({
      next: (data) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.friendlyMessage || 'Error al cargar el reporte de comportamiento');
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.loadReport();
  }

  clearFilters(): void {
    this.setDefaultDates();
    this.loadReport();
  }
}
