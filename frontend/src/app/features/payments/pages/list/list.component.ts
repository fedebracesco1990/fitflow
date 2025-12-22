import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PaymentsService } from '../../../../core/services';
import { Payment, PaymentMethod, PaymentMethodLabels } from '../../../../core/models';
import { PaginationMeta } from '../../../../core/models/api-response.model';
import {
  AlertComponent,
  ButtonComponent,
  CardComponent,
  ConfirmDialogComponent,
} from '../../../../shared';
import { PaymentModalComponent } from '../../components/payment-modal/payment-modal.component';

@Component({
  selector: 'fit-flow-payments-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    AlertComponent,
    ButtonComponent,
    CardComponent,
    ConfirmDialogComponent,
    PaymentModalComponent,
  ],
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

  // Dialog state
  readonly showDeleteDialog = signal(false);
  readonly selectedPayment = signal<Payment | null>(null);

  // Payment modal state
  readonly showPaymentModal = signal(false);

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

  openDeleteDialog(payment: Payment): void {
    this.selectedPayment.set(payment);
    this.showDeleteDialog.set(true);
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog.set(false);
    this.selectedPayment.set(null);
  }

  confirmDelete(): void {
    const payment = this.selectedPayment();
    if (!payment) return;

    this.paymentsService.delete(payment.id).subscribe({
      next: () => {
        this.payments.update((list) => list.filter((p) => p.id !== payment.id));
        this.closeDeleteDialog();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al eliminar el pago');
        this.closeDeleteDialog();
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

  nextPage(): void {
    const meta = this.paginationMeta();
    if (meta && meta.page < meta.totalPages) {
      this.loadPayments(meta.page + 1);
    }
  }

  prevPage(): void {
    const meta = this.paginationMeta();
    if (meta && meta.page > 1) {
      this.loadPayments(meta.page - 1);
    }
  }

  openPaymentModal(): void {
    this.showPaymentModal.set(true);
  }

  onPaymentCreated(): void {
    this.showPaymentModal.set(false);
    this.loadPayments();
  }

  onModalCancelled(): void {
    this.showPaymentModal.set(false);
  }
}
