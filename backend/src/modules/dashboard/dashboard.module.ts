import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Payment } from '../payments/entities/payment.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { UserRoutine } from '../user-routines/entities/user-routine.entity';
import { AccessLog } from '../access/entities/access-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Membership, UserRoutine, AccessLog])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
