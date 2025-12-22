import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MembershipTypesService } from '../../../../core/services';
import { MembershipType, AccessType } from '../../../../core/models';
import { Store } from '@ngxs/store';
import { AuthState } from '../../../../core/store/auth/auth.state';
import {
  CardComponent,
  ButtonComponent,
  AlertComponent,
  ConfirmDialogComponent,
  TooltipComponent,
} from '../../../../shared';

@Component({
  selector: 'fit-flow-membership-types-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardComponent,
    ButtonComponent,
    AlertComponent,
    ConfirmDialogComponent,
    TooltipComponent,
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class MembershipTypesListComponent implements OnInit {
  private readonly membershipTypesService = inject(MembershipTypesService);
  private readonly store = inject(Store);

  membershipTypes = signal<MembershipType[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  showDeleteDialog = signal(false);
  selectedType = signal<MembershipType | null>(null);

  isAdmin = this.store.selectSignal(AuthState.isAdmin);

  ngOnInit(): void {
    this.loadMembershipTypes();
  }

  loadMembershipTypes(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.membershipTypesService.getAll(true).subscribe({
      next: (types) => {
        this.membershipTypes.set(types);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar los tipos de membresía');
        this.isLoading.set(false);
      },
    });
  }

  openDeleteDialog(type: MembershipType): void {
    this.selectedType.set(type);
    this.showDeleteDialog.set(true);
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog.set(false);
    this.selectedType.set(null);
  }

  confirmDelete(): void {
    const type = this.selectedType();
    if (!type) return;

    this.membershipTypesService.delete(type.id).subscribe({
      next: () => {
        this.membershipTypes.update((types) => types.filter((t) => t.id !== type.id));
        this.closeDeleteDialog();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al eliminar el tipo de membresía');
        this.closeDeleteDialog();
      },
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(price);
  }

  formatAccessType(accessType: AccessType): string {
    const accessTypeMap: Record<AccessType, string> = {
      [AccessType.GYM_ONLY]: 'Solo Gimnasio',
      [AccessType.ALL_ACCESS]: 'Acceso Completo',
      [AccessType.CLASSES_ONLY]: 'Solo Clases',
    };
    return accessTypeMap[accessType] || accessType;
  }

  getTooltipContent(type: MembershipType): string {
    const duration = this.formatDuration(type.durationDays);
    const lines = [
      type.description || 'Sin descripción',
      `Duración: ${duration}`,
      `Días de gracia: ${type.gracePeriodDays}`,
    ];
    return lines.join('\n');
  }

  private formatDuration(days: number): string {
    if (days === 1) return '1 día';
    if (days < 30) return `${days} días`;
    if (days === 30) return '1 mes';
    if (days === 60) return '2 meses';
    if (days === 90) return '3 meses';
    if (days === 180) return '6 meses';
    if (days === 365) return '1 año';
    return `${days} días`;
  }
}
