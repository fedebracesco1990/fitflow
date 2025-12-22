import { Component, input, output, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaymentsService, MembershipsService, Membership } from '../../../../core/services';
import { PaymentMethod, PaymentMethodLabels, Payment } from '../../../../core/models';
import { ButtonComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-payment-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
})
export class PaymentModalComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly paymentsService = inject(PaymentsService);
  private readonly membershipsService = inject(MembershipsService);
  private readonly destroy$ = new Subject<void>();

  isOpen = input(false);
  paymentCreated = output<Payment>();
  cancelled = output<void>();

  readonly form: FormGroup;
  readonly loading = signal(false);
  readonly loadingMemberships = signal(true);
  readonly error = signal<string | null>(null);
  readonly memberships = signal<Membership[]>([]);

  readonly paymentMethods = Object.values(PaymentMethod);
  readonly PaymentMethodLabels = PaymentMethodLabels;

  constructor() {
    const today = new Date().toISOString().split('T')[0];

    this.form = this.fb.group({
      membershipId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      paymentMethod: [PaymentMethod.CASH, Validators.required],
      paymentDate: [today, Validators.required],
      coverageStartDate: [today, Validators.required],
      coverageEndDate: ['', Validators.required],
      reference: [''],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.loadMemberships();
    this.setupAutoCoverage();
    this.setupAutoAmount();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  setupAutoCoverage(): void {
    combineLatest([
      this.form.get('membershipId')!.valueChanges,
      this.form.get('coverageStartDate')!.valueChanges,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([membershipId, startDate]) => {
        if (membershipId && startDate) {
          const membership = this.memberships().find((m) => m.id === membershipId);
          const durationDays = membership?.membershipType?.durationDays || 30;
          const endDate = this.addDays(startDate, durationDays);
          this.form.patchValue({ coverageEndDate: endDate }, { emitEvent: false });
        }
      });
  }

  setupAutoAmount(): void {
    this.form
      .get('membershipId')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((membershipId) => {
        if (membershipId) {
          const membership = this.memberships().find((m) => m.id === membershipId);
          if (membership?.membershipType?.price) {
            this.form.patchValue({ amount: membership.membershipType.price });
          }
        }
      });
  }

  addDays(dateString: string, days: number): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.form.value;
    const data = {
      ...formValue,
      amount: Number(formValue.amount),
    };

    this.paymentsService.create(data).subscribe({
      next: (payment) => {
        this.paymentCreated.emit(payment);
        this.resetForm();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al crear el pago');
        this.loading.set(false);
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
    this.resetForm();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.onCancel();
    }
  }

  resetForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.form.reset({
      membershipId: '',
      amount: '',
      paymentMethod: PaymentMethod.CASH,
      paymentDate: today,
      coverageStartDate: today,
      coverageEndDate: '',
      reference: '',
      notes: '',
    });
    this.loading.set(false);
    this.error.set(null);
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
