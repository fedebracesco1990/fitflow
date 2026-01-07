import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { MuscleGroupsModule } from '../../modules/muscle-groups/muscle-groups.module';
import { User } from '../../modules/users/entities/user.entity';
import { Exercise } from '../../modules/exercises/entities/exercise.entity';
import { MuscleGroup } from '../../modules/muscle-groups/entities/muscle-group.entity';
import { Routine } from '../../modules/routines/entities/routine.entity';
import { RoutineExercise } from '../../modules/routines/entities/routine-exercise.entity';
import { UserRoutine } from '../../modules/user-routines/entities/user-routine.entity';
import { MembershipType } from '../../modules/membership-types/entities/membership-type.entity';
import { Membership } from '../../modules/memberships/entities/membership.entity';
import { Payment } from '../../modules/payments/entities/payment.entity';
import { AccessLog } from '../../modules/access/entities/access-log.entity';
import { NotificationTemplate } from '../../modules/notifications/entities/notification-template.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Exercise,
      MuscleGroup,
      Routine,
      RoutineExercise,
      UserRoutine,
      MembershipType,
      Membership,
      Payment,
      AccessLog,
      NotificationTemplate,
    ]),
    MuscleGroupsModule,
  ],
  providers: [SeederService],
})
export class SeederModule {}
