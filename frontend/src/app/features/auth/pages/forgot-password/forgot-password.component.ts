import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services';

@Component({
  selector: 'fit-flow-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly isLoading = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      this.authService.forgotPassword(this.form.value).subscribe({
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

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}
