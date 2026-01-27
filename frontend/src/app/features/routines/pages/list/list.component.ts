import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoutinesService } from '../../../../core/services';
import {
  Routine,
  DifficultyLabels,
  Difficulty,
  BulkAssignResult,
  RoutineType,
  RoutineTypeLabels,
} from '../../../../core/models';
import { BadgeComponent, CardComponent, ConfirmDialogComponent } from '../../../../shared';
import { AssignRoutineDialogComponent } from '../../components/assign-routine-dialog/assign-routine-dialog.component';
import { RoutineTypeSelectDialogComponent } from '../../components/routine-type-select-dialog/routine-type-select-dialog.component';

@Component({
  selector: 'fit-flow-routine-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BadgeComponent,
    CardComponent,
    ConfirmDialogComponent,
    AssignRoutineDialogComponent,
    RoutineTypeSelectDialogComponent,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class RoutinesListComponent implements OnInit {
  private readonly routinesService = inject(RoutinesService);

  routines = signal<Routine[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  assignDialogOpen = signal(false);
  selectedRoutineForAssign = signal<Routine | null>(null);
  showTypeModal = signal(false);

  // Delete dialog state
  showDeleteDialog = signal(false);
  selectedRoutineForDelete = signal<Routine | null>(null);

  selectedTypeFilter = signal<RoutineType | null>(null);
  searchQuery = signal('');
  currentPage = signal(1);
  pageSize = 10;

  difficultyLabels = DifficultyLabels;
  routineTypeLabels = RoutineTypeLabels;
  RoutineType = RoutineType;

  filteredRoutines = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    let result = this.routines();
    if (query) {
      result = result.filter((r) => r.name.toLowerCase().includes(query));
    }
    return result;
  });

  totalRoutines = computed(() => this.filteredRoutines().length);

  totalPages = computed(() => Math.ceil(this.totalRoutines() / this.pageSize) || 1);

  displayedRoutines = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredRoutines().slice(start, start + this.pageSize);
  });

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  });

  ngOnInit(): void {
    this.loadRoutines();
  }

  loadRoutines(): void {
    this.loading.set(true);
    this.error.set(null);

    const type = this.selectedTypeFilter() ?? undefined;
    this.routinesService.getAll({ includeInactive: true, limit: 100, type }).subscribe({
      next: (response) => {
        this.routines.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar rutinas');
        this.loading.set(false);
      },
    });
  }

  getDifficultyBadgeVariant(difficulty: Difficulty): 'success' | 'warning' | 'error' {
    const variantMap = {
      [Difficulty.BEGINNER]: 'success' as const,
      [Difficulty.INTERMEDIATE]: 'warning' as const,
      [Difficulty.ADVANCED]: 'error' as const,
    };
    return variantMap[difficulty];
  }

  deleteRoutine(routine: Routine): void {
    this.selectedRoutineForDelete.set(routine);
    this.showDeleteDialog.set(true);
  }

  confirmDelete(): void {
    const routine = this.selectedRoutineForDelete();
    if (!routine) return;

    this.routinesService.delete(routine.id).subscribe({
      next: () => {
        this.routines.update((list) => list.filter((r) => r.id !== routine.id));
        this.closeDeleteDialog();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al eliminar rutina');
        this.closeDeleteDialog();
      },
    });
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog.set(false);
    this.selectedRoutineForDelete.set(null);
  }

  openAssignDialog(routine: Routine): void {
    this.selectedRoutineForAssign.set(routine);
    this.assignDialogOpen.set(true);
  }

  onAssignConfirmed(result: BulkAssignResult): void {
    this.assignDialogOpen.set(false);
    this.selectedRoutineForAssign.set(null);

    if (result.success) {
      this.successMessage.set(
        `Rutina asignada a ${result.totalAssigned} usuario(s). ${result.totalNotifications} notificación(es) enviada(s).`
      );
      setTimeout(() => this.successMessage.set(null), 5000);
    }

    if (result.errors.length > 0) {
      this.error.set(result.errors.join(', '));
      setTimeout(() => this.error.set(null), 5000);
    }
  }

  onAssignCancelled(): void {
    this.assignDialogOpen.set(false);
    this.selectedRoutineForAssign.set(null);
  }

  onTypeFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value as RoutineType | '';
    this.selectedTypeFilter.set(value === '' ? null : value);
    this.currentPage.set(1);
    this.loadRoutines();
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  openTypeModal(): void {
    this.showTypeModal.set(true);
  }

  onTypeSelected(type: RoutineType): void {
    this.showTypeModal.set(false);
    if (type === RoutineType.DAILY) {
      window.location.href = '/routines/daily/new';
    } else {
      window.location.href = '/routines/weekly/new';
    }
  }

  onTypeModalCancelled(): void {
    this.showTypeModal.set(false);
  }

  getTypeBadgeVariant(type: RoutineType): 'primary' | 'neutral' {
    return type === RoutineType.DAILY ? 'primary' : 'neutral';
  }
}
