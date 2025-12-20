import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { TransactionItem } from '../../models';

@Component({
  selector: 'fit-flow-transactions-table',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe],
  templateUrl: './transactions-table.component.html',
  styleUrl: './transactions-table.component.scss',
})
export class TransactionsTableComponent {
  @Input() set transactions(value: TransactionItem[]) {
    this.allTransactions.set(value);
  }

  readonly allTransactions = signal<TransactionItem[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = 10;

  readonly paginatedTransactions = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.allTransactions().slice(start, end);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.allTransactions().length / this.pageSize);
  });

  readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());
  readonly hasPrevPage = computed(() => this.currentPage() > 1);

  nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update((p) => p + 1);
    }
  }

  prevPage(): void {
    if (this.hasPrevPage()) {
      this.currentPage.update((p) => p - 1);
    }
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
}
