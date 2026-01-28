import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { OfflineWorkoutsService, UserRoutinesService } from '../../../../core/services';
import { TriggerCelebration } from '../../../../core/store';
import {
  UserRoutine,
  WorkoutLog,
  ExerciseLog,
  DifficultyLabels,
  RoutineExercise,
} from '../../../../core/models';
import { ButtonComponent } from '../../../../shared';

interface ExerciseGroup {
  routineExercise: RoutineExercise;
  sets: ExerciseLog[];
}

interface SetChange {
  logId: string;
  reps: number;
  weight: number;
  completed: boolean;
}

@Component({
  selector: 'fit-flow-workout',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './workout.component.html',
  styleUrl: './workout.component.scss',
})
export class WorkoutComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly workoutsService = inject(OfflineWorkoutsService);
  private readonly userRoutinesService = inject(UserRoutinesService);
  private readonly store = inject(Store);

  userRoutine = signal<UserRoutine | null>(null);
  workout = signal<WorkoutLog | null>(null);
  currentExerciseIndex = signal(0);
  loading = signal(true);
  error = signal<string | null>(null);

  difficultyLabels = DifficultyLabels;

  // Auto-save state
  private saveSubject = new Subject<SetChange>();
  private saveSubscription?: Subscription;
  savingSetIds = signal<Set<string>>(new Set());
  savedSetIds = signal<Set<string>>(new Set());

  // Weight step for +/- buttons
  readonly weightStep = 2.5;

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
    this.setupAutoSave();
  }

  ngOnDestroy(): void {
    this.saveSubscription?.unsubscribe();
  }

  private setupAutoSave(): void {
    this.saveSubscription = this.saveSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe((change) => this.performSave(change));
  }

  private performSave(change: SetChange): void {
    const w = this.workout();
    if (!w) return;

    this.addToSaving(change.logId);

    this.workoutsService
      .updateExerciseLog(w.id, change.logId, {
        reps: change.reps,
        weight: change.weight,
        completed: change.completed,
      })
      .subscribe({
        next: () => {
          this.updateLocalExerciseLog(change);
          this.removeFromSaving(change.logId);
          this.markAsSaved(change.logId);
        },
        error: (err) => {
          this.removeFromSaving(change.logId);
          this.error.set(err.error?.message || 'Error al guardar');
        },
      });
  }

  private updateLocalExerciseLog(change: SetChange): void {
    const w = this.workout();
    if (!w) return;

    const updatedLogs = w.exerciseLogs.map((log) =>
      log.id === change.logId
        ? { ...log, reps: change.reps, weight: change.weight, completed: change.completed }
        : log
    );

    this.workout.set({ ...w, exerciseLogs: updatedLogs });
  }

  onSetChange(set: ExerciseLog, reps: number, weight: number): void {
    this.updateLocalExerciseLog({
      logId: set.id,
      reps,
      weight,
      completed: set.completed,
    });

    this.saveSubject.next({
      logId: set.id,
      reps,
      weight,
      completed: set.completed,
    });
  }

  toggleSetCompleted(set: ExerciseLog, reps: number, weight: number): void {
    const w = this.workout();
    if (!w) return;

    const newCompleted = !set.completed;
    this.addToSaving(set.id);

    this.workoutsService
      .updateExerciseLog(w.id, set.id, {
        reps,
        weight,
        completed: newCompleted,
      })
      .subscribe({
        next: (response) => {
          this.removeFromSaving(set.id);
          this.refreshWorkout();

          if (response.prResult?.isNewPR && response.prResult.exerciseName) {
            this.store.dispatch(
              new TriggerCelebration({
                exerciseName: response.prResult.exerciseName,
                weight,
                reps,
                type: response.prResult.type as 'weight' | 'volume' | 'both',
              })
            );
          }
        },
        error: (err) => {
          this.removeFromSaving(set.id);
          this.error.set(err.error?.message || 'Error al actualizar');
        },
      });
  }

  adjustWeight(currentWeight: number, delta: number): number {
    return Math.max(0, currentWeight + delta);
  }

  isSaving(setId: string): boolean {
    return this.savingSetIds().has(setId);
  }

  isSaved(setId: string): boolean {
    return this.savedSetIds().has(setId);
  }

  private addToSaving(setId: string): void {
    this.savingSetIds.update((ids) => new Set([...ids, setId]));
  }

  private removeFromSaving(setId: string): void {
    this.savingSetIds.update((ids) => {
      const newIds = new Set(ids);
      newIds.delete(setId);
      return newIds;
    });
  }

  private markAsSaved(setId: string): void {
    this.savedSetIds.update((ids) => new Set([...ids, setId]));
    setTimeout(() => {
      this.savedSetIds.update((ids) => {
        const newIds = new Set(ids);
        newIds.delete(setId);
        return newIds;
      });
    }, 2000);
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

    const reps = Number(lastSet?.reps ?? group.routineExercise.reps ?? 10);
    const rawWeight = lastSet?.weight || group.routineExercise.suggestedWeight || 0;
    const weight = Number(rawWeight) || 0;

    this.workoutsService
      .logExercise(w.id, {
        routineExerciseId: group.routineExercise.id,
        setNumber: nextSetNumber,
        reps,
        weight,
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
