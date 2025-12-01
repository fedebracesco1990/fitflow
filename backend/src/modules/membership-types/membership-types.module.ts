import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipTypesService } from './membership-types.service';
import { MembershipTypesController } from './membership-types.controller';
import { MembershipType } from './entities/membership-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MembershipType])],
  controllers: [MembershipTypesController],
  providers: [MembershipTypesService],
  exports: [MembershipTypesService],
})
export class MembershipTypesModule {}
