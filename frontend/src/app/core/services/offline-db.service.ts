import { Injectable, signal } from '@angular/core';
import Dexie, { Table } from 'dexie';
import {
  SyncOperation,
  CachedRoutine,
  CachedUserRoutine,
  CachedWorkout,
  CachedExerciseLog,
  IdMapping,
  CACHE_EXPIRY_MS,
} from '../models';

class FitFlowDatabase extends Dexie {
  syncQueue!: Table<SyncOperation, string>;
  cachedRoutines!: Table<CachedRoutine, string>;
  cachedUserRoutines!: Table<CachedUserRoutine, string>;
  cachedWorkouts!: Table<CachedWorkout, string>;
  cachedExerciseLogs!: Table<CachedExerciseLog, string>;
  idMappings!: Table<IdMapping, string>;

  constructor() {
    super('FitFlowOfflineDb');

    this.version(1).stores({
      syncQueue: 'id, type, status, timestamp',
      cachedRoutines: 'id, dayOfWeek, userId, cachedAt',
      cachedUserRoutines: 'id, dayOfWeek, userId, cachedAt',
      cachedWorkouts: 'id, tempId, userRoutineId, userId, cachedAt',
      cachedExerciseLogs: 'id, tempId, workoutId, cachedAt',
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

  // Cached Routines
  async cacheRoutine(routine: CachedRoutine): Promise<void> {
    await this.db.cachedRoutines.put(routine);
  }

  async getCachedRoutine(id: string): Promise<CachedRoutine | undefined> {
    const cached = await this.db.cachedRoutines.get(id);
    if (cached && this.isCacheValid(cached.cachedAt)) {
      return cached;
    }
    return undefined;
  }

  async getCachedRoutineByDay(
    userId: string,
    dayOfWeek: string
  ): Promise<CachedRoutine | undefined> {
    const cached = await this.db.cachedRoutines.where({ userId, dayOfWeek }).first();
    if (cached && this.isCacheValid(cached.cachedAt)) {
      return cached;
    }
    return undefined;
  }

  // Cached User Routines (week data)
  async cacheUserRoutine(userRoutine: CachedUserRoutine): Promise<void> {
    await this.db.cachedUserRoutines.put(userRoutine);
  }

  async getCachedUserRoutinesByUser(userId: string): Promise<CachedUserRoutine[]> {
    const cached = await this.db.cachedUserRoutines.where({ userId }).toArray();
    return cached.filter((r) => this.isCacheValid(r.cachedAt));
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

  // Cache Validation
  private isCacheValid(cachedAt: number): boolean {
    return Date.now() - cachedAt < CACHE_EXPIRY_MS;
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    await Promise.all([
      this.db.syncQueue.clear(),
      this.db.cachedRoutines.clear(),
      this.db.cachedUserRoutines.clear(),
      this.db.cachedWorkouts.clear(),
      this.db.cachedExerciseLogs.clear(),
      this.db.idMappings.clear(),
    ]);
    console.log('[OfflineDb] All data cleared');
  }

  // Clear expired cache
  async clearExpiredCache(): Promise<void> {
    const expiredBefore = Date.now() - CACHE_EXPIRY_MS;
    await Promise.all([
      this.db.cachedRoutines.where('cachedAt').below(expiredBefore).delete(),
      this.db.cachedUserRoutines.where('cachedAt').below(expiredBefore).delete(),
      this.db.cachedWorkouts.where('cachedAt').below(expiredBefore).delete(),
      this.db.cachedExerciseLogs.where('cachedAt').below(expiredBefore).delete(),
    ]);
  }
}
