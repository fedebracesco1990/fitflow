import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalRecordsService } from './personal-records.service';
import { PersonalRecordsController } from './personal-records.controller';
import { PersonalRecord } from './entities/personal-record.entity';
import { Exercise } from '../exercises/entities/exercise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PersonalRecord, Exercise])],
  controllers: [PersonalRecordsController],
  providers: [PersonalRecordsService],
  exports: [PersonalRecordsService],
})
export class PersonalRecordsModule {}
