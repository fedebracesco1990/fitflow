import { Injectable, inject } from '@angular/core';
import { Observable, from, catchError, tap, map } from 'rxjs';
import { Store } from '@ngxs/store';
import { NetworkService } from './network.service';
import { WorkoutsService, UpdateExerciseLogResponse } from './workouts.service';
import { OfflineDbService } from './offline-db.service';
import { SyncQueueService } from './sync-queue.service';
import { AuthState } from '../store';
import {
  WorkoutLog,
  ExerciseLog,
  UpdateExerciseLogDto,
  WorkoutStatus,
  SyncOperationType,
  CachedWorkout,
  CachedExerciseLog,
  UserProgramExercise,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class OfflineWorkoutsService {
  private readonly networkService = inject(NetworkService);
  private readonly workoutsService = inject(WorkoutsService);
  private readonly offlineDb = inject(OfflineDbService);
  private readonly syncQueue = inject(SyncQueueService);
  private readonly store = inject(Store);

  private get userId(): string {
    const user = this.store.selectSnapshot(AuthState.user);
    return user?.userId || 'anonymous';
  }

  startWorkout(routineId: string): Observable<WorkoutLog> {
    if (this.networkService.isOnline()) {
      return this.workoutsService.startWorkout(routineId).pipe(
        tap((workout) => this.cacheWorkoutWithLogs(workout)),
        catchError(() => from(this.startWorkoutOffline(routineId)))
      );
    }

    return from(this.startWorkoutOffline(routineId));
  }

  private async cacheWorkoutWithLogs(workout: WorkoutLog): Promise<void> {
    await this.cacheWorkout(workout, false);
    for (const log of workout.exerciseLogs) {
      await this.cacheExerciseLog(log, workout.id, false);
    }
  }

  private async startWorkoutOffline(routineId: string): Promise<WorkoutLog> {
    const cachedRoutine = await this.offlineDb.getCachedRoutine(routineId);
    if (!cachedRoutine) {
      throw new Error('Routine not found in cache. Connect to internet first.');
    }

    const routine = cachedRoutine.data;
    const tempWorkoutId = this.generateTempId();
    const now = new Date().toISOString();

    // Generate exercise logs from routine exercises
    const exerciseLogs: ExerciseLog[] = this.generateExerciseLogs(routine.exercises, tempWorkoutId);

    const workoutLog: WorkoutLog = {
      id: tempWorkoutId,
      userProgramRoutineId: routineId,
      userProgramRoutine: routine,
      startedAt: now,
      finishedAt: null,
      status: WorkoutStatus.IN_PROGRESS,
      duration: null,
      notes: null,
      exerciseLogs,
      createdAt: now,
    };

    await this.cacheWorkout(workoutLog, true, tempWorkoutId);

    // Cache each exercise log individually
    for (const log of exerciseLogs) {
      await this.cacheExerciseLog(log, tempWorkoutId, true, log.id);
    }

    await this.syncQueue.enqueue(
      SyncOperationType.START_WORKOUT,
      `workouts/start/${routineId}`,
      'POST',
      null,
      tempWorkoutId
    );

    return workoutLog;
  }

  private generateExerciseLogs(exercises: UserProgramExercise[], workoutId: string): ExerciseLog[] {
    const logs: ExerciseLog[] = [];

    for (const exercise of exercises) {
      for (let setNum = 1; setNum <= exercise.sets; setNum++) {
        logs.push({
          id: this.generateTempId(),
          workoutLogId: workoutId,
          exerciseId: exercise.exerciseId,
          exercise: exercise.exercise,
          setNumber: setNum,
          reps: exercise.reps,
          weight: exercise.weight,
          completed: false,
          notes: null,
          rir: null,
          rpe: null,
        });
      }
    }

    return logs;
  }

  private generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  complete(id: string, duration?: number): Observable<WorkoutLog> {
    if (this.networkService.isOnline()) {
      return this.workoutsService
        .complete(id, duration)
        .pipe(tap((workout) => this.cacheWorkout(workout, false)));
    }

    return from(this.completeOfflineWorkout(id, duration));
  }

  private async completeOfflineWorkout(id: string, duration?: number): Promise<WorkoutLog> {
    const cached = await this.offlineDb.getCachedWorkout(id);
    if (!cached) {
      throw new Error('Workout not found in cache');
    }

    const updatedWorkout: WorkoutLog = {
      ...cached.data,
      status: WorkoutStatus.COMPLETED,
      duration: duration || null,
      finishedAt: new Date().toISOString(),
    };

    await this.offlineDb.updateCachedWorkout(id, {
      data: updatedWorkout,
      cachedAt: Date.now(),
    });

    await this.syncQueue.enqueue(
      SyncOperationType.COMPLETE_WORKOUT,
      `workouts/${id}/complete`,
      'PATCH',
      { duration },
      cached.tempId
    );

    return updatedWorkout;
  }

  getById(id: string): Observable<WorkoutLog> {
    if (this.networkService.isOnline()) {
      return this.workoutsService.getById(id).pipe(
        tap((workout) => this.cacheWorkout(workout, false)),
        catchError(() => this.getFromCache(id))
      );
    }

    return this.getFromCache(id);
  }

  private getFromCache(id: string): Observable<WorkoutLog> {
    return from(this.offlineDb.getCachedWorkout(id)).pipe(
      map((cached) => {
        if (!cached) {
          throw new Error('Workout not found in cache');
        }
        return cached.data;
      })
    );
  }

  updateExerciseLog(
    workoutId: string,
    logId: string,
    data: UpdateExerciseLogDto
  ): Observable<UpdateExerciseLogResponse> {
    if (this.networkService.isOnline()) {
      return this.workoutsService
        .updateExerciseLog(workoutId, logId, data)
        .pipe(tap((response) => this.cacheExerciseLog(response.log, workoutId, false)));
    }

    return from(this.updateExerciseLogOffline(workoutId, logId, data));
  }

  private async updateExerciseLogOffline(
    workoutId: string,
    logId: string,
    data: UpdateExerciseLogDto
  ): Promise<UpdateExerciseLogResponse> {
    const cachedLogs = await this.offlineDb.getCachedExerciseLogsByWorkout(workoutId);
    const cached = cachedLogs.find((l) => l.id === logId || l.tempId === logId);

    if (!cached) {
      throw new Error('Exercise log not found in cache');
    }

    const updatedLog: ExerciseLog = {
      ...cached.data,
      reps: data.reps ?? cached.data.reps,
      weight: data.weight ?? cached.data.weight,
      completed: data.completed ?? cached.data.completed,
      notes: data.notes ?? cached.data.notes,
    };

    await this.offlineDb.updateCachedExerciseLog(cached.id, {
      data: updatedLog,
      cachedAt: Date.now(),
    });

    await this.updateCachedWorkoutWithLog(workoutId, updatedLog);

    await this.syncQueue.enqueue(
      SyncOperationType.UPDATE_EXERCISE_LOG,
      `workouts/${workoutId}/exercises/${logId}`,
      'PATCH',
      data,
      cached.tempId
    );

    return { log: updatedLog };
  }

  addExerciseLog(
    workoutId: string,
    data: { exerciseId: string; setNumber: number; reps: number; weight: number | null }
  ): Observable<ExerciseLog> {
    if (this.networkService.isOnline()) {
      return this.workoutsService
        .addExerciseLog(workoutId, data)
        .pipe(tap((log) => this.cacheExerciseLog(log, workoutId, false)));
    }

    return from(this.addExerciseLogOffline(workoutId, data));
  }

  private async addExerciseLogOffline(
    workoutId: string,
    data: { exerciseId: string; setNumber: number; reps: number; weight: number | null }
  ): Promise<ExerciseLog> {
    const tempId = this.generateTempId();
    const log: ExerciseLog = {
      id: tempId,
      workoutLogId: workoutId,
      exerciseId: data.exerciseId,
      setNumber: data.setNumber,
      reps: data.reps,
      weight: data.weight,
      completed: false,
      notes: null,
      rir: null,
      rpe: null,
      exercise: null as never,
    };

    await this.cacheExerciseLog(log, workoutId, true, tempId);

    await this.syncQueue.enqueue(
      SyncOperationType.UPDATE_EXERCISE_LOG,
      `workouts/${workoutId}/exercises`,
      'POST',
      data,
      tempId
    );

    return log;
  }

  deleteExerciseLog(workoutId: string, logId: string): Observable<void> {
    if (this.networkService.isOnline()) {
      return this.workoutsService
        .deleteExerciseLog(workoutId, logId)
        .pipe(tap(() => this.removeCachedExerciseLog(workoutId, logId)));
    }

    return from(this.deleteExerciseLogOffline(workoutId, logId));
  }

  private async deleteExerciseLogOffline(workoutId: string, logId: string): Promise<void> {
    await this.offlineDb.deleteCachedExerciseLog(logId);
    await this.removeCachedExerciseLog(workoutId, logId);

    await this.syncQueue.enqueue(
      SyncOperationType.DELETE_EXERCISE_LOG,
      `workouts/${workoutId}/exercises/${logId}`,
      'DELETE',
      null
    );
  }

  private async cacheWorkout(
    workout: WorkoutLog,
    isOfflineCreated: boolean,
    tempId?: string
  ): Promise<void> {
    const cached: CachedWorkout = {
      id: workout.id,
      tempId,
      userProgramRoutineId: workout.userProgramRoutineId,
      data: workout,
      cachedAt: Date.now(),
      userId: this.userId,
      isOfflineCreated,
    };
    await this.offlineDb.cacheWorkout(cached);
  }

  private async cacheExerciseLog(
    log: ExerciseLog,
    workoutId: string,
    isOfflineCreated: boolean,
    tempId?: string
  ): Promise<void> {
    const cached: CachedExerciseLog = {
      id: log.id,
      tempId,
      workoutId,
      data: log,
      cachedAt: Date.now(),
      isOfflineCreated,
    };
    await this.offlineDb.cacheExerciseLog(cached);
  }

  private async updateCachedWorkoutWithLog(workoutId: string, log: ExerciseLog): Promise<void> {
    const cached = await this.offlineDb.getCachedWorkout(workoutId);
    if (!cached) return;

    const existingIndex = cached.data.exerciseLogs.findIndex((l) => l.id === log.id);

    let updatedLogs: ExerciseLog[];
    if (existingIndex >= 0) {
      updatedLogs = [...cached.data.exerciseLogs];
      updatedLogs[existingIndex] = log;
    } else {
      updatedLogs = [...cached.data.exerciseLogs, log];
    }

    await this.offlineDb.updateCachedWorkout(workoutId, {
      data: { ...cached.data, exerciseLogs: updatedLogs },
      cachedAt: Date.now(),
    });
  }

  private async removeCachedExerciseLog(workoutId: string, logId: string): Promise<void> {
    const cached = await this.offlineDb.getCachedWorkout(workoutId);
    if (!cached) return;

    const updatedLogs = cached.data.exerciseLogs.filter((l) => l.id !== logId);

    await this.offlineDb.updateCachedWorkout(workoutId, {
      data: { ...cached.data, exerciseLogs: updatedLogs },
      cachedAt: Date.now(),
    });
  }
}
