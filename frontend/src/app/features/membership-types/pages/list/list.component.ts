import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MembershipTypesService } from '../../../../core/services';
import { MembershipType } from '../../../../core/models';
import { Store } from '@ngxs/store';
import { AuthState } from '../../../../core/store/auth/auth.state';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';

@Component({
  selector: 'fit-flow-membership-types-list',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, ButtonComponent, AlertComponent],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class MembershipTypesListComponent implements OnInit {
  private readonly membershipTypesService = inject(MembershipTypesService);
  private readonly store = inject(Store);

  membershipTypes = signal<MembershipType[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  deleteConfirmId = signal<string | null>(null);

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

  confirmDelete(id: string): void {
    this.deleteConfirmId.set(id);
  }

  cancelDelete(): void {
    this.deleteConfirmId.set(null);
  }

  deleteType(id: string): void {
    this.membershipTypesService.delete(id).subscribe({
      next: () => {
        this.membershipTypes.update((types) => types.filter((t) => t.id !== id));
        this.deleteConfirmId.set(null);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al eliminar el tipo de membresía');
        this.deleteConfirmId.set(null);
      },
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(price);
  }

  formatDuration(days: number): string {
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
