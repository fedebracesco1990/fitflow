import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserService } from '../../../../core/services';
import { User, Role } from '../../../../core/models';
import { MembershipStatus } from '../../../../core/models/membership.model';
import { PaginationMeta } from '../../../../core/models/api-response.model';
import { AlertComponent, ButtonComponent, CardComponent, BadgeComponent } from '../../../../shared';
import { LucideAngularModule } from 'lucide-angular';
import { UserDialogComponent } from '../../components';

@Component({
  selector: 'fit-flow-users-list',
  standalone: true,
  imports: [
    RouterLink,
    AlertComponent,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    DatePipe,
    LucideAngularModule,
    UserDialogComponent,
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class UsersListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly searchSubject = new Subject<string>();

  readonly users = signal<User[]>([]);
  readonly paginationMeta = signal<PaginationMeta | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly selectedRole = signal<string>('');
  readonly selectedMembershipStatus = signal<string>('');

  readonly showUserDialog = signal(false);

  readonly Role = Role;
  readonly MembershipStatus = MembershipStatus;

  readonly roles = [
    { value: '', label: 'Todos los roles' },
    { value: Role.ADMIN, label: 'Administrador' },
    { value: Role.TRAINER, label: 'Entrenador' },
    { value: Role.USER, label: 'Usuario' },
  ];

  readonly membershipStatuses = [
    { value: '', label: 'Todos los estados' },
    { value: MembershipStatus.ACTIVE, label: 'Activa' },
    { value: MembershipStatus.EXPIRED, label: 'Vencida' },
    { value: MembershipStatus.GRACE_PERIOD, label: 'Período de Gracia' },
    { value: MembershipStatus.CANCELLED, label: 'Cancelada' },
  ];

  constructor() {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.searchTerm.set(term);
      this.loadUsers(1);
    });

    effect(() => {
      const role = this.selectedRole();
      const status = this.selectedMembershipStatus();
      if (role !== undefined || status !== undefined) {
        this.loadUsers(1);
      }
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page = 1): void {
    this.loading.set(true);
    this.error.set(null);

    const params = {
      page,
      limit: 20,
      search: this.searchTerm() || undefined,
      role: this.selectedRole() || undefined,
      membershipStatus: this.selectedMembershipStatus() || undefined,
    };

    this.userService.getAll(params).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.paginationMeta.set(response.meta);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar usuarios');
        this.loading.set(false);
      },
    });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  onRoleChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedRole.set(select.value);
  }

  onMembershipStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedMembershipStatus.set(select.value);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedRole.set('');
    this.selectedMembershipStatus.set('');
    const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
    if (searchInput) searchInput.value = '';
    this.loadUsers(1);
  }

  getRoleBadgeVariant(role: Role): 'primary' | 'neutral' | 'success' | 'warning' | 'error' {
    switch (role) {
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

  getRoleLabel(role: Role): string {
    switch (role) {
      case Role.ADMIN:
        return 'Admin';
      case Role.TRAINER:
        return 'Entrenador';
      case Role.USER:
        return 'Usuario';
      default:
        return role;
    }
  }

  getMembershipStatusBadgeVariant(
    status: string | null
  ): 'primary' | 'neutral' | 'success' | 'warning' | 'error' {
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

  getMembershipStatusLabel(status: string | null): string {
    if (!status) return 'Sin membresía';
    switch (status) {
      case MembershipStatus.ACTIVE:
        return 'Activa';
      case MembershipStatus.EXPIRED:
        return 'Vencida';
      case MembershipStatus.GRACE_PERIOD:
        return 'Período de Gracia';
      case MembershipStatus.CANCELLED:
        return 'Cancelada';
      default:
        return status;
    }
  }

  openCreateDialog(): void {
    this.showUserDialog.set(true);
  }

  closeUserDialog(): void {
    this.showUserDialog.set(false);
    this.loadUsers(1);
  }

  getUserMembership(user: User) {
    if (!user.memberships || user.memberships.length === 0) return null;
    const activeMembership = user.memberships.find(
      (m: { status: string }) => m.status === MembershipStatus.ACTIVE
    );
    if (activeMembership) return activeMembership;
    return user.memberships[0];
  }
}
