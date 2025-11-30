import { Component, inject, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { Login, ClearAuthError, AuthState } from '../../../../core/store';
import { AlertComponent, ButtonComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AlertComponent, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly isLoading = this.store.selectSignal(AuthState.isLoading);
  readonly error = this.store.selectSignal(AuthState.error);
  readonly isAuthenticated = this.store.selectSignal(AuthState.isAuthenticated);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor() {
    effect(() => {
      if (this.isAuthenticated()) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.store.dispatch(new ClearAuthError());
      this.store.dispatch(new Login(this.form.value));
    } else {
      this.form.markAllAsTouched();
    }
  }

  // Getters for template - reactive forms need getters, not computed signals
  get emailInvalid(): boolean {
    const control = this.form.get('email');
    return !!(control && control.invalid && control.touched);
  }

  get passwordInvalid(): boolean {
    const control = this.form.get('password');
    return !!(control && control.invalid && control.touched);
  }

  get isSubmitDisabled(): boolean {
    return this.isLoading() || this.form.invalid;
  }
}
