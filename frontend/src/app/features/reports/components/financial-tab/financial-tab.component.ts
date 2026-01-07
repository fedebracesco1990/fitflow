import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancialReportService } from '../../services/financial-report.service';
import { FinancialReport } from '../../models';
import { CardComponent, LoadingSpinnerComponent, AlertComponent } from '../../../../shared';
import { MonthYearFilterComponent } from '../month-year-filter/month-year-filter.component';
import { TransactionsTableComponent } from '../transactions-table/transactions-table.component';

@Component({
  selector: 'fit-flow-financial-tab',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    LoadingSpinnerComponent,
    AlertComponent,
    MonthYearFilterComponent,
    TransactionsTableComponent,
  ],
  templateUrl: './financial-tab.component.html',
  styleUrl: './financial-tab.component.scss',
})
export class FinancialTabComponent implements OnInit {
  private readonly financialReportService = inject(FinancialReportService);

  readonly report = signal<FinancialReport | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private currentMonth?: number;
  private currentYear?: number;

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(month?: number, year?: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.currentMonth = month;
    this.currentYear = year;

    this.financialReportService.getFinancialReport(month, year).subscribe({
      next: (data) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.friendlyMessage || 'Error al cargar el reporte financiero');
        this.loading.set(false);
      },
    });
  }

  onFiltersApplied(filters: { month?: number; year?: number }): void {
    this.loadReport(filters.month, filters.year);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
}
