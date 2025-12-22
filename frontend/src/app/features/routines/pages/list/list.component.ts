import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoutinesService } from '../../../../core/services';
import { Routine, DifficultyLabels, Difficulty } from '../../../../core/models';
import { BadgeComponent, CardComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-routine-list',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent, CardComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class RoutinesListComponent implements OnInit {
  private readonly routinesService = inject(RoutinesService);

  routines = signal<Routine[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

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
}
