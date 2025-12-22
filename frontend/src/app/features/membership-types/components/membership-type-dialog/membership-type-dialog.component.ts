import { Component, inject, signal, computed, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MembershipTypesService } from '../../../../core/services';
import { AccessType } from '../../../../core/models';
import { ButtonComponent, AlertComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-membership-type-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, AlertComponent],
  templateUrl: './membership-type-dialog.component.html',
  styleUrls: ['./membership-type-dialog.component.scss'],
})
export class MembershipTypeDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly membershipTypesService = inject(MembershipTypesService);

  isOpen = input(false);
  membershipTypeId = input<string | null>(null);
  cancelled = output<void>();

  form: FormGroup;
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);

  isEditMode = computed(() => !!this.membershipTypeId());
  dialogTitle = computed(() =>
    this.isEditMode() ? 'Editar Tipo de Membresía' : 'Nuevo Tipo de Membresía'
  );

  readonly accessTypes = [
    { value: AccessType.GYM_ONLY, label: 'Solo Gimnasio' },
    { value: AccessType.ALL_ACCESS, label: 'Acceso Completo' },
    { value: AccessType.CLASSES_ONLY, label: 'Solo Clases' },
  ];

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      durationDays: [30, [Validators.required, Validators.min(1)]],
      gracePeriodDays: [0, [Validators.min(0)]],
      accessType: [AccessType.ALL_ACCESS, Validators.required],
      isActive: [true],
    });

    effect(() => {
      if (this.isOpen() && this.membershipTypeId()) {
        this.loadMembershipType(this.membershipTypeId()!);
      } else if (this.isOpen() && !this.membershipTypeId()) {
        this.resetForm();
      }
    });
  }

  loadMembershipType(id: string): void {
    this.isLoading.set(true);
    this.membershipTypesService.getById(id).subscribe({
      next: (type) => {
        this.form.patchValue({
          name: type.name,
          description: type.description || '',
          price: type.price,
          durationDays: type.durationDays,
          gracePeriodDays: type.gracePeriodDays,
          accessType: type.accessType,
          isActive: type.isActive,
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar el tipo de membresía');
        this.isLoading.set(false);
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

    const formData = this.form.value;

    const baseData = {
      ...formData,
      price: Number(formData.price),
      durationDays: Number(formData.durationDays),
      gracePeriodDays: Number(formData.gracePeriodDays) || 0,
    };

    const data = this.isEditMode() ? baseData : { ...baseData, isActive: undefined };

    const request$ = this.isEditMode()
      ? this.membershipTypesService.update(this.membershipTypeId()!, data)
      : this.membershipTypesService.create(data);

    request$.subscribe({
      next: () => {
        this.cancelled.emit();
        this.resetForm();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al guardar el tipo de membresía');
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
    this.form.reset({
      name: '',
      description: '',
      price: null,
      durationDays: 30,
      gracePeriodDays: 0,
      accessType: AccessType.ALL_ACCESS,
      isActive: true,
    });
    this.isLoading.set(false);
    this.isSaving.set(false);
    this.error.set(null);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!field && field.invalid && field.touched;
  }
}
