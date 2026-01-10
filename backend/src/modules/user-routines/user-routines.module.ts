import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRoutinesService } from './user-routines.service';
import { UserRoutinesController } from './user-routines.controller';
import { UserRoutine } from './entities/user-routine.entity';
import { User } from '../users/entities/user.entity';
import { Routine } from '../routines/entities/routine.entity';
import { WorkoutLog } from '../workouts/entities/workout-log.entity';
import { ExerciseLog } from '../workouts/entities/exercise-log.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRoutine, User, Routine, WorkoutLog, ExerciseLog]),
    NotificationsModule,
  ],
  controllers: [UserRoutinesController],
  providers: [UserRoutinesService],
  exports: [UserRoutinesService],
})
export class UserRoutinesModule {}
