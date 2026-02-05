import { Injectable, signal, computed } from '@angular/core';

export type ExerciseStatus = 'pending' | 'current' | 'completed' | 'skipped';

export interface ExerciseState {
  id: string;
  exerciseId: string;
  name: string;
  status: ExerciseStatus;
  setsCompleted: number;
  totalSets: number;
}

export interface SetState {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
  isCurrent: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class WorkoutStateService {
  private _exerciseStates = signal<ExerciseState[]>([]);
  private _currentExerciseIndex = signal<number>(0);
  private _isResting = signal<boolean>(false);
  private _restDuration = signal<number>(90);
  private _workoutId = signal<string | null>(null);

  readonly exerciseStates = this._exerciseStates.asReadonly();
  readonly currentExerciseIndex = this._currentExerciseIndex.asReadonly();
  readonly isResting = this._isResting.asReadonly();
  readonly restDuration = this._restDuration.asReadonly();
  readonly workoutId = this._workoutId.asReadonly();

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

  initWorkout(workoutId: string, exercises: ExerciseState[]): void {
    // Solo inicializar si es un workout diferente o no hay workout activo
    if (this._workoutId() === workoutId && this._exerciseStates().length > 0) {
      return; // Ya hay un workout activo con este ID, no reinicializar
    }

    this._workoutId.set(workoutId);
    this._exerciseStates.set(
      exercises.map((e, i) => ({
        ...e,
        status: i === 0 ? 'current' : 'pending',
      }))
    );
    this._currentExerciseIndex.set(0);
    this._isResting.set(false);
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

  startRest(duration = 90): void {
    this._restDuration.set(duration);
    this._isResting.set(true);
  }

  endRest(): void {
    this._isResting.set(false);
    this.moveToNextExercise();
  }

  skipRest(): void {
    this._isResting.set(false);
    this.moveToNextExercise();
  }

  reset(): void {
    this._exerciseStates.set([]);
    this._currentExerciseIndex.set(0);
    this._isResting.set(false);
    this._workoutId.set(null);
  }

  isLastExercise(): boolean {
    return this._currentExerciseIndex() >= this._exerciseStates().length - 1;
  }
}
