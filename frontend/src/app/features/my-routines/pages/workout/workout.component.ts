import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutsService, UserRoutinesService } from '../../../../core/services';
import {
  UserRoutine,
  WorkoutLog,
  ExerciseLog,
  DifficultyLabels,
  RoutineExercise,
} from '../../../../core/models';

interface ExerciseGroup {
  routineExercise: RoutineExercise;
  sets: ExerciseLog[];
}

@Component({
  selector: 'fit-flow-workout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workout.component.html',
  styleUrl: './workout.component.scss',
})
export class WorkoutComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly workoutsService = inject(WorkoutsService);
  private readonly userRoutinesService = inject(UserRoutinesService);

  userRoutine = signal<UserRoutine | null>(null);
  workout = signal<WorkoutLog | null>(null);
  currentExerciseIndex = signal(0);
  loading = signal(true);
  error = signal<string | null>(null);

  difficultyLabels = DifficultyLabels;

  // Computed: agrupa exercise logs por ejercicio
  exerciseGroups = computed<ExerciseGroup[]>(() => {
    const w = this.workout();
    if (!w?.exerciseLogs) return [];

    const groups = new Map<string, ExerciseGroup>();

    for (const log of w.exerciseLogs) {
      if (!groups.has(log.routineExerciseId)) {
        groups.set(log.routineExerciseId, {
          routineExercise: log.routineExercise,
          sets: [],
        });
      }
      groups.get(log.routineExerciseId)!.sets.push(log);
    }

    // Ordenar sets por número
    for (const group of groups.values()) {
      group.sets.sort((a, b) => a.setNumber - b.setNumber);
    }

    // Ordenar grupos por orden del ejercicio
    return Array.from(groups.values()).sort(
      (a, b) => a.routineExercise.order - b.routineExercise.order
    );
  });

  // Computed: ejercicio actual con todas sus series
  currentExerciseGroup = computed<ExerciseGroup | null>(() => {
    const groups = this.exerciseGroups();
    return groups[this.currentExerciseIndex()] || null;
  });

  ngOnInit(): void {
    const userRoutineId = this.route.snapshot.paramMap.get('id');
    if (userRoutineId) {
      this.loadUserRoutine(userRoutineId);
    }
  }

  loadUserRoutine(id: string): void {
    this.userRoutinesService.getById(id).subscribe({
      next: (ur) => {
        this.userRoutine.set(ur);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar rutina');
        this.loading.set(false);
      },
    });
  }

  startWorkout(): void {
    const ur = this.userRoutine();
    if (!ur) return;

    this.loading.set(true);
    const today = new Date().toISOString().split('T')[0];

    this.workoutsService.create({ userRoutineId: ur.id, date: today }).subscribe({
      next: (workout) => {
        this.workoutsService.start(workout.id).subscribe({
          next: (startedWorkout) => {
            this.workout.set(startedWorkout);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'Error al iniciar entrenamiento');
            this.loading.set(false);
          },
        });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al crear entrenamiento');
        this.loading.set(false);
      },
    });
  }

  get routineExercises() {
    return this.userRoutine()?.routine?.exercises || [];
  }

  logSet(exerciseLog: ExerciseLog, reps: number, weight: number): void {
    const w = this.workout();
    if (!w) return;

    this.workoutsService
      .logExercise(w.id, {
        routineExerciseId: exerciseLog.routineExerciseId,
        setNumber: exerciseLog.setNumber,
        reps,
        weight,
        completed: true,
      })
      .subscribe({
        next: () => {
          // Refresh workout data
          this.refreshWorkout();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al registrar serie');
        },
      });
  }

  nextExercise(): void {
    const max = this.exerciseGroups().length - 1;
    if (this.currentExerciseIndex() < max) {
      this.currentExerciseIndex.update((i) => i + 1);
    }
  }

  prevExercise(): void {
    if (this.currentExerciseIndex() > 0) {
      this.currentExerciseIndex.update((i) => i - 1);
    }
  }

  addSet(): void {
    const w = this.workout();
    const group = this.currentExerciseGroup();
    if (!w || !group) return;

    const nextSetNumber = group.sets.length + 1;
    const lastSet = group.sets[group.sets.length - 1];

    this.workoutsService
      .logExercise(w.id, {
        routineExerciseId: group.routineExercise.id,
        setNumber: nextSetNumber,
        reps: lastSet?.reps || group.routineExercise.reps,
        weight: lastSet?.weight || group.routineExercise.suggestedWeight || 0,
        completed: false,
      })
      .subscribe({
        next: () => this.refreshWorkout(),
        error: (err) => this.error.set(err.error?.message || 'Error al agregar serie'),
      });
  }

  removeSet(): void {
    const w = this.workout();
    const group = this.currentExerciseGroup();
    if (!w || !group || group.sets.length <= 1) return;

    const lastSet = group.sets[group.sets.length - 1];

    this.workoutsService.deleteExerciseLog(w.id, lastSet.id).subscribe({
      next: () => this.refreshWorkout(),
      error: (err) => this.error.set(err.error?.message || 'Error al eliminar serie'),
    });
  }

  completeWorkout(): void {
    const w = this.workout();
    if (!w) return;

    this.loading.set(true);
    this.workoutsService.complete(w.id).subscribe({
      next: () => {
        this.router.navigate(['/my-routines']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al completar entrenamiento');
        this.loading.set(false);
      },
    });
  }

  private refreshWorkout(): void {
    const w = this.workout();
    if (!w) return;

    this.workoutsService.getById(w.id).subscribe({
      next: (workout) => this.workout.set(workout),
    });
  }
}
