import { Role } from '../../../common/enums/role.enum';

export interface WsAuthPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface RoutineUpdatedEvent {
  routineId: string;
  routineName: string;
  updatedBy: string;
  updatedAt: Date;
  changes?: string[];
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

export interface AccessRegisteredEvent {
  accessLogId: string;
  userId: string;
  userName: string;
  granted: boolean;
  reason: string;
  timestamp: Date;
}

export enum WsEventType {
  ROUTINE_UPDATED = 'routine.updated',
  PROGRESS_LOGGED = 'progress.logged',
  NOTIFICATION_NEW = 'notification.new',
  ACCESS_REGISTERED = 'access.registered',
}
