import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaymentsService, MembershipsService, Membership } from '../../../../core/services';
import { PaymentMethod, PaymentMethodLabels } from '../../../../core/models';
import { AlertComponent, ButtonComponent, CardComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-payment-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AlertComponent, ButtonComponent, CardComponent],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class PaymentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly paymentsService = inject(PaymentsService);
  private readonly membershipsService = inject(MembershipsService);

  readonly form: FormGroup;
  readonly isEditMode = signal(false);
  readonly loading = signal(false);
  readonly loadingMemberships = signal(true);
  readonly error = signal<string | null>(null);
  readonly memberships = signal<Membership[]>([]);

  readonly paymentMethods = Object.values(PaymentMethod);
  readonly PaymentMethodLabels = PaymentMethodLabels;

  private paymentId: string | null = null;

  constructor() {
    const today = new Date().toISOString().split('T')[0];

    this.form = this.fb.group({
      membershipId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      paymentMethod: [PaymentMethod.CASH, Validators.required],
      paymentDate: [today, Validators.required],
      reference: [''],
      notes: [''],
    });

    // Auto-fill amount when membership is selected
    this.form.get('membershipId')?.valueChanges.subscribe((membershipId) => {
      if (membershipId && !this.isEditMode()) {
        const membership = this.memberships().find((m) => m.id === membershipId);
        if (membership?.membershipType?.price) {
          this.form.patchValue({ amount: membership.membershipType.price });
        }
      }
    });
  }

  ngOnInit(): void {
    this.loadMemberships();

    this.paymentId = this.route.snapshot.paramMap.get('id');
    if (this.paymentId) {
      this.isEditMode.set(true);
      this.loadPayment(this.paymentId);
    }
  }

  loadMemberships(): void {
    this.loadingMemberships.set(true);
    this.membershipsService.getAll({ limit: 100 }).subscribe({
      next: (response) => {
        this.memberships.set(response.data);
        this.loadingMemberships.set(false);
      },
      error: () => {
        this.loadingMemberships.set(false);
      },
    });
  }

  loadPayment(id: string): void {
    this.loading.set(true);
    this.paymentsService.getById(id).subscribe({
      next: (payment) => {
        this.form.patchValue({
          membershipId: payment.membershipId,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          paymentDate: payment.paymentDate,
          reference: payment.reference || '',
          notes: payment.notes || '',
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar el pago');
        this.loading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.form.value;

    // Convert amount to number (HTML inputs return strings)
    const data = {
      ...formValue,
      amount: Number(formValue.amount),
    };

    if (this.isEditMode() && this.paymentId) {
      this.paymentsService.update(this.paymentId, data).subscribe({
        next: () => {
          this.router.navigate(['/payments']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al actualizar el pago');
          this.loading.set(false);
        },
      });
    } else {
      this.paymentsService.create(data).subscribe({
        next: () => {
          this.router.navigate(['/payments']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al crear el pago');
          this.loading.set(false);
        },
      });
    }
  }

  getMembershipLabel(membership: Membership): string {
    const userName = membership.user?.name || 'Usuario';
    const typeName = membership.membershipType?.name || 'Sin tipo';
    return `${userName} - ${typeName}`;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!field && field.invalid && field.touched;
  }
}
