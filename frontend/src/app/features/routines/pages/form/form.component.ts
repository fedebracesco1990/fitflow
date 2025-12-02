import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RoutinesService, ExercisesService } from '../../../../core/services';
import {
  Exercise,
  RoutineExercise,
  Difficulty,
  DifficultyLabels,
  MuscleGroupLabels,
} from '../../../../core/models';

@Component({
  selector: 'fit-flow-routine-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
})
export class RoutineFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly routinesService = inject(RoutinesService);
  private readonly exercisesService = inject(ExercisesService);

  form: FormGroup;
  isEditMode = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  routineId: string | null = null;

  availableExercises = signal<Exercise[]>([]);
  routineExercises = signal<RoutineExercise[]>([]);

  difficulties = Object.values(Difficulty);
  difficultyLabels = DifficultyLabels;
  muscleGroupLabels = MuscleGroupLabels;

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      difficulty: [Difficulty.BEGINNER],
      estimatedDuration: [60, [Validators.min(10), Validators.max(180)]],
    });
  }

  ngOnInit(): void {
    this.loadExercises();
    this.routineId = this.route.snapshot.paramMap.get('id');
    if (this.routineId) {
      this.isEditMode.set(true);
      this.loadRoutine(this.routineId);
    }
  }

  loadExercises(): void {
    this.exercisesService.getAll().subscribe({
      next: (exercises) => this.availableExercises.set(exercises),
      error: (err) => console.error('Error loading exercises', err),
    });
  }

  loadRoutine(id: string): void {
    this.loading.set(true);
    this.routinesService.getById(id).subscribe({
      next: (routine) => {
        this.form.patchValue({
          name: routine.name,
          description: routine.description || '',
          difficulty: routine.difficulty,
          estimatedDuration: routine.estimatedDuration,
        });
        this.routineExercises.set(routine.exercises || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar rutina');
        this.loading.set(false);
      },
    });
  }

  addExercise(exercise: Exercise): void {
    if (!this.routineId) return;

    const order = this.routineExercises().length + 1;
    this.routinesService
      .addExercise(this.routineId, {
        exerciseId: exercise.id,
        order,
        sets: 3,
        reps: 12,
        restSeconds: 60,
      })
      .subscribe({
        next: (re) => {
          const newRe = { ...re, exercise };
          this.routineExercises.update((list) => [...list, newRe]);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al agregar ejercicio');
        },
      });
  }

  removeExercise(re: RoutineExercise): void {
    if (!this.routineId) return;

    this.routinesService.removeExercise(this.routineId, re.id).subscribe({
      next: () => {
        this.routineExercises.update((list) => list.filter((e) => e.id !== re.id));
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al eliminar ejercicio');
      },
    });
  }

  updateExerciseConfig(re: RoutineExercise, field: string, value: number): void {
    if (!this.routineId) return;

    this.routinesService.updateExercise(this.routineId, re.id, { [field]: value }).subscribe({
      next: (updated) => {
        this.routineExercises.update((list) =>
          list.map((e) => (e.id === re.id ? { ...e, ...updated } : e))
        );
      },
      error: (err) => console.error('Error updating exercise', err),
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const data = this.form.value;

    const request = this.isEditMode()
      ? this.routinesService.update(this.routineId!, data)
      : this.routinesService.create(data);

    request.subscribe({
      next: (routine) => {
        if (!this.isEditMode()) {
          // Ir a editar para poder agregar ejercicios
          this.router.navigate(['/routines', routine.id, 'edit']);
        } else {
          this.router.navigate(['/routines']);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al guardar rutina');
        this.loading.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/routines']);
  }

  isExerciseInRoutine(exercise: Exercise): boolean {
    return this.routineExercises().some((re) => re.exerciseId === exercise.id);
  }
}
