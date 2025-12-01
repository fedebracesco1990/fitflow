import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateWorkoutDto {
  @IsUUID()
  userRoutineId: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
