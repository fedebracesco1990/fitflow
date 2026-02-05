import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';
import { Routine } from './entities/routine.entity';
import { RoutineExercise } from './entities/routine-exercise.entity';
import { ProgramRoutine } from '../programs/entities/program-routine.entity';
import { ProgramRoutineExercise } from './entities/program-routine-exercise.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import { TemplatesService } from './templates/templates.service';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Routine,
      RoutineExercise,
      ProgramRoutine,
      ProgramRoutineExercise,
      Exercise,
    ]),
    WebSocketModule,
  ],
  controllers: [RoutinesController],
  providers: [RoutinesService, TemplatesService],
  exports: [RoutinesService],
})
export class RoutinesModule {}
