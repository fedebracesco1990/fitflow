import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { DashboardService } from '../../../../core/services';
import { FinancialDashboard, PaymentMethodDistribution } from '../../../../core/models';
import {
  AlertComponent,
  CardComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  BadgeComponent,
  ButtonComponent,
} from '../../../../shared';

@Component({
  selector: 'fit-flow-financial-dashboard',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe,
    AlertComponent,
    CardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    BadgeComponent,
    ButtonComponent,
  ],
  templateUrl: './financial.component.html',
  styleUrl: './financial.component.scss',
})
export class FinancialDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly data = signal<FinancialDashboard | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  // Computed properties for template
  readonly hasData = computed(() => this.data() !== null);

  readonly revenueGrowthClass = computed(() => {
    const growth = this.data()?.revenueGrowthPercentage ?? 0;
    if (growth > 0) return 'positive';
    if (growth < 0) return 'negative';
    return 'neutral';
  });

  readonly revenueGrowthIcon = computed(() => {
    const growth = this.data()?.revenueGrowthPercentage ?? 0;
    if (growth > 0) return '📈';
    if (growth < 0) return '📉';
    return '➡️';
  });

  // Chart data computed
  readonly chartMaxValue = computed(() => {
    const revenues = this.data()?.monthlyRevenue ?? [];
    if (revenues.length === 0) return 100;
    return Math.max(...revenues.map((r) => r.total)) * 1.1;
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getFinancialDashboard().subscribe({
      next: (response) => {
        this.data.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.friendlyMessage || 'Error al cargar el dashboard financiero');
        this.loading.set(false);
      },
    });
  }

  getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      other: 'Otro',
    };
    return labels[method] || method;
  }

  getPaymentMethodIcon(method: string): string {
    const icons: Record<string, string> = {
      cash: '💵',
      card: '💳',
      transfer: '🏦',
      other: '📝',
    };
    return icons[method] || '💰';
  }

  getBarHeight(total: number): string {
    const max = this.chartMaxValue();
    const percentage = (total / max) * 100;
    return `${Math.max(percentage, 5)}%`;
  }

  getDistributionPercentage(item: PaymentMethodDistribution): number {
    const total = this.data()?.paymentMethodDistribution.reduce((sum, i) => sum + i.total, 0) ?? 0;
    if (total === 0) return 0;
    return (item.total / total) * 100;
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
