import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  WorkoutTimerService,
  WorkoutStateService,
  ExerciseState,
  OfflineWorkoutsService,
} from '../../../../core/services';
import { ButtonComponent } from '../../../../shared';
import { RestTimerComponent } from '../rest-timer/rest-timer.component';
import { WorkoutLog } from '../../../../core/models';

@Component({
  selector: 'fit-flow-workout-active',
  standalone: true,
  imports: [CommonModule, ButtonComponent, RestTimerComponent],
  templateUrl: './workout-active.component.html',
  styleUrl: './workout-active.component.scss',
})
export class WorkoutActiveComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly timerService = inject(WorkoutTimerService);
  private readonly stateService = inject(WorkoutStateService);
  private readonly offlineWorkoutsService = inject(OfflineWorkoutsService);

  private workoutLogId = signal<string | null>(null);

  loading = signal(true);
  error = signal<string | null>(null);
  routineName = signal('');
  routineDate = signal('');

  readonly formattedTime = this.timerService.formattedTime;
  readonly isTimerRunning = this.timerService.isRunning;
  readonly exerciseStates = this.stateService.exerciseStates;
  readonly currentExerciseIndex = this.stateService.currentExerciseIndex;
  readonly progressText = this.stateService.progressText;
  readonly isResting = this.stateService.isResting;
  readonly restDuration = this.stateService.restDuration;
  readonly allExercisesFinished = this.stateService.allExercisesFinished;

  readonly exercises = computed(() => this.exerciseStates());

  ngOnInit(): void {
    const routineId = this.route.snapshot.paramMap.get('id');
    if (routineId) {
      this.loadRoutine(routineId);
    }
  }

  private loadRoutine(routineId: string): void {
    this.loading.set(true);

    // Iniciar workout - online crea en backend, offline genera temporal
    this.offlineWorkoutsService.startWorkout(routineId).subscribe({
      next: (workoutLog) => {
        this.workoutLogId.set(workoutLog.id);
        this.routineName.set(workoutLog.userProgramRoutine.name);
        this.routineDate.set(this.formatTodayDate());
        this.startWorkoutSession(routineId, workoutLog);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al iniciar el entrenamiento');
        this.loading.set(false);
      },
    });
  }

  private startWorkoutSession(routineId: string, workoutLog: WorkoutLog): void {
    // Convertir ejercicios del workout a ExerciseState
    const exerciseStates: ExerciseState[] = workoutLog.userProgramRoutine.exercises.map(
      (ex, index) => ({
        id: ex.id,
        exerciseId: ex.exerciseId,
        name: ex.exercise?.name || `Ejercicio ${index + 1}`,
        status: index === 0 ? 'current' : 'pending',
        setsCompleted: 0,
        totalSets: ex.sets,
      })
    );

    this.stateService.initWorkout(
      routineId,
      exerciseStates,
      workoutLog.id,
      workoutLog.exerciseLogs
    );
    this.loading.set(false);

    if (!this.timerService.isRunning()) {
      this.timerService.start(routineId);
    }
  }

  private formatTodayDate(): string {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
    };
    return `Hoy • ${now.toLocaleDateString('es', options)}`;
  }

  getExerciseStatusClass(exercise: ExerciseState): string {
    return exercise.status;
  }

  isCurrentExercise(exercise: ExerciseState): boolean {
    return exercise.status === 'current';
  }

  onEnterExercise(exercise: ExerciseState): void {
    const index = this.exercises().findIndex((e) => e.id === exercise.id);
    if (index >= 0) {
      this.stateService.goToExercise(index);
      this.router.navigate(['/my-routines', exercise.exerciseId, 'exercise', exercise.id]);
    }
  }

  onSkipExercise(exercise: ExerciseState): void {
    this.stateService.updateExerciseStatus(exercise.id, 'skipped');
    this.stateService.moveToNextExercise();
  }

  onEditExercise(exercise: ExerciseState): void {
    this.router.navigate(['/my-routines', exercise.exerciseId, 'exercise', exercise.id]);
  }

  onFinishRoutine(): void {
    if (!this.allExercisesFinished()) return;

    const workoutId = this.workoutLogId();
    const totalTime = Math.floor(this.timerService.elapsedSeconds() / 60);

    if (workoutId) {
      // Completar workout - online en backend, offline encola sync
      this.offlineWorkoutsService.complete(workoutId, totalTime).subscribe({
        next: () => {
          this.timerService.stop();
          this.stateService.reset();
          this.router.navigate(['/my-routines']);
        },
        error: (err) => {
          console.error('Error al completar workout:', err);
          // Aún así navegar para no bloquear al usuario
          this.timerService.stop();
          this.stateService.reset();
          this.router.navigate(['/my-routines']);
        },
      });
    } else {
      this.timerService.stop();
      this.stateService.reset();
      this.router.navigate(['/my-routines']);
    }
  }

  onRestCompleted(): void {
    this.stateService.endRest();
  }

  onRestSkipped(): void {
    this.stateService.skipRest();
  }

  goBack(): void {
    this.router.navigate(['/my-routines']);
  }
}
