import { Component, OnInit, inject, signal, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { PaymentsService } from '../../../../core/services';
import { Payment } from '../../../../core/models';
import { ButtonComponent, LoadingSpinnerComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-recent-payments',
  standalone: true,
  imports: [RouterLink, DecimalPipe, ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './recent-payments.component.html',
  styleUrl: './recent-payments.component.scss',
})
export class RecentPaymentsComponent implements OnInit {
  private readonly paymentsService = inject(PaymentsService);

  readonly limit = input<number>(3);

  readonly payments = signal<Payment[]>([]);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.loadPayments();
  }

  private loadPayments(): void {
    this.isLoading.set(true);

    this.paymentsService.getAll({ page: 1, limit: this.limit() }).subscribe({
      next: (response) => {
        this.payments.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  getUserName(payment: Payment): string {
    return payment.membership?.user?.name || 'Usuario desconocido';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
  }
}
