import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExercisesService } from '../../../../core/services';
import {
  Exercise,
  MuscleGroup,
  MuscleGroupLabels,
  DifficultyLabels,
} from '../../../../core/models';

@Component({
  selector: 'fit-flow-exercise-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ExercisesListComponent implements OnInit {
  private readonly exercisesService = inject(ExercisesService);

  exercises = signal<Exercise[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedMuscleGroup = signal<MuscleGroup | null>(null);

  muscleGroups = Object.values(MuscleGroup);
  muscleGroupLabels = MuscleGroupLabels;
  difficultyLabels = DifficultyLabels;

  ngOnInit(): void {
    this.loadExercises();
  }

  loadExercises(): void {
    this.loading.set(true);
    this.error.set(null);

    const muscleGroup = this.selectedMuscleGroup();
    const request = muscleGroup
      ? this.exercisesService.getByMuscleGroup(muscleGroup)
      : this.exercisesService.getAll(true);

    request.subscribe({
      next: (exercises) => {
        this.exercises.set(exercises);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar ejercicios');
        this.loading.set(false);
      },
    });
  }

  filterByMuscleGroup(muscleGroup: MuscleGroup | null): void {
    this.selectedMuscleGroup.set(muscleGroup);
    this.loadExercises();
  }

  deleteExercise(exercise: Exercise): void {
    if (!confirm(`¿Estás seguro de eliminar el ejercicio "${exercise.name}"?`)) {
      return;
    }

    this.exercisesService.delete(exercise.id).subscribe({
      next: () => {
        this.exercises.update((list) => list.filter((e) => e.id !== exercise.id));
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al eliminar ejercicio');
      },
    });
  }
}
