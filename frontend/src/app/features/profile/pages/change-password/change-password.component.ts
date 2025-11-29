import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import {
  UserState,
  ChangePassword,
  ClearUserError,
  ClearUserSuccess,
} from '../../../../core/store';

@Component({
  selector: 'fit-flow-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  readonly isLoading = this.store.selectSignal(UserState.isLoading);
  readonly error = this.store.selectSignal(UserState.error);
  readonly successMessage = this.store.selectSignal(UserState.successMessage);

  form: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(50),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator }
  );

  constructor() {
    this.store.dispatch(new ClearUserError());
    this.store.dispatch(new ClearUserSuccess());
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.store.dispatch(new ClearUserError());
      this.store.dispatch(
        new ChangePassword({
          currentPassword: this.form.value.currentPassword,
          newPassword: this.form.value.newPassword,
        })
      );
      this.form.reset();
    } else {
      this.form.markAllAsTouched();
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }
}
