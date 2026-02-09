import { Component, OnInit, input, output, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../../core/services/users.service';
import { UserRoutinesService } from '../../../../core/services/user-routines.service';
import { UserProgramsService } from '../../../../core/services/user-programs.service';
import {
  User,
  Role,
  DayOfWeek,
  DayOfWeekLabels,
  BulkAssignResult,
  RoutineType,
} from '../../../../core/models';
import { forkJoin } from 'rxjs';
import { ButtonComponent } from '../../../../shared';

interface SelectableUser extends User {
  selected: boolean;
  activeProgramName: string | null;
}

@Component({
  selector: 'fit-flow-assign-routine-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './assign-routine-dialog.component.html',
  styleUrl: './assign-routine-dialog.component.scss',
})
export class AssignRoutineDialogComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly userRoutinesService = inject(UserRoutinesService);
  private readonly userProgramsService = inject(UserProgramsService);

  isOpen = input(false);
  routineId = input.required<string>();
  routineName = input('');
  routineType = input<RoutineType>(RoutineType.DAILY);

  isWeeklyProgram = computed(() => this.routineType() === RoutineType.WEEKLY);

  confirmed = output<BulkAssignResult>();
  cancelled = output<void>();

  users = signal<SelectableUser[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  searchQuery = signal('');

  showReplaceConfirm = signal(false);
  usersWithPlan = signal<SelectableUser[]>([]);

  startDate = signal(new Date().toISOString().split('T')[0]);
  selectedDay = signal<DayOfWeek>(DayOfWeek.MONDAY);

  days = Object.values(DayOfWeek);
  dayLabels = DayOfWeekLabels;

  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.users();
    return this.users().filter(
      (u) => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
    );
  });

  selectedUsers = computed(() => this.users().filter((u) => u.selected));
  selectedCount = computed(() => this.selectedUsers().length);

  allFilteredSelected = computed(() => {
    const filtered = this.filteredUsers();
    return filtered.length > 0 && filtered.every((u) => u.selected);
  });

  someFilteredSelected = computed(() => {
    const filtered = this.filteredUsers();
    return filtered.some((u) => u.selected) && !filtered.every((u) => u.selected);
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.usersService.getAll({ role: Role.USER, limit: 100 }).subscribe({
      next: (response) => {
        const users = response.data.map((u) => ({
          ...u,
          selected: false,
          activeProgramName: null as string | null,
        }));
        this.users.set(users);
        this.loadActivePrograms(users);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar usuarios');
        this.loading.set(false);
      },
    });
  }

  private loadActivePrograms(users: SelectableUser[]): void {
    if (!this.isWeeklyProgram() || users.length === 0) {
      this.loading.set(false);
      return;
    }

    const requests = users.map((u) => this.userProgramsService.getActiveByUser(u.id));

    forkJoin(requests).subscribe({
      next: (results) => {
        this.users.update((list) =>
          list.map((u, i) => ({
            ...u,
            activeProgramName: results[i]?.programName ?? null,
          }))
        );
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  toggleUser(user: SelectableUser): void {
    this.users.update((list) =>
      list.map((u) => (u.id === user.id ? { ...u, selected: !u.selected } : u))
    );
  }

  selectAll(): void {
    const filtered = this.filteredUsers();
    const allSelected = filtered.every((u) => u.selected);
    this.users.update((list) =>
      list.map((u) => {
        const isInFiltered = filtered.some((f) => f.id === u.id);
        return isInFiltered ? { ...u, selected: !allSelected } : u;
      })
    );
  }

  onConfirm(): void {
    const selected = this.selectedUsers();
    if (selected.length === 0) {
      this.error.set('Selecciona al menos un usuario');
      return;
    }

    if (this.isWeeklyProgram()) {
      const withPlan = selected.filter((u) => u.activeProgramName);
      if (withPlan.length > 0) {
        this.usersWithPlan.set(withPlan);
        this.showReplaceConfirm.set(true);
        return;
      }
    }

    this.executeAssignment(selected);
  }

  confirmReplace(): void {
    this.showReplaceConfirm.set(false);
    this.executeAssignment(this.selectedUsers());
  }

  cancelReplace(): void {
    this.showReplaceConfirm.set(false);
    this.usersWithPlan.set([]);
  }

  private executeAssignment(selected: SelectableUser[]): void {
    this.saving.set(true);
    this.error.set(null);

    if (this.isWeeklyProgram()) {
      this.assignWeeklyProgram(selected);
    } else {
      this.assignDailyRoutine(selected);
    }
  }

  private assignDailyRoutine(selected: SelectableUser[]): void {
    const assignments = selected.map((u) => ({
      userId: u.id,
      dayOfWeek: this.selectedDay(),
    }));

    this.userRoutinesService
      .assignBulk({
        routineId: this.routineId(),
        assignments,
        startDate: this.startDate(),
      })
      .subscribe({
        next: (result) => {
          this.saving.set(false);
          this.resetForm();
          this.confirmed.emit(result);
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(err.error?.message || 'Error al asignar rutina');
        },
      });
  }

  private assignWeeklyProgram(selected: SelectableUser[]): void {
    const userIds = selected.map((u) => u.id);
    let completed = 0;
    const errors: string[] = [];

    for (const userId of userIds) {
      this.userProgramsService
        .assign({
          userId,
          programId: this.routineId(),
          assignedAt: this.startDate(),
        })
        .subscribe({
          next: () => {
            completed++;
            if (completed === userIds.length) {
              this.saving.set(false);
              this.resetForm();
              this.confirmed.emit({
                success: errors.length === 0,
                totalAssigned: completed - errors.length,
                totalNotifications: completed - errors.length,
                errors,
              });
            }
          },
          error: (err) => {
            completed++;
            errors.push(err.error?.message || 'Error al asignar programa');
            if (completed === userIds.length) {
              this.saving.set(false);
              if (errors.length === userIds.length) {
                this.error.set(errors[0]);
              } else {
                this.resetForm();
                this.confirmed.emit({
                  success: false,
                  totalAssigned: completed - errors.length,
                  totalNotifications: completed - errors.length,
                  errors,
                });
              }
            }
          },
        });
    }
  }

  onCancel(): void {
    this.resetForm();
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.onCancel();
    }
  }

  private resetForm(): void {
    this.users.update((list) => list.map((u) => ({ ...u, selected: false })));
    this.searchQuery.set('');
    this.startDate.set(new Date().toISOString().split('T')[0]);
    this.selectedDay.set(DayOfWeek.MONDAY);
    this.error.set(null);
    this.showReplaceConfirm.set(false);
    this.usersWithPlan.set([]);
  }
}
