import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramsController } from './programs.controller';
import { ProgramsService } from './programs.service';
import {
  Program,
  ProgramRoutine,
  ProgramRoutineExercise,
  UserProgram,
  UserProgramRoutine,
  UserProgramExercise,
} from './entities';
import { Routine } from '../routines/entities/routine.entity';
import { RoutineExercise } from '../routines/entities/routine-exercise.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Program,
      ProgramRoutine,
      ProgramRoutineExercise,
      UserProgram,
      UserProgramRoutine,
      UserProgramExercise,
      Routine,
      RoutineExercise,
    ]),
  ],
  controllers: [ProgramsController],
  providers: [ProgramsService],
  exports: [ProgramsService],
})
export class ProgramsModule {}
