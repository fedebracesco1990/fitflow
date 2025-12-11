import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MembershipsService, MembershipTypesService, UserService } from '../../../../core/services';
import {
  MembershipType,
  User,
  MembershipStatus,
  MembershipStatusLabels,
} from '../../../../core/models';
import { AlertComponent, ButtonComponent, CardComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-membership-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AlertComponent, ButtonComponent, CardComponent],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class MembershipFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly membershipsService = inject(MembershipsService);
  private readonly membershipTypesService = inject(MembershipTypesService);
  private readonly userService = inject(UserService);

  readonly form: FormGroup;
  readonly isEditMode = signal(false);
  readonly loading = signal(false);
  readonly loadingData = signal(true);
  readonly error = signal<string | null>(null);

  readonly users = signal<User[]>([]);
  readonly membershipTypes = signal<MembershipType[]>([]);

  readonly MembershipStatusLabels = MembershipStatusLabels;
  readonly statuses = Object.values(MembershipStatus);

  private membershipId: string | null = null;

  readonly pageTitle = computed(() => (this.isEditMode() ? 'Editar Membresía' : 'Nueva Membresía'));

  constructor() {
    const today = new Date().toISOString().split('T')[0];

    this.form = this.fb.group({
      userId: ['', Validators.required],
      membershipTypeId: ['', Validators.required],
      startDate: [today, Validators.required],
      endDate: [''],
      status: [MembershipStatus.ACTIVE],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.loadFormData();

    this.membershipId = this.route.snapshot.paramMap.get('id');
    if (this.membershipId) {
      this.isEditMode.set(true);
      this.loadMembership(this.membershipId);
    }
  }

  loadFormData(): void {
    this.loadingData.set(true);

    // Load users
    this.userService.getAll({ limit: 100 }).subscribe({
      next: (response) => {
        this.users.set(response.data);
      },
      error: () => {
        this.error.set('Error al cargar usuarios');
      },
    });

    // Load membership types
    this.membershipTypesService.getAll().subscribe({
      next: (types) => {
        this.membershipTypes.set(types);
        this.loadingData.set(false);
      },
      error: () => {
        this.error.set('Error al cargar tipos de membresía');
        this.loadingData.set(false);
      },
    });
  }

  loadMembership(id: string): void {
    this.loading.set(true);
    this.membershipsService.getById(id).subscribe({
      next: (membership) => {
        this.form.patchValue({
          userId: membership.userId,
          membershipTypeId: membership.membershipTypeId,
          startDate: membership.startDate,
          endDate: membership.endDate,
          status: membership.status,
          notes: membership.notes || '',
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar la membresía');
        this.loading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.form.value;

    if (this.isEditMode() && this.membershipId) {
      const updateData = {
        startDate: formValue.startDate,
        endDate: formValue.endDate || undefined,
        status: formValue.status,
        notes: formValue.notes || undefined,
      };

      this.membershipsService.update(this.membershipId, updateData).subscribe({
        next: () => {
          this.router.navigate(['/memberships']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al actualizar la membresía');
          this.loading.set(false);
        },
      });
    } else {
      const createData = {
        userId: formValue.userId,
        membershipTypeId: formValue.membershipTypeId,
        startDate: formValue.startDate,
        notes: formValue.notes || undefined,
      };

      this.membershipsService.create(createData).subscribe({
        next: () => {
          this.router.navigate(['/memberships']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al crear la membresía');
          this.loading.set(false);
        },
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!field && field.invalid && field.touched;
  }
}
