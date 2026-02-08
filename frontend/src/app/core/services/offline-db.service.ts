import { Injectable, signal } from '@angular/core';
import Dexie, { Table } from 'dexie';
import {
  SyncOperation,
  CachedWorkout,
  CachedExerciseLog,
  CachedProgram,
  CachedRoutine,
  IdMapping,
  CACHE_EXPIRY_MS,
} from '../models';

class FitFlowDatabase extends Dexie {
  syncQueue!: Table<SyncOperation, string>;
  cachedWorkouts!: Table<CachedWorkout, string>;
  cachedExerciseLogs!: Table<CachedExerciseLog, string>;
  cachedPrograms!: Table<CachedProgram, string>;
  cachedRoutines!: Table<CachedRoutine, string>;
  idMappings!: Table<IdMapping, string>;

  constructor() {
    super('FitFlowOfflineDb');

    this.version(2).stores({
      syncQueue: 'id, type, status, timestamp',
      cachedWorkouts: 'id, tempId, userProgramRoutineId, userId, cachedAt',
      cachedExerciseLogs: 'id, tempId, workoutId, cachedAt',
      idMappings: 'tempId, serverId, type, createdAt',
    });

    this.version(3).stores({
      syncQueue: 'id, type, status, timestamp',
      cachedWorkouts: 'id, tempId, userProgramRoutineId, userId, cachedAt',
      cachedExerciseLogs: 'id, tempId, workoutId, cachedAt',
      cachedPrograms: 'id, userId, cachedAt',
      cachedRoutines: 'id, userProgramId, cachedAt',
      idMappings: 'tempId, serverId, type, createdAt',
    });
  }
}

@Injectable({
  providedIn: 'root',
})
export class OfflineDbService {
  private db: FitFlowDatabase;

  private readonly _isReady = signal(false);
  readonly isReady = this._isReady.asReadonly();

  constructor() {
    this.db = new FitFlowDatabase();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.db.open();
      this._isReady.set(true);
      console.log('[OfflineDb] Database initialized');
    } catch (error) {
      console.error('[OfflineDb] Failed to initialize database:', error);
    }
  }

  // Sync Queue Operations
  async addToSyncQueue(operation: SyncOperation): Promise<void> {
    await this.db.syncQueue.add(operation);
  }

  async getSyncQueue(): Promise<SyncOperation[]> {
    return this.db.syncQueue.where('status').equals('pending').sortBy('timestamp');
  }

  async updateSyncOperation(id: string, updates: Partial<SyncOperation>): Promise<void> {
    await this.db.syncQueue.update(id, updates);
  }

  async removeSyncOperation(id: string): Promise<void> {
    await this.db.syncQueue.delete(id);
  }

  async clearCompletedOperations(): Promise<void> {
    await this.db.syncQueue.where('status').equals('completed').delete();
  }

  async getPendingCount(): Promise<number> {
    return this.db.syncQueue.where('status').equals('pending').count();
  }

  // Cached Workouts
  async cacheWorkout(workout: CachedWorkout): Promise<void> {
    await this.db.cachedWorkouts.put(workout);
  }

  async getCachedWorkout(id: string): Promise<CachedWorkout | undefined> {
    return this.db.cachedWorkouts.get(id);
  }

  async getCachedWorkoutByTempId(tempId: string): Promise<CachedWorkout | undefined> {
    return this.db.cachedWorkouts.where('tempId').equals(tempId).first();
  }

  async getOfflineWorkouts(userId: string): Promise<CachedWorkout[]> {
    return this.db.cachedWorkouts.where({ userId, isOfflineCreated: 1 }).toArray();
  }

  async updateCachedWorkout(id: string, updates: Partial<CachedWorkout>): Promise<void> {
    await this.db.cachedWorkouts.update(id, updates);
  }

  async deleteCachedWorkout(id: string): Promise<void> {
    await this.db.cachedWorkouts.delete(id);
  }

  // Cached Exercise Logs
  async cacheExerciseLog(log: CachedExerciseLog): Promise<void> {
    await this.db.cachedExerciseLogs.put(log);
  }

  async getCachedExerciseLogsByWorkout(workoutId: string): Promise<CachedExerciseLog[]> {
    return this.db.cachedExerciseLogs.where('workoutId').equals(workoutId).toArray();
  }

  async updateCachedExerciseLog(id: string, updates: Partial<CachedExerciseLog>): Promise<void> {
    await this.db.cachedExerciseLogs.update(id, updates);
  }

  async deleteCachedExerciseLog(id: string): Promise<void> {
    await this.db.cachedExerciseLogs.delete(id);
  }

  // ID Mappings (temp -> server)
  async addIdMapping(mapping: IdMapping): Promise<void> {
    await this.db.idMappings.put(mapping);
  }

  async getServerIdByTempId(tempId: string): Promise<string | undefined> {
    const mapping = await this.db.idMappings.get(tempId);
    return mapping?.serverId;
  }

  async clearOldMappings(olderThan: number): Promise<void> {
    await this.db.idMappings.where('createdAt').below(olderThan).delete();
  }

  // Cached Programs
  async cacheProgram(program: CachedProgram): Promise<void> {
    await this.db.cachedPrograms.put(program);
  }

  async getCachedProgram(userId: string): Promise<CachedProgram | undefined> {
    return this.db.cachedPrograms.where('userId').equals(userId).first();
  }

  async deleteCachedProgram(id: string): Promise<void> {
    await this.db.cachedPrograms.delete(id);
  }

  // Cached Routines
  async cacheRoutine(routine: CachedRoutine): Promise<void> {
    await this.db.cachedRoutines.put(routine);
  }

  async getCachedRoutine(id: string): Promise<CachedRoutine | undefined> {
    return this.db.cachedRoutines.get(id);
  }

  async getCachedRoutinesByProgram(userProgramId: string): Promise<CachedRoutine[]> {
    return this.db.cachedRoutines.where('userProgramId').equals(userProgramId).toArray();
  }

  // Cache Validation
  isCacheValid(cachedAt: number): boolean {
    return Date.now() - cachedAt < CACHE_EXPIRY_MS;
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    await Promise.all([
      this.db.syncQueue.clear(),
      this.db.cachedWorkouts.clear(),
      this.db.cachedExerciseLogs.clear(),
      this.db.cachedPrograms.clear(),
      this.db.cachedRoutines.clear(),
      this.db.idMappings.clear(),
    ]);
    console.log('[OfflineDb] All data cleared');
  }

  // Clear expired cache
  async clearExpiredCache(): Promise<void> {
    const expiredBefore = Date.now() - CACHE_EXPIRY_MS;
    await Promise.all([
      this.db.cachedWorkouts.where('cachedAt').below(expiredBefore).delete(),
      this.db.cachedExerciseLogs.where('cachedAt').below(expiredBefore).delete(),
      this.db.cachedPrograms.where('cachedAt').below(expiredBefore).delete(),
      this.db.cachedRoutines.where('cachedAt').below(expiredBefore).delete(),
    ]);
  }
}
