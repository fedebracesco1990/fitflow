import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { UserState, UpdateProfile, ClearUserError, ClearUserSuccess } from '../../../../core/store';

@Component({
  selector: 'fit-flow-edit-profile',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss',
})
export class EditProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly profile = this.store.selectSignal(UserState.profile);
  readonly isLoading = this.store.selectSignal(UserState.isLoading);
  readonly error = this.store.selectSignal(UserState.error);
  readonly successMessage = this.store.selectSignal(UserState.successMessage);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.store.dispatch(new ClearUserError());
    this.store.dispatch(new ClearUserSuccess());

    const profile = this.profile();
    if (profile) {
      this.form.patchValue({
        name: profile.name,
        email: profile.email,
      });
    }
  }

  onSubmit(): void {
    if (this.form.valid && this.form.dirty) {
      this.store.dispatch(new ClearUserError());
      this.store.dispatch(new UpdateProfile(this.form.value));
    } else {
      this.form.markAllAsTouched();
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}
