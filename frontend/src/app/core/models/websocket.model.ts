export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

export interface RoutineUpdatedEvent {
  routineId: string;
  routineName: string;
  updatedBy: string;
  updatedAt: Date;
  changes?: string[];
  timestamp: Date;
}

export interface ProgressLoggedEvent {
  workoutLogId: string;
  userId: string;
  userName?: string;
  routineName: string;
  exerciseName?: string;
  timestamp: Date;
  details?: {
    sets?: number;
    reps?: number;
    weight?: number;
  };
}

export interface NotificationEvent {
  notificationId?: string;
  title: string;
  body: string;
  type?: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

export type WebSocketEvent = 'routine.updated' | 'progress.logged' | 'notification.new';
