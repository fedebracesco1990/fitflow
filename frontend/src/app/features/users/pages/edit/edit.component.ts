import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../../core/services';
import { Role } from '../../../../core/models';
import { AlertComponent, ButtonComponent, CardComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-user-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AlertComponent, ButtonComponent, CardComponent],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class UserEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly userId = signal<string>('');

  readonly roles = [
    { value: Role.ADMIN, label: 'Administrador' },
    { value: Role.TRAINER, label: 'Entrenador' },
    { value: Role.USER, label: 'Usuario' },
  ];

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    role: [Role.USER, [Validators.required]],
    isActive: [true],
  });

  readonly isSubmitDisabled = computed(() => this.form.invalid || this.isSaving());

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId.set(id);
      this.loadUser(id);
    }
  }

  private loadUser(id: string): void {
    this.isLoading.set(true);
    this.userService.getById(id).subscribe({
      next: (user) => {
        this.form.patchValue({
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar el usuario');
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    this.userService.update(this.userId(), this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/users', this.userId()]);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al actualizar el usuario');
        this.isSaving.set(false);
      },
    });
  }

  get nameInvalid(): boolean {
    const control = this.form.get('name');
    return !!(control?.invalid && control?.touched);
  }

  get emailInvalid(): boolean {
    const control = this.form.get('email');
    return !!(control?.invalid && control?.touched);
  }

  get roleInvalid(): boolean {
    const control = this.form.get('role');
    return !!(control?.invalid && control?.touched);
  }
}
