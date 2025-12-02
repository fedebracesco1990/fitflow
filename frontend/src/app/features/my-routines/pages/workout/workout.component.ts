import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutsService, UserRoutinesService } from '../../../../core/services';
import { UserRoutine, WorkoutLog, ExerciseLog, DifficultyLabels } from '../../../../core/models';

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
    this.workoutsService.start(ur.routineId).subscribe({
      next: (workout) => {
        this.workout.set(workout);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al iniciar entrenamiento');
        this.loading.set(false);
      },
    });
  }

  get currentExercise() {
    const w = this.workout();
    if (!w || !w.exerciseLogs) return null;
    return w.exerciseLogs[this.currentExerciseIndex()];
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
    const max = this.routineExercises.length - 1;
    if (this.currentExerciseIndex() < max) {
      this.currentExerciseIndex.update((i) => i + 1);
    }
  }

  prevExercise(): void {
    if (this.currentExerciseIndex() > 0) {
      this.currentExerciseIndex.update((i) => i - 1);
    }
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
