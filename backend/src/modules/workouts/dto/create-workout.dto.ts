import { IsUUID, IsDateString, IsOptional, IsString, ValidateIf } from 'class-validator';

export class CreateWorkoutDto {
  @ValidateIf((o: CreateWorkoutDto) => !o.userProgramId)
  @IsUUID()
  userRoutineId?: string;

  @ValidateIf((o: CreateWorkoutDto) => !o.userRoutineId)
  @IsUUID()
  userProgramId?: string;

  @ValidateIf((o: CreateWorkoutDto) => !!o.userProgramId)
  @IsUUID()
  programRoutineId?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
