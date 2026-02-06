import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { Role } from '../../common/enums/role.enum';

@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'],
    credentials: true,
  },
  namespace: '/events',
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private connectedClients = new Map<string, { socketId: string; userId: string; role: Role }>();

  constructor(private readonly wsJwtGuard: WsJwtGuard) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const payload = this.wsJwtGuard.validateToken(client);
      client.data.user = payload;

      await client.join(`user:${payload.userId}`);

      if (payload.role === Role.TRAINER) {
        await client.join(`trainer:${payload.userId}`);
      }

      if (payload.role === Role.ADMIN) {
        await client.join('admin');
      }

      this.connectedClients.set(client.id, {
        socketId: client.id,
        userId: payload.userId,
        role: payload.role,
      });

      this.logger.log(
        `Client connected: ${client.id} (user: ${payload.userId}, role: ${payload.role})`
      );
    } catch (error) {
      this.logger.warn(`Connection rejected: ${error}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      this.logger.log(`Client disconnected: ${client.id} (user: ${clientInfo.userId})`);
      this.connectedClients.delete(client.id);
    }
  }

  emitToUser(userId: string, event: string, data: unknown): void {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToTrainer(trainerId: string, event: string, data: unknown): void {
    this.server.to(`trainer:${trainerId}`).emit(event, data);
  }

  emitToAdmins(event: string, data: unknown): void {
    this.server.to('admin').emit(event, data);
  }

  emitToAll(event: string, data: unknown): void {
    this.server.emit(event, data);
  }

  emitToAllExcept(excludeUserId: string, event: string, data: unknown): void {
    this.server.except(`user:${excludeUserId}`).emit(event, data);
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  isUserConnected(userId: string): boolean {
    return Array.from(this.connectedClients.values()).some((c) => c.userId === userId);
  }
}
