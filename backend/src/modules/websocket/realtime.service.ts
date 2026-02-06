import { Injectable, Logger } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import {
  RoutineUpdatedEvent,
  ProgressLoggedEvent,
  NotificationEvent,
  WsEventType,
} from './dto/ws-events.dto';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);

  constructor(private readonly eventsGateway: EventsGateway) {}

  notifyRoutineUpdate(userId: string, event: RoutineUpdatedEvent): void {
    this.logger.debug(`Emitting routine.updated to user:${userId}`);
    this.eventsGateway.emitToUser(userId, WsEventType.ROUTINE_UPDATED, {
      ...event,
      timestamp: new Date(),
    });
  }

  notifyProgressLogged(trainerId: string, event: ProgressLoggedEvent): void {
    this.logger.debug(`Emitting progress.logged to trainer:${trainerId}`);
    this.eventsGateway.emitToTrainer(trainerId, WsEventType.PROGRESS_LOGGED, {
      ...event,
      timestamp: new Date(),
    });
  }

  notifyNewNotification(userId: string, event: NotificationEvent): void {
    this.logger.debug(`Emitting notification.new to user:${userId}`);
    this.eventsGateway.emitToUser(userId, WsEventType.NOTIFICATION_NEW, {
      ...event,
      timestamp: new Date(),
    });
  }

  notifyAdmins(event: string, data: unknown): void {
    this.logger.debug(`Emitting ${event} to admins`);
    this.eventsGateway.emitToAdmins(event, data);
  }

  broadcast(event: string, data: unknown): void {
    this.logger.debug(`Broadcasting ${event} to all`);
    this.eventsGateway.emitToAll(event, data);
  }

  broadcastExcept(excludeUserId: string, event: string, data: unknown): void {
    this.logger.debug(`Broadcasting ${event} to all except user:${excludeUserId}`);
    this.eventsGateway.emitToAllExcept(excludeUserId, event, data);
  }

  isUserOnline(userId: string): boolean {
    return this.eventsGateway.isUserConnected(userId);
  }

  getConnectionsCount(): number {
    return this.eventsGateway.getConnectedClientsCount();
  }
}
