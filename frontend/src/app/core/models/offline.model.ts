import { WorkoutLog, ExerciseLog } from './workout.model';

export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  PENDING = 'pending',
  ERROR = 'error',
}

export enum SyncOperationType {
  CREATE_WORKOUT = 'create_workout',
  UPDATE_WORKOUT = 'update_workout',
  START_WORKOUT = 'start_workout',
  COMPLETE_WORKOUT = 'complete_workout',
  LOG_EXERCISE = 'log_exercise',
  UPDATE_EXERCISE_LOG = 'update_exercise_log',
  DELETE_EXERCISE_LOG = 'delete_exercise_log',
}

export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  endpoint: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  payload: unknown;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retryCount: number;
  tempId?: string;
  serverId?: string;
  error?: string;
}

export interface CachedWorkout {
  id: string;
  tempId?: string;
  userProgramRoutineId: string;
  data: WorkoutLog;
  cachedAt: number;
  userId: string;
  isOfflineCreated: boolean;
}

export interface CachedExerciseLog {
  id: string;
  tempId?: string;
  workoutId: string;
  data: ExerciseLog;
  cachedAt: number;
  isOfflineCreated: boolean;
}

export interface IdMapping {
  tempId: string;
  serverId: string;
  type: 'workout' | 'exercise_log';
  createdAt: number;
}

export interface OfflineState {
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingOperations: number;
  lastSyncAt: number | null;
  lastError: string | null;
}

export const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
export const MAX_RETRY_COUNT = 3;
export const RETRY_DELAY_MS = 1000;
