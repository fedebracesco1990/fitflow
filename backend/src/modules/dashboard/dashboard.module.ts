import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Payment } from '../payments/entities/payment.entity';
import { Membership } from '../memberships/entities/membership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Membership])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
