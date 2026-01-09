import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ExercisesService, ExercisesFilterParams } from '../../../../core/services';
import {
  Exercise,
  Difficulty,
  DifficultyLabels,
  Equipment,
  EquipmentLabels,
} from '../../../../core/models';
import { PaginationMeta } from '../../../../core/models/api-response.model';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  ConfirmDialogComponent,
  ViewToggleComponent,
  ViewMode,
} from '../../../../shared';
import { ExerciseCardComponent, ExerciseFiltersComponent, ExerciseFilters } from '../../components';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'fit-flow-exercise-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    ConfirmDialogComponent,
    ViewToggleComponent,
    ExerciseCardComponent,
    ExerciseFiltersComponent,
    LucideAngularModule,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ExercisesListComponent implements OnInit {
  private readonly exercisesService = inject(ExercisesService);
  private readonly router = inject(Router);

  exercises = signal<Exercise[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  paginationMeta = signal<PaginationMeta | null>(null);

  viewMode = signal<ViewMode>('grid');
  filters: ExerciseFilters = {
    search: '',
    muscleGroupId: '',
    difficulty: '',
    equipment: '',
  };

  difficultyLabels = DifficultyLabels;
  equipmentLabels = EquipmentLabels;

  showDeleteDialog = signal(false);
  selectedExercise = signal<Exercise | null>(null);

  ngOnInit(): void {
    this.loadExercises();
  }

  loadExercises(page = 1): void {
    this.loading.set(true);
    this.error.set(null);

    const params: ExercisesFilterParams = {
      page,
      limit: 20,
      includeInactive: true,
      muscleGroupId: this.filters.muscleGroupId || undefined,
      difficulty: (this.filters.difficulty as Difficulty) || undefined,
      equipment: (this.filters.equipment as Equipment) || undefined,
      search: this.filters.search || undefined,
    };

    this.exercisesService.getAll(params).subscribe({
      next: (response) => {
        this.exercises.set(response.data);
        this.paginationMeta.set(response.meta);
        this.loading.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err.error?.message || 'Error al cargar ejercicios');
        this.loading.set(false);
      },
    });
  }

  onFiltersChange(newFilters: ExerciseFilters): void {
    this.filters = newFilters;
    this.loadExercises(1);
  }

  onViewModeChange(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  onExerciseClick(exercise: Exercise): void {
    this.router.navigate(['/exercises', exercise.id]);
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
