import { Injectable, signal, computed } from '@angular/core';
import { ExerciseLog } from '../models';

export type ExerciseStatus = 'pending' | 'current' | 'completed' | 'skipped';

export type RestType = 'set' | 'exercise' | null;

export interface ExerciseState {
  id: string;
  exerciseId: string;
  name: string;
  status: ExerciseStatus;
  setsCompleted: number;
  totalSets: number;
  restSeconds: number;
}

@Injectable({
  providedIn: 'root',
})
export class WorkoutStateService {
  private _exerciseStates = signal<ExerciseState[]>([]);
  private _currentExerciseIndex = signal<number>(0);
  private _isResting = signal<boolean>(false);
  private _restDuration = signal<number>(90);
  private _restType = signal<RestType>(null);
  private _workoutId = signal<string | null>(null);
  private _workoutLogId = signal<string | null>(null);
  private _exerciseLogsMap = signal<Record<string, ExerciseLog[]>>({});
  private _routineName = signal<string>('');

  readonly exerciseStates = this._exerciseStates.asReadonly();
  readonly currentExerciseIndex = this._currentExerciseIndex.asReadonly();
  readonly isResting = this._isResting.asReadonly();
  readonly restDuration = this._restDuration.asReadonly();
  readonly restType = this._restType.asReadonly();
  readonly workoutId = this._workoutId.asReadonly();
  readonly workoutLogId = this._workoutLogId.asReadonly();
  readonly exerciseLogsMap = this._exerciseLogsMap.asReadonly();
  readonly routineName = this._routineName.asReadonly();

  readonly currentExercise = computed(() => {
    const states = this._exerciseStates();
    const index = this._currentExerciseIndex();
    return states[index] || null;
  });

  readonly totalExercises = computed(() => this._exerciseStates().length);

  readonly completedExercises = computed(
    () =>
      this._exerciseStates().filter((e) => e.status === 'completed' || e.status === 'skipped')
        .length
  );

  readonly allExercisesFinished = computed(() => {
    const states = this._exerciseStates();
    if (states.length === 0) return false;
    return states.every((e) => e.status === 'completed' || e.status === 'skipped');
  });

  readonly progressText = computed(() => {
    const current = this._currentExerciseIndex() + 1;
    const total = this.totalExercises();
    return `${current}/${total}`;
  });

  initWorkout(
    workoutId: string,
    exercises: ExerciseState[],
    workoutLogId?: string,
    exerciseLogs?: ExerciseLog[]
  ): void {
    // Solo inicializar si es un workout diferente o no hay workout activo
    if (
      this._workoutLogId() === workoutLogId &&
      workoutLogId &&
      this._exerciseStates().length > 0
    ) {
      return; // Ya hay un workout activo con este ID, no reinicializar
    }

    this._workoutId.set(workoutId);
    this._workoutLogId.set(workoutLogId || null);
    this._exerciseStates.set(
      exercises.map((e, i) => ({
        ...e,
        status: i === 0 ? 'current' : 'pending',
      }))
    );
    this._currentExerciseIndex.set(0);
    this._isResting.set(false);

    // Group exercise logs by exerciseId (UserProgramExercise.id)
    if (exerciseLogs) {
      const logsMap: Record<string, ExerciseLog[]> = {};
      for (const log of exerciseLogs) {
        // Group by exerciseId to match with ExerciseState.exerciseId
        if (!logsMap[log.exerciseId]) {
          logsMap[log.exerciseId] = [];
        }
        logsMap[log.exerciseId].push(log);
      }
      this._exerciseLogsMap.set(logsMap);
    }
  }

  getExerciseLogsForExercise(exerciseId: string): ExerciseLog[] {
    return this._exerciseLogsMap()[exerciseId] || [];
  }

  updateExerciseStatus(exerciseId: string, status: ExerciseStatus): void {
    this._exerciseStates.update((states) =>
      states.map((e) => (e.id === exerciseId ? { ...e, status } : e))
    );
  }

  updateExerciseSets(exerciseId: string, setsCompleted: number): void {
    this._exerciseStates.update((states) =>
      states.map((e) => (e.id === exerciseId ? { ...e, setsCompleted } : e))
    );
  }

  markCurrentCompleted(): void {
    const current = this.currentExercise();
    if (!current) return;

    this.updateExerciseStatus(current.id, 'completed');
    this.moveToNextExercise();
  }

  skipCurrentExercise(): void {
    const current = this.currentExercise();
    if (!current) return;

    this.updateExerciseStatus(current.id, 'skipped');
    this.moveToNextExercise();
  }

  moveToNextExercise(): void {
    const nextIndex = this._currentExerciseIndex() + 1;
    const states = this._exerciseStates();

    if (nextIndex < states.length) {
      this._currentExerciseIndex.set(nextIndex);
      this._exerciseStates.update((s) =>
        s.map((e, i) => (i === nextIndex ? { ...e, status: 'current' } : e))
      );
    }
  }

  goToExercise(index: number): void {
    const states = this._exerciseStates();
    if (index >= 0 && index < states.length) {
      this._currentExerciseIndex.set(index);
      this._exerciseStates.update((s) =>
        s.map((e, i) => {
          if (i === index) return { ...e, status: 'current' };
          if (e.status === 'current') return { ...e, status: 'pending' };
          return e;
        })
      );
    }
  }

  startSetRest(duration = 90): void {
    this._restDuration.set(duration);
    this._restType.set('set');
    this._isResting.set(true);
  }

  startExerciseRest(duration = 90): void {
    this._restDuration.set(duration);
    this._restType.set('exercise');
    this._isResting.set(true);
  }

  endRest(): void {
    this._stopRest();
  }

  skipRest(): void {
    this._stopRest();
  }

  private _stopRest(): void {
    const type = this._restType();
    this._isResting.set(false);
    this._restType.set(null);
    if (type === 'exercise') {
      this.moveToNextExercise();
    }
  }

  setRoutineName(name: string): void {
    this._routineName.set(name);
  }

  reset(): void {
    this._exerciseStates.set([]);
    this._currentExerciseIndex.set(0);
    this._isResting.set(false);
    this._restType.set(null);
    this._workoutId.set(null);
    this._workoutLogId.set(null);
    this._routineName.set('');
    this._exerciseLogsMap.set({});
  }

  isLastExercise(): boolean {
    return this._currentExerciseIndex() >= this._exerciseStates().length - 1;
  }
}
