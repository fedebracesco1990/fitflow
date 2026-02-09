import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { RoutinesService, UserProgramsService } from '../../../../core/services';
import { Program } from '../../../../core/services/user-programs.service';
import {
  Routine,
  DifficultyLabels,
  Difficulty,
  BulkAssignResult,
  RoutineType,
  RoutineTypeLabels,
} from '../../../../core/models';

interface ListItem {
  id: string;
  name: string;
  type: 'routine' | 'program';
  routineType?: RoutineType;
  difficulty: Difficulty;
  isDraft?: boolean;
  createdAt: string;
}
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  ConfirmDialogComponent,
} from '../../../../shared';
import { AssignRoutineDialogComponent } from '../../components/assign-routine-dialog/assign-routine-dialog.component';
import { RoutineTypeSelectDialogComponent } from '../../components/routine-type-select-dialog/routine-type-select-dialog.component';

@Component({
  selector: 'fit-flow-routine-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BadgeComponent,
    ButtonComponent,
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
  private readonly programsService = inject(UserProgramsService);

  routines = signal<Routine[]>([]);
  programs = signal<Program[]>([]);
  listItems = signal<ListItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  assignDialogOpen = signal(false);
  selectedRoutineForAssign = signal<{ id: string; name: string; type: RoutineType } | null>(null);
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

  filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    let result = this.listItems();
    if (query) {
      result = result.filter((r) => r.name.toLowerCase().includes(query));
    }
    return result;
  });

  totalItems = computed(() => this.filteredItems().length);

  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize) || 1);

  displayedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredItems().slice(start, start + this.pageSize);
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

    const typeFilter = this.selectedTypeFilter();

    // Si filtra por WEEKLY, solo cargar programas
    if (typeFilter === RoutineType.WEEKLY) {
      this.programsService.getAll().subscribe({
        next: (programs) => {
          this.programs.set(programs);
          this.routines.set([]);
          this.buildListItems();
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al cargar programas');
          this.loading.set(false);
        },
      });
      return;
    }

    // Si filtra por DAILY, solo cargar rutinas diarias
    if (typeFilter === RoutineType.DAILY) {
      this.routinesService
        .getAll({ includeInactive: true, limit: 100, type: RoutineType.DAILY })
        .subscribe({
          next: (response) => {
            this.routines.set(response.data);
            this.programs.set([]);
            this.buildListItems();
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'Error al cargar rutinas');
            this.loading.set(false);
          },
        });
      return;
    }

    // Sin filtro: cargar ambos
    forkJoin({
      routines: this.routinesService.getAll({
        includeInactive: true,
        limit: 100,
        type: RoutineType.DAILY,
      }),
      programs: this.programsService.getAll(),
    }).subscribe({
      next: ({ routines, programs }) => {
        this.routines.set(routines.data);
        this.programs.set(programs);
        this.buildListItems();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar datos');
        this.loading.set(false);
      },
    });
  }

  private buildListItems(): void {
    const routineItems: ListItem[] = this.routines().map((r) => ({
      id: r.id,
      name: r.name,
      type: 'routine' as const,
      routineType: r.type,
      difficulty: r.difficulty,
      isDraft: r.isDraft,
      createdAt: r.createdAt,
    }));

    const programItems: ListItem[] = this.programs().map((p) => ({
      id: p.id,
      name: p.name,
      type: 'program' as const,
      routineType: RoutineType.WEEKLY,
      difficulty: p.difficulty,
      isDraft: false,
      createdAt: p.createdAt,
    }));

    this.listItems.set([...routineItems, ...programItems]);
  }

  getDifficultyBadgeVariant(difficulty: Difficulty): 'success' | 'warning' | 'error' {
    const variantMap = {
      [Difficulty.BEGINNER]: 'success' as const,
      [Difficulty.INTERMEDIATE]: 'warning' as const,
      [Difficulty.ADVANCED]: 'error' as const,
    };
    return variantMap[difficulty];
  }

  deleteItem(item: ListItem): void {
    this.selectedRoutineForDelete.set({ id: item.id, name: item.name } as Routine);
    this.showDeleteDialog.set(true);
  }

  confirmDelete(): void {
    const item = this.selectedRoutineForDelete();
    if (!item) return;

    // Buscar si es rutina o programa
    const isProgram = this.programs().some((p) => p.id === item.id);

    if (isProgram) {
      this.programsService.delete(item.id).subscribe({
        next: () => {
          this.programs.update((list) => list.filter((p) => p.id !== item.id));
          this.buildListItems();
          this.closeDeleteDialog();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al eliminar programa');
          this.closeDeleteDialog();
        },
      });
    } else {
      this.routinesService.delete(item.id).subscribe({
        next: () => {
          this.routines.update((list) => list.filter((r) => r.id !== item.id));
          this.buildListItems();
          this.closeDeleteDialog();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al eliminar rutina');
          this.closeDeleteDialog();
        },
      });
    }
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog.set(false);
    this.selectedRoutineForDelete.set(null);
  }

  openAssignDialog(item: ListItem): void {
    if (item.type === 'program') {
      this.selectedRoutineForAssign.set({
        id: item.id,
        name: item.name,
        type: RoutineType.WEEKLY,
      });
      this.assignDialogOpen.set(true);
    }
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

  getTypeBadgeVariant(type: RoutineType | undefined): 'primary' | 'neutral' {
    return type === RoutineType.DAILY ? 'primary' : 'neutral';
  }

  getEditLink(item: ListItem): string[] {
    if (item.type === 'program') {
      return ['/training', 'routines', 'weekly', item.id, 'edit'];
    }
    return item.routineType === RoutineType.DAILY
      ? ['/training', 'routines', 'daily', item.id, 'edit']
      : ['/training', 'routines', 'weekly', item.id, 'edit'];
  }
}
