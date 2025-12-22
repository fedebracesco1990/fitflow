import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExercisesService } from '../../../../core/services';
import { Exercise, DifficultyLabels, Difficulty } from '../../../../core/models';
import { BadgeComponent, CardComponent, ConfirmDialogComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-exercise-list',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent, CardComponent, ConfirmDialogComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ExercisesListComponent implements OnInit {
  private readonly exercisesService = inject(ExercisesService);

  exercises = signal<Exercise[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  difficultyLabels = DifficultyLabels;

  // Dialog state
  showDeleteDialog = signal(false);
  selectedExercise = signal<Exercise | null>(null);

  ngOnInit(): void {
    this.loadExercises();
  }

  loadExercises(): void {
    this.loading.set(true);
    this.error.set(null);

    this.exercisesService.getAll({ includeInactive: true, limit: 100 }).subscribe({
      next: (response) => {
        this.exercises.set(response.data);
        this.loading.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err.error?.message || 'Error al cargar ejercicios');
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

  openDeleteDialog(exercise: Exercise): void {
    this.selectedExercise.set(exercise);
    this.showDeleteDialog.set(true);
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog.set(false);
    this.selectedExercise.set(null);
  }

  confirmDelete(): void {
    const exercise = this.selectedExercise();
    if (!exercise) return;

    this.exercisesService.delete(exercise.id).subscribe({
      next: () => {
        this.exercises.update((list) => list.filter((e) => e.id !== exercise.id));
        this.closeDeleteDialog();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al eliminar ejercicio');
        this.closeDeleteDialog();
      },
    });
  }
}
