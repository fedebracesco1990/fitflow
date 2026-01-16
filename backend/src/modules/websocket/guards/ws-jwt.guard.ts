import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import type { WsAuthPayload } from '../dto/ws-events.dto';
import type { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();

    try {
      const payload = this.validateToken(client);
      client.data.user = payload;
      return true;
    } catch (error) {
      this.logger.warn(`WebSocket auth failed: ${error}`);
      throw new WsException('Unauthorized');
    }
  }

  validateToken(client: Socket): WsAuthPayload {
    const token = this.extractToken(client);

    if (!token) {
      throw new WsException('Token not provided');
    }

    const secret = this.configService.getOrThrow<string>('jwt.secret');

    const payload = this.jwtService.verify<JwtPayload>(token, { secret });

    if (payload.type !== 'access') {
      throw new WsException('Invalid token type');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }

  private extractToken(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const token = client.handshake.auth?.token as string | undefined;
    if (typeof token === 'string') {
      return token;
    }

    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string') {
      return queryToken;
    }

    return null;
  }
}
