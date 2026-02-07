import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessController } from './access.controller';
import { AccessService } from './access.service';
import { AccessLog } from './entities/access-log.entity';
import { QrModule } from '../qr/qr.module';
import { MembershipsModule } from '../memberships/memberships.module';
import { UsersModule } from '../users/users.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccessLog]),
    QrModule,
    MembershipsModule,
    forwardRef(() => UsersModule),
    WebSocketModule,
  ],
  controllers: [AccessController],
  providers: [AccessService],
  exports: [AccessService],
})
export class AccessModule {}
