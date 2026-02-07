import { Component, inject, signal, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { UserService } from '../../../../core/services';
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

  readonly roles = [
    { value: Role.ADMIN, label: 'Administrador' },
    { value: Role.TRAINER, label: 'Entrenador' },
    { value: Role.USER, label: 'Usuario' },
  ];

  constructor() {
    this.form = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(50),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
        role: [Role.USER, [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...userData } = this.form.value;

    this.userService.create(userData).subscribe({
      next: () => {
        this.cancelled.emit();
        this.resetForm();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al crear usuario');
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
      email: '',
      password: '',
      confirmPassword: '',
      role: Role.USER,
    });
    this.isSaving.set(false);
    this.error.set(null);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!field && field.invalid && field.touched;
  }

  get passwordMismatch(): boolean {
    return this.form.hasError('passwordMismatch') && !!this.form.get('confirmPassword')?.touched;
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }
}
