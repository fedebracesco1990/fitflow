import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsGateway } from './events.gateway';
import { RealtimeService } from './realtime.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('jwt.secret'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EventsGateway, RealtimeService, WsJwtGuard],
  exports: [RealtimeService],
})
export class WebSocketModule {}
