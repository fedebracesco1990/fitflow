import { Component, inject, signal, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, CreateUserResult } from '../../../../core/services';
import { Role } from '../../../../core/models';
import { ButtonComponent, AlertComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-user-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, AlertComponent],
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss'],
})
export class UserDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

  isOpen = input(false);
  cancelled = output<void>();

  form: FormGroup;
  isSaving = signal(false);
  error = signal<string | null>(null);
  temporaryPassword = signal<string | null>(null);

  readonly roles = [
    { value: Role.ADMIN, label: 'Administrador' },
    { value: Role.TRAINER, label: 'Entrenador' },
    { value: Role.USER, label: 'Usuario' },
  ];

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      role: [Role.USER, [Validators.required]],
    });

    effect(() => {
      if (this.isOpen()) {
        this.resetForm();
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    this.userService.create(this.form.value).subscribe({
      next: (response: CreateUserResult) => {
        this.isSaving.set(false);
        this.temporaryPassword.set(response.temporaryPassword);
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err.error?.message || 'Error al crear usuario');
        this.isSaving.set(false);
      },
    });
  }

  onClose(): void {
    this.cancelled.emit();
    this.resetForm();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      if (!this.temporaryPassword()) {
        this.onClose();
      }
    }
  }

  resetForm(): void {
    this.form.reset({
      name: '',
      email: '',
      role: Role.USER,
    });
    this.isSaving.set(false);
    this.error.set(null);
    this.temporaryPassword.set(null);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!field && field.invalid && field.touched;
  }
}
