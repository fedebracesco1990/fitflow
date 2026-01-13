import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { ExerciseLog } from '../workouts/entities/exercise-log.entity';
import { WorkoutLog } from '../workouts/entities/workout-log.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import { PersonalRecord } from '../personal-records/entities/personal-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseLog, WorkoutLog, Exercise, PersonalRecord])],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
