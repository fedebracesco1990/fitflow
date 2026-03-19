import {
  Component,
  input,
  output,
  signal,
  inject,
  OnInit,
  OnDestroy,
  computed,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  PaymentsService,
  MembershipsService,
  Membership,
  MembershipTypesService,
} from '../../../../core/services';
import { UserService } from '../../../../core/services/user.service';
import {
  PaymentMethod,
  PaymentMethodLabels,
  Payment,
  MembershipType,
  User,
} from '../../../../core/models';
import { ButtonComponent } from '../../../../shared';

const PAYABLE_MEMBERSHIP_STATUSES = ['active', 'grace_period', 'expired'];

@Component({
  selector: 'fit-flow-payment-modal',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe, ButtonComponent],
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
})
export class PaymentModalComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly paymentsService = inject(PaymentsService);
  private readonly membershipsService = inject(MembershipsService);
  private readonly membershipTypesService = inject(MembershipTypesService);
  private readonly userService = inject(UserService);
  private readonly destroy$ = new Subject<void>();

  isOpen = input(false);
  paymentCreated = output<Payment>();
  cancelled = output<void>();

  readonly form: FormGroup;
  readonly loading = signal(false);
  readonly loadingUsers = signal(true);
  readonly loadingMembership = signal(false);
  readonly error = signal<string | null>(null);
  readonly users = signal<User[]>([]);
  readonly membershipTypes = signal<MembershipType[]>([]);
  readonly userMembership = signal<Membership | null>(null);
  readonly originalMembershipTypeId = signal<string | null>(null);

  readonly userSearchQuery = signal('');
  readonly showUserDropdown = signal(false);
  readonly selectedUserName = signal('');
  readonly filteredUsers = computed(() => {
    const query = this.userSearchQuery().toLowerCase().trim();
    if (!query) return this.users();
    return this.users().filter(
      (u) => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
    );
  });

  readonly paymentMethods = Object.values(PaymentMethod);
  readonly PaymentMethodLabels = PaymentMethodLabels;

  constructor() {
    const today = new Date().toISOString().split('T')[0];

    this.form = this.fb.group({
      userId: ['', Validators.required],
      membershipTypeId: ['', Validators.required],
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
    this.loadUsers();
    this.loadMembershipTypes();
    this.setupUserChangeListener();
    this.setupMembershipTypeChangeListener();
    this.setupCoverageStartDateListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.loadingUsers.set(true);
    this.userService.getAll({ limit: 200 }).subscribe({
      next: (response) => {
        const filtered = response.data.filter((user) =>
          user.memberships?.some((m) => PAYABLE_MEMBERSHIP_STATUSES.includes(m.status))
        );
        this.users.set(filtered);
        this.loadingUsers.set(false);
      },
      error: () => {
        this.loadingUsers.set(false);
      },
    });
  }

  loadMembershipTypes(): void {
    this.membershipTypesService.getAll().subscribe({
      next: (types) => {
        this.membershipTypes.set(types);
      },
      error: () => {
        this.error.set('Error al cargar tipos de membresía');
      },
    });
  }

  setupUserChangeListener(): void {
    this.form
      .get('userId')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((userId) => {
        if (userId) {
          this.loadUserMembership(userId);
        } else {
          this.userMembership.set(null);
          this.originalMembershipTypeId.set(null);
          this.form.patchValue(
            { membershipTypeId: '', amount: '', coverageEndDate: '' },
            { emitEvent: false }
          );
        }
      });
  }

  setupMembershipTypeChangeListener(): void {
    this.form
      .get('membershipTypeId')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((typeId) => {
        if (typeId) {
          const type = this.membershipTypes().find((t) => t.id === typeId);
          if (type) {
            this.form.patchValue({ amount: type.price }, { emitEvent: false });
            this.recalculateCoverageEndDate(type.durationDays);
          }
        }
      });
  }

  setupCoverageStartDateListener(): void {
    this.form
      .get('coverageStartDate')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const typeId = this.form.get('membershipTypeId')!.value;
        if (typeId) {
          const type = this.membershipTypes().find((t) => t.id === typeId);
          if (type) {
            this.recalculateCoverageEndDate(type.durationDays);
          }
        }
      });
  }

  loadUserMembership(userId: string): void {
    this.loadingMembership.set(true);
    this.membershipsService.getPayableByUser(userId).subscribe({
      next: (membership) => {
        this.userMembership.set(membership);
        if (membership) {
          this.originalMembershipTypeId.set(membership.membershipTypeId);
          this.form.patchValue({
            membershipTypeId: membership.membershipTypeId,
          });
        } else {
          this.originalMembershipTypeId.set(null);
          this.form.patchValue({
            membershipTypeId: '',
            amount: '',
            coverageEndDate: '',
          });
        }
        this.loadingMembership.set(false);
      },
      error: () => {
        this.userMembership.set(null);
        this.originalMembershipTypeId.set(null);
        this.loadingMembership.set(false);
      },
    });
  }

  recalculateCoverageEndDate(durationDays: number): void {
    const startDate = this.form.get('coverageStartDate')!.value;
    if (startDate) {
      const endDate = this.addDays(startDate, durationDays);
      this.form.patchValue({ coverageEndDate: endDate }, { emitEvent: false });
    }
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

    const membership = this.userMembership();
    if (!membership) {
      this.error.set('El usuario no tiene una membresía elegible para pago');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.form.value;
    const selectedTypeId = formValue.membershipTypeId;
    const membershipTypeChanged =
      this.originalMembershipTypeId() !== null &&
      selectedTypeId !== this.originalMembershipTypeId();

    const paymentData = {
      membershipId: membership.id,
      amount: Number(formValue.amount),
      paymentMethod: formValue.paymentMethod,
      paymentDate: formValue.paymentDate,
      coverageStartDate: formValue.coverageStartDate,
      coverageEndDate: formValue.coverageEndDate,
      reference: formValue.reference,
      notes: formValue.notes,
      ...(membershipTypeChanged ? { newMembershipTypeId: selectedTypeId } : {}),
    };

    const request$ = this.paymentsService.createWithMembershipUpdate(paymentData);

    request$.subscribe({
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
      userId: '',
      membershipTypeId: '',
      amount: '',
      paymentMethod: PaymentMethod.CASH,
      paymentDate: today,
      coverageStartDate: today,
      coverageEndDate: '',
      reference: '',
      notes: '',
    });
    this.userMembership.set(null);
    this.originalMembershipTypeId.set(null);
    this.userSearchQuery.set('');
    this.selectedUserName.set('');
    this.showUserDropdown.set(false);
    this.loading.set(false);
    this.error.set(null);
  }

  onUserSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.userSearchQuery.set(value);
    this.showUserDropdown.set(true);
    if (!value) {
      this.form.patchValue({ userId: '' }, { emitEvent: true });
      this.selectedUserName.set('');
    }
  }

  selectUser(user: User): void {
    this.form.patchValue({ userId: user.id });
    this.selectedUserName.set(`${user.name} (${user.email})`);
    this.userSearchQuery.set('');
    this.showUserDropdown.set(false);
  }

  clearUser(): void {
    this.form.patchValue({ userId: '' });
    this.selectedUserName.set('');
    this.userSearchQuery.set('');
    this.showUserDropdown.set(false);
    this.userMembership.set(null);
    this.originalMembershipTypeId.set(null);
    this.form.patchValue(
      { membershipTypeId: '', amount: '', coverageEndDate: '' },
      { emitEvent: false }
    );
  }

  openUserDropdown(): void {
    this.showUserDropdown.set(true);
  }

  closeUserDropdown(): void {
    setTimeout(() => {
      this.showUserDropdown.set(false);
    }, 150);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!field && field.invalid && field.touched;
  }
}
