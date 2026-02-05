import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutsService } from './workouts.service';
import { WorkoutsController } from './workouts.controller';
import { WorkoutLog } from './entities/workout-log.entity';
import { ExerciseLog } from './entities/exercise-log.entity';
import { UserProgramRoutine } from '../programs/entities/user-program-routine.entity';
import { UserProgramExercise } from '../programs/entities/user-program-exercise.entity';
import { PersonalRecordsModule } from '../personal-records/personal-records.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkoutLog, ExerciseLog, UserProgramRoutine, UserProgramExercise]),
    forwardRef(() => PersonalRecordsModule),
    forwardRef(() => NotificationsModule),
    WebSocketModule,
  ],
  controllers: [WorkoutsController],
  providers: [WorkoutsService],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
