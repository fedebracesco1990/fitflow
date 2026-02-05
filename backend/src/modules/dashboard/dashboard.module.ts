import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Payment } from '../payments/entities/payment.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { AccessLog } from '../access/entities/access-log.entity';
import { Routine } from '../routines/entities/routine.entity';
import { UserProgram } from '../programs/entities/user-program.entity';
import { PersonalRecord } from '../personal-records/entities/personal-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Membership,
      AccessLog,
      Routine,
      PersonalRecord,
      UserProgram,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
