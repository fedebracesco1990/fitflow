import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import {
  CdkDropList,
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { RoutinesService, ExercisesService } from '../../../../core/services';
import {
  RoutineType,
  Difficulty,
  DifficultyLabels,
  CreateRoutineDto,
  Exercise,
} from '../../../../core/models';

interface PendingExercise {
  exercise: Exercise;
  sets: number;
  reps: number;
  restSeconds: number;
  weight: number;
  order: number;
}

@Component({
  selector: 'fit-flow-daily-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CdkDropList, CdkDrag, CdkDragHandle],
  templateUrl: './daily-builder.component.html',
  styleUrl: './daily-builder.component.scss',
})
export class DailyRoutineBuilderComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly routinesService = inject(RoutinesService);
  private readonly exercisesService = inject(ExercisesService);

  routineId = signal<string | null>(null);
  isEditMode = signal(false);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);

  formData = signal({
    name: '',
    description: '',
    difficulty: Difficulty.BEGINNER,
    estimatedDuration: 60,
  });

  pendingExercises = signal<PendingExercise[]>([]);
  exercises = signal<Exercise[]>([]);
  exerciseSearch = signal('');
  selectedMuscleGroup = signal('');

  difficultyOptions = Object.values(Difficulty);
  difficultyLabels = DifficultyLabels;

  muscleGroups = [
    { value: '', label: 'Todo' },
    { value: 'core', label: 'Core' },
    { value: 'triceps', label: 'Triceps' },
    { value: 'espalda', label: 'Espalda' },
    { value: 'piernas', label: 'Piernas' },
  ];

  filteredExercises = computed(() => {
    let result = this.exercises();
    const search = this.exerciseSearch().toLowerCase().trim();
    const muscle = this.selectedMuscleGroup();

    if (search) {
      result = result.filter((e) => e.name.toLowerCase().includes(search));
    }
    if (muscle) {
      result = result.filter((e) => e.muscleGroup?.name?.toLowerCase().includes(muscle));
    }
    return result;
  });

  connectedDropLists = ['exercise-panel', 'routine-exercises'];

  ngOnInit(): void {
    this.loadExercises();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.routineId.set(id);
      this.isEditMode.set(true);
      this.loadRoutine(id);
    }
  }

  loadExercises(): void {
    this.exercisesService.getAll().subscribe({
      next: (response) => this.exercises.set(response.data),
      error: () => this.exercises.set([]),
    });
  }

  loadRoutine(id: string): void {
    this.loading.set(true);
    this.routinesService.getById(id).subscribe({
      next: (routine) => {
        this.formData.set({
          name: routine.name,
          description: routine.description || '',
          difficulty: routine.difficulty,
          estimatedDuration: routine.estimatedDuration,
        });
        this.pendingExercises.set(
          routine.exercises.map((re) => ({
            exercise: re.exercise,
            sets: re.sets,
            reps: re.reps,
            restSeconds: re.restSeconds,
            weight: 0,
            order: re.order,
          }))
        );
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar rutina');
        this.loading.set(false);
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onExerciseDropped(event: CdkDragDrop<any>): void {
    if (event.previousContainer === event.container) {
      const exercises = [...this.pendingExercises()];
      moveItemInArray(exercises, event.previousIndex, event.currentIndex);
      exercises.forEach((ex, index) => (ex.order = index + 1));
      this.pendingExercises.set(exercises);
    } else {
      const exercise = event.previousContainer.data[event.previousIndex] as Exercise;
      const newExercise: PendingExercise = {
        exercise,
        sets: 3,
        reps: 12,
        restSeconds: 60,
        weight: 0,
        order: this.pendingExercises().length + 1,
      };
      this.pendingExercises.update((list) => [...list, newExercise]);
    }
  }

  removeExercise(index: number): void {
    this.pendingExercises.update((list) => {
      const newList = list.filter((_, i) => i !== index);
      newList.forEach((ex, i) => (ex.order = i + 1));
      return newList;
    });
  }

  updateExercise(index: number, field: 'sets' | 'reps' | 'restSeconds', value: number): void {
    this.pendingExercises.update((list) => {
      const newList = [...list];
      newList[index] = { ...newList[index], [field]: value };
      return newList;
    });
  }

  updateFormField(field: string, value: string | number): void {
    this.formData.update((data) => ({ ...data, [field]: value }));
  }

  save(): void {
    const form = this.formData();
    if (!form.name.trim()) {
      this.error.set('El nombre es requerido');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const dto: CreateRoutineDto = {
      name: form.name,
      description: form.description || undefined,
      difficulty: form.difficulty,
      estimatedDuration: form.estimatedDuration,
      type: RoutineType.DAILY,
      isDraft: false,
    };

    if (this.isEditMode() && this.routineId()) {
      this.routinesService.update(this.routineId()!, dto).subscribe({
        next: () => this.saveExercises(),
        error: (err) => {
          this.error.set(err.error?.message || 'Error al actualizar');
          this.saving.set(false);
        },
      });
    } else {
      this.routinesService.create(dto).subscribe({
        next: (routine) => {
          this.routineId.set(routine.id);
          this.saveExercises();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al crear');
          this.saving.set(false);
        },
      });
    }
  }

  private saveExercises(): void {
    const routineId = this.routineId()!;
    const exercises = this.pendingExercises();

    if (exercises.length === 0) {
      this.saving.set(false);
      this.router.navigate(['/training']);
      return;
    }

    let completed = 0;
    exercises.forEach((ex) => {
      this.routinesService
        .addExercise(routineId, {
          exerciseId: ex.exercise.id,
          sets: ex.sets,
          reps: ex.reps,
          restSeconds: ex.restSeconds,
          order: ex.order,
        })
        .subscribe({
          next: () => {
            completed++;
            if (completed === exercises.length) {
              this.saving.set(false);
              this.router.navigate(['/training']);
            }
          },
          error: () => {
            completed++;
            if (completed === exercises.length) {
              this.saving.set(false);
              this.router.navigate(['/training']);
            }
          },
        });
    });
  }

  goBack(): void {
    this.router.navigate(['/training']);
  }

  setRoutinesTab(): void {
    // Tab state will be handled by training component
  }

  onExerciseSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.exerciseSearch.set(input.value);
  }

  selectMuscleGroup(value: string): void {
    this.selectedMuscleGroup.set(value);
  }

  updateExerciseWeight(index: number, value: number): void {
    this.pendingExercises.update((list) => {
      const newList = [...list];
      newList[index] = { ...newList[index], weight: value };
      return newList;
    });
  }

  saveDraft(): void {
    const form = this.formData();
    if (!form.name.trim()) {
      this.error.set('El nombre es requerido para guardar borrador');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const dto: CreateRoutineDto = {
      name: form.name,
      description: form.description || undefined,
      difficulty: form.difficulty,
      estimatedDuration: form.estimatedDuration,
      type: RoutineType.DAILY,
      isDraft: true,
    };

    if (this.isEditMode() && this.routineId()) {
      this.routinesService.update(this.routineId()!, dto).subscribe({
        next: () => {
          this.saveExercises();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al guardar borrador');
          this.saving.set(false);
        },
      });
    } else {
      this.routinesService.create(dto).subscribe({
        next: (routine) => {
          this.routineId.set(routine.id);
          this.isEditMode.set(true);
          this.saveExercises();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al guardar borrador');
          this.saving.set(false);
        },
      });
    }
  }
}
