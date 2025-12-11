import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MembershipTypesService } from '../../../../core/services';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';

@Component({
  selector: 'fit-flow-membership-type-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardComponent,
    ButtonComponent,
    AlertComponent,
  ],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class MembershipTypeFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly membershipTypesService = inject(MembershipTypesService);

  form: FormGroup;
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  membershipTypeId = signal<string | null>(null);

  isEditMode = computed(() => !!this.membershipTypeId());
  pageTitle = computed(() =>
    this.isEditMode() ? 'Editar Tipo de Membresía' : 'Nuevo Tipo de Membresía'
  );

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      durationDays: [30, [Validators.required, Validators.min(1)]],
      gracePeriodDays: [0, [Validators.min(0)]],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.membershipTypeId.set(id);
      this.loadMembershipType(id);
    }
  }

  loadMembershipType(id: string): void {
    this.isLoading.set(true);
    this.membershipTypesService.getById(id).subscribe({
      next: (type) => {
        this.form.patchValue({
          name: type.name,
          description: type.description || '',
          price: type.price,
          durationDays: type.durationDays,
          gracePeriodDays: type.gracePeriodDays,
          isActive: type.isActive,
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar el tipo de membresía');
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

    const formData = this.form.value;

    // Convertir valores numéricos (los inputs HTML devuelven strings)
    const baseData = {
      ...formData,
      price: Number(formData.price),
      durationDays: Number(formData.durationDays),
      gracePeriodDays: Number(formData.gracePeriodDays) || 0,
    };

    // isActive solo se envía en modo edición (el backend no lo acepta en creación)
    const data = this.isEditMode() ? baseData : { ...baseData, isActive: undefined };

    const request$ = this.isEditMode()
      ? this.membershipTypesService.update(this.membershipTypeId()!, data)
      : this.membershipTypesService.create(data);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/membership-types']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al guardar el tipo de membresía');
        this.isSaving.set(false);
      },
    });
  }

  // Form validation helpers
  get nameInvalid(): boolean {
    const control = this.form.get('name');
    return !!(control?.invalid && control?.touched);
  }

  get priceInvalid(): boolean {
    const control = this.form.get('price');
    return !!(control?.invalid && control?.touched);
  }

  get durationInvalid(): boolean {
    const control = this.form.get('durationDays');
    return !!(control?.invalid && control?.touched);
  }

  get isSubmitDisabled(): boolean {
    return this.form.invalid || this.isSaving();
  }
}
