import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MembershipsService } from '../../../../core/services';
import { Membership, MembershipStatus, MembershipStatusLabels } from '../../../../core/models';
import { PaginationMeta } from '../../../../core/models/api-response.model';
import {
  AlertComponent,
  ButtonComponent,
  CardComponent,
  BadgeComponent,
  ConfirmDialogComponent,
} from '../../../../shared';
import { MembershipDialogComponent } from '../../components';

@Component({
  selector: 'fit-flow-memberships-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    AlertComponent,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    ConfirmDialogComponent,
    MembershipDialogComponent,
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class MembershipsListComponent implements OnInit {
  private readonly membershipsService = inject(MembershipsService);

  readonly memberships = signal<Membership[]>([]);
  readonly paginationMeta = signal<PaginationMeta | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly MembershipStatusLabels = MembershipStatusLabels;

  // Dialog state
  readonly showMembershipDialog = signal(false);
  readonly showDeleteDialog = signal(false);
  readonly showCancelDialog = signal(false);
  readonly selectedMembership = signal<Membership | null>(null);

  ngOnInit(): void {
    this.loadMemberships();
  }

  loadMemberships(page = 1): void {
    this.loading.set(true);
    this.error.set(null);

    this.membershipsService.getAll({ page, limit: 20 }).subscribe({
      next: (response) => {
        this.memberships.set(response.data);
        this.paginationMeta.set(response.meta);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar las membresías');
        this.loading.set(false);
      },
    });
  }

  openDeleteDialog(membership: Membership): void {
    this.selectedMembership.set(membership);
    this.showDeleteDialog.set(true);
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog.set(false);
    this.selectedMembership.set(null);
  }

  confirmDelete(): void {
    const membership = this.selectedMembership();
    if (!membership) return;

    this.membershipsService.delete(membership.id).subscribe({
      next: () => {
        this.memberships.update((list) => list.filter((m) => m.id !== membership.id));
        this.closeDeleteDialog();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al eliminar la membresía');
        this.closeDeleteDialog();
      },
    });
  }

  openCancelDialog(membership: Membership): void {
    this.selectedMembership.set(membership);
    this.showCancelDialog.set(true);
  }

  closeCancelDialog(): void {
    this.showCancelDialog.set(false);
    this.selectedMembership.set(null);
  }

  confirmCancel(): void {
    const membership = this.selectedMembership();
    if (!membership) return;

    this.membershipsService.cancel(membership.id).subscribe({
      next: (updated) => {
        this.memberships.update((list) => list.map((m) => (m.id === membership.id ? updated : m)));
        this.closeCancelDialog();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cancelar la membresía');
        this.closeCancelDialog();
      },
    });
  }

  openCreateDialog(): void {
    this.showMembershipDialog.set(true);
  }

  closeMembershipDialog(): void {
    this.showMembershipDialog.set(false);
    this.loadMemberships();
  }

  getUserName(membership: Membership): string {
    return membership.user?.name || 'Usuario desconocido';
  }

  getMembershipTypeName(membership: Membership): string {
    return membership.membershipType?.name || 'Sin tipo';
  }

  getStatusBadgeVariant(status: MembershipStatus): 'success' | 'warning' | 'error' | 'neutral' {
    switch (status) {
      case MembershipStatus.ACTIVE:
        return 'success';
      case MembershipStatus.GRACE_PERIOD:
        return 'warning';
      case MembershipStatus.EXPIRED:
      case MembershipStatus.CANCELLED:
        return 'error';
      default:
        return 'neutral';
    }
  }
}
