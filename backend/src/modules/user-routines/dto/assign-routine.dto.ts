import { IsUUID, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { DayOfWeek } from '../../../common/enums/day-of-week.enum';

export class AssignRoutineDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  routineId: string;

  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
