import { Component, inject, signal, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MembershipsService, MembershipTypesService, UserService } from '../../../../core/services';
import { MembershipType, User } from '../../../../core/models';
import { ButtonComponent, AlertComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-membership-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, AlertComponent],
  templateUrl: './membership-dialog.component.html',
  styleUrls: ['./membership-dialog.component.scss'],
})
export class MembershipDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly membershipsService = inject(MembershipsService);
  private readonly membershipTypesService = inject(MembershipTypesService);
  private readonly userService = inject(UserService);

  isOpen = input(false);
  preSelectedUserId = input<string | null>(null);
  cancelled = output<void>();

  form: FormGroup;
  isSaving = signal(false);
  isLoadingData = signal(false);
  error = signal<string | null>(null);

  readonly users = signal<User[]>([]);
  readonly membershipTypes = signal<MembershipType[]>([]);

  constructor() {
    const today = new Date().toISOString().split('T')[0];

    this.form = this.fb.group({
      userId: ['', Validators.required],
      membershipTypeId: ['', Validators.required],
      startDate: [today, Validators.required],
      notes: [''],
    });

    effect(() => {
      if (this.isOpen()) {
        this.resetForm();
        const userId = this.preSelectedUserId();
        if (userId) {
          this.form.patchValue({ userId });
        }
        this.loadFormData();
      }
    });
  }

  loadFormData(): void {
    this.isLoadingData.set(true);

    this.userService.getAll({ limit: 100 }).subscribe({
      next: (response) => {
        this.users.set(response.data);
      },
      error: () => {
        this.error.set('Error al cargar usuarios');
      },
    });

    this.membershipTypesService.getAll().subscribe({
      next: (types) => {
        this.membershipTypes.set(types);
        this.isLoadingData.set(false);
      },
      error: () => {
        this.error.set('Error al cargar tipos de membresía');
        this.isLoadingData.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    const formValue = this.form.value;
    const createData = {
      userId: formValue.userId,
      membershipTypeId: formValue.membershipTypeId,
      startDate: formValue.startDate,
      notes: formValue.notes || undefined,
    };

    this.membershipsService.create(createData).subscribe({
      next: () => {
        this.cancelled.emit();
        this.resetForm();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al crear la membresía');
        this.isSaving.set(false);
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
      startDate: today,
      notes: '',
    });
    this.isSaving.set(false);
    this.isLoadingData.set(false);
    this.error.set(null);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!field && field.invalid && field.touched;
  }
}
