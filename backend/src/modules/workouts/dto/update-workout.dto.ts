import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { WorkoutStatus } from '../../../common/enums/workout-status.enum';

export class UpdateWorkoutDto {
  @IsOptional()
  @IsEnum(WorkoutStatus)
  status?: WorkoutStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
