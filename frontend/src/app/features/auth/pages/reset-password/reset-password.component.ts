import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services';
import { AlertComponent, ButtonComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AlertComponent, ButtonComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly isLoading = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly invalidLink = signal(false);

  private token = '';
  private userId = '';

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
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'] || '';
      this.userId = params['userId'] || '';

      if (!this.token || !this.userId) {
        this.invalidLink.set(true);
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      this.authService
        .resetPassword({
          token: this.token,
          userId: this.userId,
          newPassword: this.form.value.newPassword,
        })
        .subscribe({
          next: (response) => {
            this.isLoading.set(false);
            this.successMessage.set(response.message);
          },
          error: (error) => {
            this.isLoading.set(false);
            this.errorMessage.set(error.friendlyMessage || 'Ha ocurrido un error');
          },
        });
    } else {
      this.form.markAllAsTouched();
    }
  }

  // Getters for template - reactive forms need getters
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
