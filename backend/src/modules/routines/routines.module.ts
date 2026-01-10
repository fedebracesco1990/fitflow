import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';
import { Routine } from './entities/routine.entity';
import { RoutineExercise } from './entities/routine-exercise.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import { UserRoutinesModule } from '../user-routines/user-routines.module';
import { TemplatesService } from './templates/templates.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Routine, RoutineExercise, Exercise]),
    forwardRef(() => UserRoutinesModule),
  ],
  controllers: [RoutinesController],
  providers: [RoutinesService, TemplatesService],
  exports: [RoutinesService],
})
export class RoutinesModule {}
