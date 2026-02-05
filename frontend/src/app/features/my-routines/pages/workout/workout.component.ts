import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { OfflineWorkoutsService, UserProgramsService } from '../../../../core/services';
import { TriggerCelebration } from '../../../../core/store';
import {
  WorkoutLog,
  ExerciseLog,
  DifficultyLabels,
  UserProgramExercise,
} from '../../../../core/models';
import { ButtonComponent } from '../../../../shared';

interface ExerciseGroup {
  exercise: UserProgramExercise;
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
  private readonly userProgramsService = inject(UserProgramsService);
  private readonly store = inject(Store);

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
    const routineExercises = w.userProgramRoutine?.exercises || [];

    for (const log of w.exerciseLogs) {
      if (!groups.has(log.exerciseId)) {
        const exercise = routineExercises.find((e) => e.exerciseId === log.exerciseId);
        if (exercise) {
          groups.set(log.exerciseId, {
            exercise,
            sets: [],
          });
        }
      }
      groups.get(log.exerciseId)?.sets.push(log);
    }

    // Ordenar sets por número
    for (const group of groups.values()) {
      group.sets.sort((a, b) => a.setNumber - b.setNumber);
    }

    // Ordenar grupos por orden del ejercicio
    return Array.from(groups.values()).sort((a, b) => a.exercise.order - b.exercise.order);
  });

  // Computed: ejercicio actual con todas sus series
  currentExerciseGroup = computed<ExerciseGroup | null>(() => {
    const groups = this.exerciseGroups();
    return groups[this.currentExerciseIndex()] || null;
  });

  ngOnInit(): void {
    const routineId = this.route.snapshot.paramMap.get('id');
    if (routineId) {
      this.loadAndStartWorkout(routineId);
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

  loadAndStartWorkout(routineId: string): void {
    this.loading.set(true);
    this.workoutsService.startWorkout(routineId).subscribe({
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

  get routineExercises() {
    return this.workout()?.userProgramRoutine?.exercises || [];
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
