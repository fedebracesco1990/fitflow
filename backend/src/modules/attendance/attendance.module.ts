import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AccessLog } from '../access/entities/access-log.entity';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [TypeOrmModule.forFeature([AccessLog]), AccessModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
