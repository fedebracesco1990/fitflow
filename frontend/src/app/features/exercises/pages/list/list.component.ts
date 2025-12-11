import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExercisesService, MuscleGroupsService } from '../../../../core/services';
import { Exercise, MuscleGroup, DifficultyLabels } from '../../../../core/models';
import { ConfirmDialogComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-exercise-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialogComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ExercisesListComponent implements OnInit {
  private readonly exercisesService = inject(ExercisesService);
  private readonly muscleGroupsService = inject(MuscleGroupsService);

  exercises = signal<Exercise[]>([]);
  muscleGroups = signal<MuscleGroup[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedMuscleGroupId = signal<string | null>(null);

  difficultyLabels = DifficultyLabels;

  // Dialog state
  showDeleteDialog = signal(false);
  selectedExercise = signal<Exercise | null>(null);

  ngOnInit(): void {
    this.loadMuscleGroups();
    this.loadExercises();
  }

  loadMuscleGroups(): void {
    this.muscleGroupsService.getAll().subscribe({
      next: (groups) => this.muscleGroups.set(groups),
      error: (err) => console.error('Error loading muscle groups', err),
    });
  }

  loadExercises(): void {
    this.loading.set(true);
    this.error.set(null);

    const muscleGroupId = this.selectedMuscleGroupId();

    if (muscleGroupId) {
      this.exercisesService.getByMuscleGroup(muscleGroupId).subscribe({
        next: (exercises: Exercise[]) => {
          this.exercises.set(exercises);
          this.loading.set(false);
        },
        error: (err: { error?: { message?: string } }) => {
          this.error.set(err.error?.message || 'Error al cargar ejercicios');
          this.loading.set(false);
        },
      });
    } else {
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
  }

  filterByMuscleGroup(muscleGroupId: string | null): void {
    this.selectedMuscleGroupId.set(muscleGroupId);
    this.loadExercises();
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
