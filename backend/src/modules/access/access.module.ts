import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessController } from './access.controller';
import { AccessService } from './access.service';
import { AccessLog } from './entities/access-log.entity';
import { QrModule } from '../qr/qr.module';
import { MembershipsModule } from '../memberships/memberships.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([AccessLog]), QrModule, MembershipsModule, UsersModule],
  controllers: [AccessController],
  providers: [AccessService],
  exports: [AccessService],
})
export class AccessModule {}
