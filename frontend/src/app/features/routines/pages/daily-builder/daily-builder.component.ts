import { Component, OnInit, inject, signal } from '@angular/core';
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
import { RoutinesService } from '../../../../core/services';
import { ButtonComponent } from '../../../../shared';
import {
  RoutineType,
  Difficulty,
  DifficultyLabels,
  CreateRoutineDto,
  Exercise,
} from '../../../../core/models';
import { ExercisePanelComponent } from '../../components/exercise-panel/exercise-panel.component';

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
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    ButtonComponent,
    ExercisePanelComponent,
  ],
  templateUrl: './daily-builder.component.html',
  styleUrl: './daily-builder.component.scss',
})
export class DailyRoutineBuilderComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly routinesService = inject(RoutinesService);

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

  difficultyOptions = Object.values(Difficulty);
  difficultyLabels = DifficultyLabels;

  connectedDropLists = ['routine-exercises'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.routineId.set(id);
      this.isEditMode.set(true);
      this.loadRoutine(id);
    }
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
            weight: re.suggestedWeight ?? 0,
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

  updateExercise(
    index: number,
    field: 'sets' | 'reps' | 'restSeconds' | 'weight',
    value: number
  ): void {
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

    const exerciseDtos = exercises.map((ex) => ({
      exerciseId: ex.exercise.id,
      sets: ex.sets,
      reps: ex.reps,
      restSeconds: ex.restSeconds,
      suggestedWeight: ex.weight || undefined,
      order: ex.order,
    }));

    this.routinesService.replaceExercises(routineId, exerciseDtos).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/training']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al guardar ejercicios');
        this.saving.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/training']);
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
