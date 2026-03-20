import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthService, StorageService } from '../../../../core/services';
import { CheckSessionSuccess, AuthState } from '../../../../core/store';
import { AlertComponent, ButtonComponent } from '../../../../shared';
import { TokensResponse } from '../../../../core/models';

@Component({
  selector: 'fit-flow-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, AlertComponent, ButtonComponent],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly storage = inject(StorageService);
  private readonly store = inject(Store);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  form: FormGroup = this.fb.group(
    {
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

  ngOnInit(): void {
    const mustChange = this.store.selectSnapshot(AuthState.mustChangePassword);
    if (!mustChange) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.changePasswordForced({ newPassword: this.form.value.newPassword }).subscribe({
      next: (tokens: TokensResponse) => {
        this.storage.setTokens(tokens.accessToken, tokens.refreshToken);
        this.authService.checkSession().subscribe({
          next: (response) => {
            this.isLoading.set(false);
            this.store.dispatch(new CheckSessionSuccess(response.user));
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.isLoading.set(false);
            this.router.navigate(['/dashboard']);
          },
        });
      },
      error: (error: { error?: { message?: string } }) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Ha ocurrido un error al cambiar la contraseña'
        );
      },
    });
  }

  get newPasswordInvalid(): boolean {
    const control = this.form.get('newPassword');
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
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }
}
