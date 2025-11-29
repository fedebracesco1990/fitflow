import { Component, inject, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { Login, ClearAuthError, AuthState } from '../../../../core/store';

@Component({
  selector: 'fit-flow-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
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

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}
