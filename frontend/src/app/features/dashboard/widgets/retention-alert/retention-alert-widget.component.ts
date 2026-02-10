import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UsersService } from '../../../../core/services/users.service';
import { InactiveUser } from '../../../../core/models';
import { CardComponent, BadgeComponent } from '../../../../shared';
import { RetentionMessageDialogComponent } from './retention-message-dialog/retention-message-dialog.component';

@Component({
  selector: 'fit-flow-retention-alert-widget',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    CardComponent,
    BadgeComponent,
    RetentionMessageDialogComponent,
  ],
  templateUrl: './retention-alert-widget.component.html',
  styleUrl: './retention-alert-widget.component.scss',
})
export class RetentionAlertWidgetComponent implements OnInit {
  private readonly usersService = inject(UsersService);

  readonly users = signal<InactiveUser[]>([]);
  readonly dialogOpen = signal(false);
  readonly selectedUser = signal<InactiveUser | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly expanded = signal(false);
  readonly contactedUserIds = signal<Set<string>>(new Set());

  readonly usersWithStatus = computed(() => {
    const contacted = this.contactedUserIds();
    return this.users().map((user) => ({
      ...user,
      contacted: contacted.has(user.id),
    }));
  });

  readonly pendingCount = computed(() => {
    const contacted = this.contactedUserIds();
    return this.users().filter((u) => !contacted.has(u.id)).length;
  });

  readonly totalCount = computed(() => this.users().length);

  private get storageKey(): string {
    const now = new Date();
    return `retention-contacted-${now.getMonth() + 1}-${now.getFullYear()}`;
  }

  ngOnInit(): void {
    this.loadContactedUsers();
    this.loadInactiveUsers();
  }

  toggleExpanded(): void {
    this.expanded.update((v) => !v);
  }

  openMessageDialog(user: InactiveUser): void {
    this.selectedUser.set(user);
    this.dialogOpen.set(true);
  }

  onDialogClosed(): void {
    this.dialogOpen.set(false);
    this.selectedUser.set(null);
  }

  onMessageSent(): void {
    const user = this.selectedUser();
    if (user) {
      this.markAsContacted(user.id);
    }
  }

  private markAsContacted(userId: string): void {
    this.contactedUserIds.update((set) => {
      const newSet = new Set(set);
      newSet.add(userId);
      this.saveContactedUsers(newSet);
      return newSet;
    });
  }

  formatDaysSince(days: number): string {
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    }
    const months = Math.floor(days / 30);
    return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  }

  private loadInactiveUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.usersService.getInactiveUsers({ daysSinceLastVisit: 7 }).subscribe({
      next: (response) => {
        this.users.set(response.users);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar usuarios');
        this.loading.set(false);
      },
    });
  }

  private loadContactedUsers(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const ids = JSON.parse(stored) as string[];
        this.contactedUserIds.set(new Set(ids));
      } catch {
        this.contactedUserIds.set(new Set());
      }
    }
  }

  private saveContactedUsers(userIds: Set<string>): void {
    localStorage.setItem(this.storageKey, JSON.stringify([...userIds]));
  }
}
