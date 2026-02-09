import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { MembershipType } from '../membership-types/entities/membership-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Membership, MembershipType])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
