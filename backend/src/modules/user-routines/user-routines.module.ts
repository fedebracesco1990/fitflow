import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRoutinesService } from './user-routines.service';
import { UserRoutinesController } from './user-routines.controller';
import { UserRoutine } from './entities/user-routine.entity';
import { User } from '../users/entities/user.entity';
import { Routine } from '../routines/entities/routine.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRoutine, User, Routine])],
  controllers: [UserRoutinesController],
  providers: [UserRoutinesService],
  exports: [UserRoutinesService],
})
export class UserRoutinesModule {}
