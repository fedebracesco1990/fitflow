import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { Routine } from '../entities/routine.entity';
import { RoutineExercise } from '../entities/routine-exercise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Routine, RoutineExercise])],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
