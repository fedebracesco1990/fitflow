import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MuscleGroupsService } from './muscle-groups.service';
import { MuscleGroupsController } from './muscle-groups.controller';
import { MuscleGroup } from './entities/muscle-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MuscleGroup])],
  controllers: [MuscleGroupsController],
  providers: [MuscleGroupsService],
  exports: [MuscleGroupsService],
})
export class MuscleGroupsModule {}
