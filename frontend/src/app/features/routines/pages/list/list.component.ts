import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoutinesService } from '../../../../core/services';
import { Routine, DifficultyLabels, Difficulty, BulkAssignResult } from '../../../../core/models';
import { BadgeComponent, CardComponent } from '../../../../shared';
import { AssignRoutineDialogComponent } from '../../components/assign-routine-dialog/assign-routine-dialog.component';

@Component({
  selector: 'fit-flow-routine-list',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent, CardComponent, AssignRoutineDialogComponent],
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

  difficultyLabels = DifficultyLabels;

  ngOnInit(): void {
    this.loadRoutines();
  }

  loadRoutines(): void {
    this.loading.set(true);
    this.error.set(null);

    this.routinesService.getAll({ includeInactive: true, limit: 100 }).subscribe({
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
    if (!confirm(`¿Estás seguro de eliminar la rutina "${routine.name}"?`)) {
      return;
    }

    this.routinesService.delete(routine.id).subscribe({
      next: () => {
        this.routines.update((list) => list.filter((r) => r.id !== routine.id));
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al eliminar rutina');
      },
    });
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
}
