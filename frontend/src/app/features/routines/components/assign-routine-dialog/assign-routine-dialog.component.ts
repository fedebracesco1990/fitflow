import { Component, OnInit, input, output, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../../core/services/users.service';
import { UserRoutinesService } from '../../../../core/services/user-routines.service';
import { User, Role, DayOfWeek, DayOfWeekLabels, BulkAssignResult } from '../../../../core/models';
import { ButtonComponent } from '../../../../shared';

interface SelectableUser extends User {
  selected: boolean;
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

  isOpen = input(false);
  routineId = input.required<string>();
  routineName = input('');

  confirmed = output<BulkAssignResult>();
  cancelled = output<void>();

  users = signal<SelectableUser[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  searchQuery = signal('');

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
        this.users.set(response.data.map((u) => ({ ...u, selected: false })));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar usuarios');
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

    this.saving.set(true);
    this.error.set(null);

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
  }
}
