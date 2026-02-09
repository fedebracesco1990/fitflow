import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { UserService } from '../../../../core/services';
import { User, Role } from '../../../../core/models';
import { MembershipStatus } from '../../../../core/models/membership.model';
import {
  AlertComponent,
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  LoadingSpinnerComponent,
} from '../../../../shared';
import { MembershipDialogComponent } from '../../../memberships/components';
import { UserProgramHistoryComponent } from '../../components';

@Component({
  selector: 'fit-flow-user-detail',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    LoadingSpinnerComponent,
    MembershipDialogComponent,
    UserProgramHistoryComponent,
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class UserDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);

  readonly user = signal<User | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly showMembershipDialog = signal(false);

  readonly userId = computed(() => this.user()?.id || '');

  readonly roleLabel = computed(() => {
    const labels: Record<string, string> = {
      [Role.ADMIN]: 'Administrador',
      [Role.TRAINER]: 'Entrenador',
      [Role.USER]: 'Usuario',
    };
    return labels[this.user()?.role || ''] || 'Usuario';
  });

  readonly roleBadgeVariant = computed(
    (): 'primary' | 'neutral' | 'success' | 'warning' | 'error' => {
      switch (this.user()?.role) {
        case Role.ADMIN:
          return 'error';
        case Role.TRAINER:
          return 'warning';
        case Role.USER:
          return 'primary';
        default:
          return 'neutral';
      }
    }
  );

  readonly membership = computed(() => {
    const memberships = this.user()?.memberships;
    if (!memberships || memberships.length === 0) return null;
    const active = memberships.find(
      (m: { status: string }) => m.status === MembershipStatus.ACTIVE
    );
    return active || memberships[0];
  });

  readonly membershipStatusLabel = computed(() => {
    const status = this.membership()?.status;
    if (!status) return 'Sin membresía';
    const labels: Record<string, string> = {
      [MembershipStatus.ACTIVE]: 'Activa',
      [MembershipStatus.EXPIRED]: 'Vencida',
      [MembershipStatus.GRACE_PERIOD]: 'Período de Gracia',
      [MembershipStatus.CANCELLED]: 'Cancelada',
    };
    return labels[status] || status;
  });

  readonly membershipBadgeVariant = computed(
    (): 'primary' | 'neutral' | 'success' | 'warning' | 'error' => {
      const status = this.membership()?.status;
      if (!status) return 'neutral';
      switch (status) {
        case MembershipStatus.ACTIVE:
          return 'success';
        case MembershipStatus.EXPIRED:
          return 'error';
        case MembershipStatus.GRACE_PERIOD:
          return 'warning';
        case MembershipStatus.CANCELLED:
          return 'neutral';
        default:
          return 'neutral';
      }
    }
  );

  readonly formattedDate = computed(() => {
    const date = this.user()?.createdAt;
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUser(id);
    }
  }

  openMembershipDialog(): void {
    this.showMembershipDialog.set(true);
  }

  closeMembershipDialog(): void {
    this.showMembershipDialog.set(false);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUser(id);
    }
  }

  private loadUser(id: string): void {
    this.loading.set(true);
    this.userService.getById(id).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar el usuario');
        this.loading.set(false);
      },
    });
  }
}
