import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { UserState, UpdateProfile, ClearUserError, ClearUserSuccess } from '../../../../core/store';
import { AlertComponent, ButtonComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-edit-profile',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AlertComponent, ButtonComponent],
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
  });

  ngOnInit(): void {
    this.store.dispatch(new ClearUserError());
    this.store.dispatch(new ClearUserSuccess());

    const profile = this.profile();
    if (profile) {
      this.form.patchValue({
        name: profile.name,
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

  // Getters for template - reactive forms need getters
  get nameInvalid(): boolean {
    const control = this.form.get('name');
    return !!(control && control.invalid && control.touched);
  }

  get isSubmitDisabled(): boolean {
    return this.isLoading() || this.form.invalid || !this.form.dirty;
  }
}
