import { Component, inject, effect } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { Register, ClearAuthError, AuthState } from '../../../../core/store';
import { AlertComponent, ButtonComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AlertComponent, ButtonComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly isLoading = this.store.selectSignal(AuthState.isLoading);
  readonly error = this.store.selectSignal(AuthState.error);
  readonly isAuthenticated = this.store.selectSignal(AuthState.isAuthenticated);

  constructor() {
    effect(() => {
      if (this.isAuthenticated()) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  form: FormGroup = this.fb.group(
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
    },
    { validators: this.passwordMatchValidator }
  );

  onSubmit(): void {
    if (this.form.valid) {
      this.store.dispatch(new ClearAuthError());
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = this.form.value;
      this.store.dispatch(new Register(registerData));
    } else {
      this.form.markAllAsTouched();
    }
  }

  // Getters for template - reactive forms need getters, not computed signals
  get nameInvalid(): boolean {
    const control = this.form.get('name');
    return !!(control && control.invalid && control.touched);
  }

  get emailInvalid(): boolean {
    const control = this.form.get('email');
    return !!(control && control.invalid && control.touched);
  }

  get passwordInvalid(): boolean {
    const control = this.form.get('password');
    return !!(control && control.invalid && control.touched);
  }

  get confirmPasswordInvalid(): boolean {
    const control = this.form.get('confirmPassword');
    return !!(control && control.invalid && control.touched);
  }

  get isSubmitDisabled(): boolean {
    return this.isLoading() || this.form.invalid;
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
