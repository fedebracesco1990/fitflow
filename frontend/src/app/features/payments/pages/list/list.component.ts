import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PaymentsService } from '../../../../core/services';
import { Payment, PaymentMethod, PaymentMethodLabels } from '../../../../core/models';
import { PaginationMeta } from '../../../../core/models/api-response.model';
import { AlertComponent, ButtonComponent, CardComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-payments-list',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, AlertComponent, ButtonComponent, CardComponent],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class PaymentsListComponent implements OnInit {
  private readonly paymentsService = inject(PaymentsService);

  readonly payments = signal<Payment[]>([]);
  readonly paginationMeta = signal<PaginationMeta | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly PaymentMethodLabels = PaymentMethodLabels;

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(page = 1): void {
    this.loading.set(true);
    this.error.set(null);

    this.paymentsService.getAll({ page, limit: 20 }).subscribe({
      next: (response) => {
        this.payments.set(response.data);
        this.paginationMeta.set(response.meta);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar los pagos');
        this.loading.set(false);
      },
    });
  }

  deletePayment(payment: Payment): void {
    if (!confirm(`¿Estás seguro de eliminar este pago de $${payment.amount}?`)) {
      return;
    }

    this.paymentsService.delete(payment.id).subscribe({
      next: () => {
        this.payments.update((list) => list.filter((p) => p.id !== payment.id));
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al eliminar el pago');
      },
    });
  }

  getPaymentMethodLabel(method: PaymentMethod): string {
    return PaymentMethodLabels[method] || method;
  }

  getUserName(payment: Payment): string {
    return payment.membership?.user?.name || 'Usuario desconocido';
  }

  getMembershipTypeName(payment: Payment): string {
    return payment.membership?.membershipType?.name || 'Sin tipo';
  }
}
