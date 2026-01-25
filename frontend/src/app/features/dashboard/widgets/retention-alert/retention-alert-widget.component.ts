import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { UsersService } from '../../../../core/services/users.service';
import { LowAttendanceUser } from '../../../../core/models';
import { CardComponent, BadgeComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-retention-alert-widget',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CardComponent, BadgeComponent],
  templateUrl: './retention-alert-widget.component.html',
  styleUrl: './retention-alert-widget.component.scss',
})
export class RetentionAlertWidgetComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);

  readonly users = signal<LowAttendanceUser[]>([]);
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
    this.loadLowAttendanceUsers();
  }

  toggleExpanded(): void {
    this.expanded.update((v) => !v);
  }

  toggleContacted(userId: string): void {
    this.contactedUserIds.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      this.saveContactedUsers(newSet);
      return newSet;
    });
  }

  sendMessage(user: LowAttendanceUser): void {
    this.router.navigate(['/notifications/send'], {
      queryParams: { userId: user.id, userName: user.name },
    });
  }

  formatLastAttendance(date: string | null): string {
    if (!date) return 'Sin registros';
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
  }

  private loadLowAttendanceUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.usersService.getLowAttendanceUsers().subscribe({
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
