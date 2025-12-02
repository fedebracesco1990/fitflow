import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { MuscleGroupsModule } from '../../modules/muscle-groups/muscle-groups.module';
import { User } from '../../modules/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User]), MuscleGroupsModule],
  providers: [SeederService],
})
export class SeederModule {}
